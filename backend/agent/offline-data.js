// backend/agent/offline-data.js
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', '..', 'data', 'spaceedu.sqlite');
const db = new Database(DB_PATH);

const planets = [
  { name: 'Kepler-452b', year: 2015, dist: 1400, r: 1.63, m: 5.0 },
  { name: 'TRAPPIST-1e', year: 2017, dist: 40, r: 0.92, m: 0.69 },
  { name: 'Proxima Centauri b', year: 2016, dist: 4.2, r: 1.1, m: 1.07 },
  { name: '51 Pegasi b', year: 1995, dist: 50.9, r: 1.9, m: 0.47 },
  { name: 'Kepler-186f', year: 2014, dist: 580, r: 1.17, m: 1.5 },
  { name: 'GJ 667 Cc', year: 2011, dist: 23.6, r: 1.54, m: 3.8 },
  { name: 'Kepler-442b', year: 2015, dist: 1206, r: 1.34, m: 2.3 },
  { name: 'Kepler-62f', year: 2013, dist: 1200, r: 1.41, m: 2.8 },
  { name: 'Kepler-22b', year: 2011, dist: 600, r: 2.4, m: 9.1 },
  { name: 'Ross 128 b', year: 2017, dist: 11, r: 1.1, m: 1.35 }
];

const insert = db.prepare(`
  INSERT OR REPLACE INTO bodies (id, name, kind, parent_id, radius_km, mass_kg, orbit_period_days, description, source)
  VALUES (@id, @name, 'exoplanet', null, @radius_km, @mass_kg, null, @description, 'NASA Exoplanet Archive')
`);

const tx = db.transaction(() => {
  for (const p of planets) {
    insert.run({
      id: 'exo:' + p.name.toLowerCase().replace(/\s+/g, '-'),
      name: p.name,
      radius_km: p.r * 6371,
      mass_kg: p.m * 5.972e24,
      description: 'Discovered in ' + p.year + '. Distance: ' + p.dist + ' light years.'
    });
  }
});

tx();
console.log('✅ Successfully added ' + planets.length + ' exoplanets!');
db.close();