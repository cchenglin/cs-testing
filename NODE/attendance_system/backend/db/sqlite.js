// db/sqlite.js  (CommonJS)
require('dotenv').config();
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

// 你可以在 .env 設 SQLITE_FILE，否則預設 ./attendance.sqlite 放在 backend 旁
const SQLITE_FILE =
  process.env.SQLITE_FILE ||
  path.join(__dirname, '../../attendance.sqlite');

async function getSQLite() {
  const db = await open({
    filename: SQLITE_FILE,
    driver: sqlite3.Database,
  });
  // FK 約束（SQLite 預設關掉）
  await db.exec('PRAGMA foreign_keys = ON;');
  return db;
}

module.exports = { getSQLite, SQLITE_FILE };
