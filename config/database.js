const { Pool } = require('pg');
require('dotenv').config();

let pool = null;
let isConnected = false;

// Try to connect to PostgreSQL
async function initializeDatabase() {
  try {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'eventku_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      connectionTimeoutMillis: 5000, // 5 seconds timeout
    });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    isConnected = true;
    console.log('✅ Connected to PostgreSQL database');
    return true;
  } catch (error) {
    console.log('⚠️  PostgreSQL not available, using localStorage fallback');
    console.log('   To use PostgreSQL, please install and configure it first');
    isConnected = false;
    return false;
  }
}

function getPool() {
  return pool;
}

function isDatabaseConnected() {
  return isConnected;
}

module.exports = {
  initializeDatabase,
  getPool,
  isDatabaseConnected
};