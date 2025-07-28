const { Pool } = require('pg');
require('dotenv').config();

// Log configuration for debugging (mask password)
console.log('Database configuration:', {
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || '5432',
  user: process.env.PGUSER || 'rbarnes',
  database: process.env.PGDATABASE || 'restaurant',
  password: '****'
});

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || '5432',
  user: process.env.PGUSER || 'rbarnes',
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'restaurant',
  max: 10, // Maximum number of clients in the pool (equivalent to connectionLimit)
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000 // Timeout after 2 seconds if connection fails
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err.message);
  process.exit(-1);
});

// Test connection on startup
(async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database');
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0].now);
  } catch (err) {
    console.error('Failed to connect to PostgreSQL database:', err.message);
    console.error('Error details:', err.stack);
    process.exit(-1);
  } finally {
    if (client) client.release();
  }
})();

// Export the pool for querying
module.exports = pool;
