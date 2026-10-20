const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const ROOT = path.resolve(__dirname, '..', '..');
const DB_PATH = path.join(ROOT, 'data', 'spaceedu.sqlite');
const SEED = path.join(ROOT, 'data', 'seed.json');
const SCHEMA = path.join(__dirname, 'schema.sql');

if (!fs.existsSync(SEED)) { console.error('Missing ' + SEED); process.exit(1); }
if (!fs.existsSync(SCHEMA)) { console.error('Missing ' + SCHEMA); process.exit(1); }

const db = new Database(DB_PATH);
db.exec(fs.readFileSync(SCHEMA, 'utf8'));

// THE FIX: Read file, strip BOM (invisible characters), and parse
let rawSeed = fs.readFileSync(SEED, 'utf8');
rawSeed = rawSeed.replace(/^\uFEFF/, ''); // Removes the invisible BOM character
const rows = JSON.parse(rawSeed);

const insert = db.prepare(`
  INSERT OR REPLACE INTO bodies (id, name, kind, parent_id, radius_km, mass_kg, orbit_period_days, semi_major_au, eccentricity, inclination_deg, color_hex, texture_url, description, source, discovered)
  VALUES (@id, @name, @kind, @parent_id, @radius_km, @mass_kg, @orbit_period_days, @semi_major_au, @eccentricity, @inclination_deg, @color_hex, @texture_url, @description, @source, @discovered)
`);

const tx = db.transaction(list => {
  for (const r of list) {
    insert.run({
      id: r.id, name: r.name, kind: r.kind, parent_id: r.parent_id || null,
      radius_km: r.radius_km || null, mass_kg: r.mass_kg || null, orbit_period_days: r.orbit_period_days || null,
      semi_major_au: r.semi_major_au || null, eccentricity: r.eccentricity || null, inclination_deg: r.inclination_deg || null,
      color_hex: r.color_hex || null, texture_url: r.texture_url || null, description: r.description || null,
      source: r.source || null, discovered: r.discovered || null
    });
  }
});
tx(rows);
console.log(`\n[seed] Success! Wrote ${rows.length} bodies to ${DB_PATH}\n`);
db.close();