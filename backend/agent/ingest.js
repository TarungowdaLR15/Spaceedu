const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', '..', 'data', 'spaceedu.sqlite');
const db = new Database(DB_PATH);

async function runAgent() {
  console.log('\n🤖 Starting Data Agent...');
  
  // FIXED: Using correct column names (pl_bmasse instead of pl_mass)
  // and formatting the URL cleanly to avoid 400 Bad Request errors.
  const query = "select top 50 pl_name,pl_rade,pl_bmasse,pl_orbper,disc_year,sy_dist from pscomppars";
  const url = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(query)}&format=json`;

  try {
    console.log('🛰️  Fetching data from NASA Exoplanet Archive...');
    const response = await fetch(url);
    
    if (!response.ok) {
        // If it fails, print the actual server response to help debug
        const text = await response.text();
        throw new Error(`NASA API error: ${response.status} - ${text.slice(0, 100)}`);
    }
    
    const planets = await response.json();
    console.log(`📥 Downloaded ${planets.length} planets from NASA.`);

    const insert = db.prepare(`
      INSERT OR REPLACE INTO bodies (id, name, kind, parent_id, radius_km, mass_kg, orbit_period_days, description, source)
      VALUES (@id, @name, @kind, @parent_id, @radius_km, @mass_kg, @orbit_period_days, @description, @source)
    `);

    let added = 0;
    
    const tx = db.transaction(() => {
      for (const p of planets) {
        if (!p.pl_name) continue;

        // Convert Earth radii to km
        const radius_km = p.pl_rade ? (p.pl_rade * 6371) : null;
        
        // Convert Earth masses to kg (1 Earth mass = 5.972e24 kg)
        const mass_kg = p.pl_bmasse ? (p.pl_bmasse * 5.972e24) : null;
        
        insert.run({
          id: `exo:nasa-${p.pl_name.toLowerCase().replace(/\s+/g, '-')}`,
          name: p.pl_name,
          kind: 'exoplanet',
          parent_id: null,
          radius_km: radius_km,
          mass_kg: mass_kg,
          orbit_period_days: p.pl_orbper || null,
          description: `Discovered in ${p.disc_year || 'unknown year'}. Distance: ${p.sy_dist ? Math.round(p.sy_dist) + ' parsecs' : 'Unknown'}.`,
          source: 'NASA Exoplanet Archive'
        });
        added++;
      }
    });

    tx();
    console.log(`✅ Data Agent finished! Added ${added} exoplanets to the database.\n`);

  } catch (error) {
    console.error('❌ Data Agent failed:', error.message);
  } finally {
    db.close();
  }
}

runAgent();