// db/index.js  (CommonJS)
require('dotenv').config();
const mysql = require('mysql2/promise');

// DB_TYPE: mysql | sqlite
const DB_TYPE = (process.env.DB_TYPE || 'mysql').trim().toLowerCase();

let pool = null;

// --- MySQL 模式：直接回傳 mysql2 pool（不動你現有寫法）---
async function getMySQLPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'attendance_system',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

// --- SQLite 模式：做一個“假 pool”，只實作 .query(sql, params) ---
async function getSQLitePoolLike() {
  const { getSQLite } = require('./sqlite'); // ← 下面 b) 會寫
  // 提供與 mysql2 相容的 API： pool.query() 會回傳 [rows]
  return {
    async query(sql, params = []) {
      const db = await getSQLite();
      // 簡易判斷：SELECT 用 all，其他用 run
      const isSelect = /^\s*select/i.test(sql);
      if (isSelect) {
        const rows = await db.all(sql, params);
        await db.close();
        return [rows];
      } else {
        const info = await db.run(sql, params);
        await db.close();
        // 讓 insert/更新也有結構，不過多數程式其實只用 SELECT
        return [{ affectedRows: info.changes, insertId: info.lastID }];
      }
    },
  };
}

// 導出與你原本一致的東西（你原本用的是 require('./db') 或 pool.query）：
module.exports = (async () => {
  if (DB_TYPE === 'sqlite') {
    console.log('📦 DB: SQLite mode');
    return await getSQLitePoolLike();
  } else {
    console.log('🐬 DB: MySQL mode');
    return await getMySQLPool();
  }
})();
