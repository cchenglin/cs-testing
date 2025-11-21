// db/init_sqlite.js  (CommonJS)
require('dotenv').config();
const { getSQLite, SQLITE_FILE } = require('./sqlite');

(async () => {
  const db = await getSQLite();
  console.log('🔧 建立資料表到：', SQLITE_FILE);

  // 建表（欄位名盡量與 MySQL 相同，型別用 SQLite 友善的）
  await db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      teacher_id   INTEGER PRIMARY KEY AUTOINCREMENT,
      username     TEXT UNIQUE NOT NULL,
      name         TEXT,
      password     TEXT NOT NULL,
      created_at   TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS students (
      student_id   INTEGER PRIMARY KEY AUTOINCREMENT,
      username     TEXT UNIQUE NOT NULL,
      name         TEXT,
      password     TEXT NOT NULL,
      grade        TEXT,
      classroom    TEXT,
      created_at   TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS courses (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id          INTEGER NOT NULL,
      course_name         TEXT NOT NULL,
      course_code         TEXT UNIQUE NOT NULL,
      description         TEXT,
      created_at          TEXT DEFAULT (datetime('now')),
      is_attendance_open  INTEGER DEFAULT 0,
      current_session_id  INTEGER,
      FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id  INTEGER NOT NULL,
      course_id   INTEGER NOT NULL,
      joined_at   TEXT DEFAULT (datetime('now')),
      UNIQUE(student_id, course_id),
      FOREIGN KEY (student_id) REFERENCES students(student_id),
      FOREIGN KEY (course_id)  REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id   INTEGER NOT NULL,
      started_at  TEXT DEFAULT (datetime('now')),
      duration    INTEGER NOT NULL,
      is_open     INTEGER DEFAULT 1,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id    INTEGER NOT NULL,
      student_id    INTEGER NOT NULL,
      status        TEXT NOT NULL, -- present/absent
      created_at    TEXT DEFAULT (datetime('now')),
      UNIQUE(session_id, student_id),
      FOREIGN KEY (session_id) REFERENCES attendance_sessions(id),
      FOREIGN KEY (student_id) REFERENCES students(student_id)
    );
  `);

  // 預設老師帳號（明碼密碼，符合你先前的老師登入邏輯）
  await db.exec(`
    INSERT OR IGNORE INTO teachers (teacher_id, username, name, password)
    VALUES
      (1, 'teacher1', '老師一', 'password1'),
      (2, 'teacher2', '老師二', 'password2'),
      (3, 'teacher3', '老師三', 'password3'),
      (4, 'teacher4', '老師四', 'password4');
  `);

  // 預設學生（注意：你先前的學生密碼是 bcrypt，比較保險你可改回明碼或在前端重新註冊）
  // 這裡先用明碼，因為你 /login 對學生是 bcrypt.compare()，如果要直用請把它改成明碼比較（但我建議保留 bcrypt 安全）
  // 若你要沿用 bcrypt，請在這裡塞入 bcrypt 雜湊後的密碼字串（可用 node 腳本處理）。
  await db.exec(`
    INSERT OR IGNORE INTO students (student_id, username, name, password, grade, classroom)
    VALUES
      (1, '123', '學生123', '$2b$10$NKE9I5mJ9...<請換成對應的bcrypt雜湊>','1','A'),
      (2, '56',  '學生56',  '$2b$10$NKE9I5mJ9...<請換成對應的bcrypt雜湊>','2','B');
  `);

  console.log('✅ SQLite 初始化完成');
  await db.close();
})().catch(e => {
  console.error('❌ SQLite 初始化失敗：', e);
  process.exit(1);
});
