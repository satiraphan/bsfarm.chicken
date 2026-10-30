const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'broiler',
  password: process.env.DB_PASSWORD || 'broiler123',
  database: process.env.DB_NAME || 'broiler_farm',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  charset: 'utf8mb4',
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;
