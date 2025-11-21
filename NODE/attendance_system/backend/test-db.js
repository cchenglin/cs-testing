require('dotenv').config();
const pool = require('./db');

async function testConnection() {
  try {
    const [rows] = await pool.query('SHOW TABLES;');
    console.log('✅ 成功連線 MySQL！目前表：');
    console.log(rows);
  } catch (err) {
    console.error('❌ 連線失敗：', err.message);
  } finally {
    pool.end();
  }
}

testConnection();