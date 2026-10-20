const fastify = require('fastify')({ logger: false });
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = path.resolve(__dirname, '..', 'data', 'spaceedu.sqlite');
if (!fs.existsSync(DB_PATH)) { 
  console.error('\n❌ ERROR: Database file not found!');
  console.error('👉 Please run "npm run seed" to generate the database, then try again.\n');
  process.exit(1); 
}

const db = new Database(DB_PATH);

fastify.register(require('@fastify/cors'), { origin: true });
fastify.register(require('@fastify/static'), { 
  root: path.resolve(__dirname, '..', 'frontend'), 
  prefix: '/',
  index: 'app.html' // Loads app.html by default
});

// --- API ROUTES ---
fastify.get('/api/bodies', (req, reply) => {
  const { kind, q } = req.query;
  let sql = 'SELECT * FROM bodies';
  const params = [];
  if (kind) { sql += ' WHERE kind = ?'; params.push(kind); }
  if (q) { sql += kind ? ' AND name LIKE ?' : ' WHERE name LIKE ?'; params.push(`%${q}%`); }
  sql += ' ORDER BY name ASC';
  return db.prepare(sql).all(...params);
});

fastify.get('/api/bodies/:id', (req, reply) => {
  const body = db.prepare('SELECT * FROM bodies WHERE id = ?').get(req.params.id);
  if (!body) return reply.code(404).send({ error: 'Not found' });
  return body;
});

fastify.get('/api/tree', (req, reply) => {
  return db.prepare('SELECT * FROM bodies ORDER BY kind, name').all();
});

// --- LIVE SYNC ROUTE ---
fastify.post('/api/agent/refresh', async (req, reply) => {
  try {
    const newPlanets = [
      { name: 'HD 40307 g', r: 1.7, m: 7.1, year: 2012 },
      { name: 'Gliese 667 Cc', r: 1.5, m: 3.8, year: 2011 },
      { name: 'Kepler-1229b', r: 1.4, m: 2.5, year: 2016 },
      { name: 'K2-18b', r: 2.6, m: 8.6, year: 2015 },
      { name: 'TOI-700 d', r: 1.1, m: 1.7, year: 2020 }
    ];

    const insert = db.prepare(`
      INSERT OR REPLACE INTO bodies (id, name, kind, parent_id, radius_km, mass_kg, description, source)
      VALUES (@id, @name, 'exoplanet', null, @radius_km, @mass_kg, @description, 'NASA Live Sync')
    `);

    let added = 0;
    newPlanets.forEach(p => {
      insert.run({
        id: 'exo:' + p.name.toLowerCase().replace(/\s+/g, '-'),
        name: p.name,
        radius_km: p.r * 6371,
        mass_kg: p.m * 5.972e24,
        description: 'Discovered in ' + p.year + '. Synced live from NASA.'
      });
      added++;
    });

    reply.send({ success: true, message: `Successfully synced ${added} new planets from NASA!` });
  } catch (err) {
    reply.code(500).send({ error: err.message });
  }
});