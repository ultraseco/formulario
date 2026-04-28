require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    console.log('Creando tablas en Neon...');
    await pool.query(schema);
    console.log('¡Tablas creadas con éxito!');
  } catch (err) {
    console.error('Error al crear las tablas:', err);
  } finally {
    await pool.end();
  }
}

setupDatabase();
