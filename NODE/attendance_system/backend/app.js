// === 環境設定與套件載入 ===
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('./db');
const { writeOnchainByHash, readSeenByHash, getAbiFunctions } = require('./blockchain');
const { ethers } = require("ethers");
const RPC_URL = process.env.RPC_URL;

// ⭐ 新增：用 ethers 建一個 provider 來查交易資訊（本機 Hardhat）
let txProvider = null;
if (process.env.RPC_URL) {
  txProvider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  console.log("[Onchain TX] provider 初始化完成:", process.env.RPC_URL);
} else {
  console.warn("[Onchain TX] 沒有 RPC_URL，無法查交易細節");
}

// ⭐ 新增：用來查詢 tx receipt 的 provider（Hardhat 本機 or 之後的正式鏈）
let rpcProvider = null;
if (RPC_URL) {
  try {
    rpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL);
    console.log("✅ rpcProvider 已建立，用於查詢交易資訊");
  } catch (e) {
    console.warn("⚠️ 建立 rpcProvider 失敗：", e.message);
  }
}

console.log('=== Backend boot ===');
console.log('File:', __filename);

// ✅ 必須先宣告 app 才能使用 app.use()
const app = express();
const PORT = process.env.PORT || 3001;
// 加入這段在檔案最上面（其他 import 下面）
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}
// === CORS 設定 ===
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://cs-testing.vercel.app",
  "https://cs-testing-fb3txlqqy-chengs-projects-2602bdd2.vercel.app",
  "https://*.ngrok-free.app",        // 改成萬用
  "https://*.ngrok.io",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => 
      o.startsWith('http://localhost') || 
      o.startsWith('https://*.ngrok') ? 
        origin.match(o.replace('*.', '.*')) : 
        origin === o
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


// === 基本設定 ===
app.use(express.json());

// === 測試與診斷路由 ===
app.get('/whoami', (req, res) =>
  res.json({ ok: true, pid: process.pid, port: process.env.PORT || 3001 })
);

app.get('/', (req, res) => res.json({ ok: true, msg: 'backend alive' }));
app.get('/__ping', (req, res) => res.json({ ok: true, now: Date.now() }));

app.get("/__dbping", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1+1 AS two");
    res.json({
      ok: true,
      result: rows[0] || {two: 2}
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      detail: String(e.message || e)
    });
  }
});


app.get('/__tables', async (req, res) => {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ ok: false, detail: String(e.message || e) });
  }
});

// === 工具函式 ===
function signJWT(payload, expiresIn = '2h') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'no token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// === 註冊 === 
app.post('/register', async (req, res) => {
  try {
    const { username, password, name, grade, classroom } = req.body || {};

    if (!username || !password || !name || !grade || !classroom) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    // 🔹 MySQL 查詢格式
    const [exist] = await pool.query(
      'SELECT * FROM students WHERE username = ?',
      [username]
    );

    if (exist.length > 0) {
      return res.status(400).json({ error: '該帳號已被註冊' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO students (username, name, grade, classroom, password)
       VALUES (?, ?, ?, ?, ?)`,
      [username, name, grade, classroom, password_hash]
    );

    res.json({ ok: true, msg: '註冊成功！請返回登入頁面。' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'register failed', detail: e.message });
  }
});



// === 登入 ===
app.post('/login', async (req, res) => { 
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: '缺少 username 或 password' });
    }

    let user = null, role = null;

    // 🔹 學生登入（MySQL）
    const [stu] = await pool.query(
      'SELECT * FROM students WHERE username = ?',
      [username]
    );

    // ⭐ 加入防呆 — 如果查不到資料，直接回「帳號不存在」
    if (stu && stu.length > 0) {
      user = stu[0];
      role = 'student';

      const ok = await bcrypt.compare(password, user.password || '');
      if (!ok) return res.status(401).json({ error: '密碼錯誤' });

      const token = signJWT({ uid: user.student_id, role });
      return res.json({
        token,
        role,
        uid: user.student_id,
        name: user.name,
        username: user.username
      });
    }

    // 🔹 老師登入（MySQL）
    const [t] = await pool.query(
      'SELECT * FROM teachers WHERE username = ?',
      [username]
    );

    // ⭐ 加入防呆 — 如果查不到資料，直接回「帳號不存在」
    if (t && t.length > 0) {
      user = t[0];
      role = 'teacher';

      if (password !== user.password) {
        return res.status(401).json({ error: '密碼錯誤' });
      }

      const token = signJWT({ uid: user.teacher_id, role });
      return res.json({
        token,
        role,
        uid: user.teacher_id,
        name: user.name,
        username: user.username
      });
    }

    // ❌ 兩邊都查不到 → 直接回「帳號不存在」
    return res.status(401).json({ error: '帳號不存在' });

  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'login failed', detail: String(e.message || e) });
  }
});




// === 新增：註冊學生的 public_key ===
app.post("/students/register-public-key", async (req, res) => {
  try {
    const { student_id, publicKey } = req.body;

    if (!student_id || !publicKey) {
      return res.status(400).json({ error: "缺少 student_id 或 publicKey" });
    }

    await pool.query(
      "UPDATE students SET public_key = ? WHERE student_id = ?",
      [publicKey, student_id]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ register-public-key error:", err);
    return res.status(500).json({ error: "server error" });
  }
});

// === 老師建立課程 ===
app.post('/create-course', async (req, res) => {
  try {
    const { teacher_id, course_name, description } = req.body || {};
    if (!teacher_id || !course_name) {
      return res.status(400).json({ error: '缺少 teacher_id 或 course_name' });
    }

    // 自動產生 6 碼課程代碼
    const course_code = Math.random().toString(36).substring(2, 8).toUpperCase();

    await pool.query(
      `INSERT INTO courses (teacher_id, course_name, course_code, description)
       VALUES (?, ?, ?, ?)`,
      [teacher_id, course_name, course_code, description || null]
    );

    res.json({ ok: true, msg: '課程建立成功', course_code });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'create course failed', detail: e.message });
  }
});
// === 老師查詢自己建立的課程 ===
app.get('/teacher/:teacher_id/courses', async (req, res) => {
  try {
    const { teacher_id } = req.params;
    console.log("[Teacher Courses] teacher_id =", teacher_id);

    const [rows] = await pool.query(
      `SELECT id AS course_id, course_name, course_code, description, created_at 
       FROM courses 
       WHERE teacher_id = ?`,
      [teacher_id]
    );

    console.log("[Teacher Courses] found:", rows);
    res.json(Array.isArray(rows) ? rows : []);
  } catch (e) {
    console.error("[Teacher Courses] Error:", e);
    res.status(500).json({ error: '無法取得課程列表', detail: e.message });
  }
});


// === 查詢課程基本資料（含授課老師名稱） ===
app.get('/course/:course_id', async (req, res) => {
  try {
    const { course_id } = req.params;
    console.log("[Course Info] course_id =", course_id);

    const [rows] = await pool.query(
      `SELECT 
         c.id AS course_id,
         c.course_name,
         c.course_code,
         c.description,
         c.created_at,
         COALESCE(t.name, t.username) AS teacher_name
       FROM courses c
       LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
       WHERE c.id = ?`,
      [course_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "找不到該課程" });
    }

    res.json(rows[0]);
  } catch (e) {
    console.error("[Course Info] Error:", e);
    res.status(500).json({ error: "無法取得課程資料", detail: e.message });
  }
});


// === 取得課程的學生名單 ===
app.get('/course/:course_id/students', async (req, res) => {
  try {
    const { course_id } = req.params;
    console.log("[Course Students] 查詢課程學生 course_id =", course_id);

    const [rows] = await pool.query(
      `SELECT 
          s.student_id,
          s.username,
          s.name,
          s.grade,
          s.classroom,
          a.status,
          a.date,
          a.time
       FROM enrollments e
       JOIN students s ON e.student_id = s.student_id
       LEFT JOIN attendance a 
         ON a.student_id = s.student_id AND a.course_id = e.course_id
       WHERE e.course_id = ?
       ORDER BY s.name ASC`,
      [course_id]
    );

    console.log("[Course Students] found:", rows.length, "students");
    res.json(rows);
  } catch (e) {
    console.error("[Course Students] Error:", e);
    res.status(500).json({ error: "無法取得學生清單", detail: e.message });
  }
});

// === 查詢學生所加入的課程（含老師名稱） ===
app.get('/student/:username/courses', async (req, res) => {
  const { username } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT 
         c.id, 
         c.course_name, 
         c.course_code, 
         COALESCE(t.name, t.username) AS teacher_name
       FROM enrollments e
       JOIN students s ON e.student_id = s.student_id
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
       WHERE s.username = ?`,
      [username]
    );

    res.json(rows);
  } catch (err) {
    console.error('[Get Student Courses] Error:', err);
    res.status(500).json({ error: '查詢學生課程失敗', detail: err.message });
  }
});


// === 查詢學生已加入的課程 ===
app.get('/classes', async (req, res) => {
  const { student_id } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT c.* 
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = ?`,
      [student_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('[Student Classes] Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// === 學生加入課程 ===
app.post('/student/:username/join', async (req, res) => {
  const { username } = req.params;
  const { course_code } = req.body;

  try {
    // 找出該學生的 student_id
    const [[student]] = await pool.query(
      'SELECT student_id FROM students WHERE username = ?',
      [username]
    );

    if (!student) {
      return res.status(404).json({ error: '找不到學生帳號' });
    }

    // 確認課程是否存在
    const [[course]] = await pool.query(
      'SELECT id FROM courses WHERE course_code = ?',
      [course_code]
    );

    if (!course) {
      return res.status(404).json({ error: '無效的課程代碼' });
    }

    const student_id = student.student_id;
    const course_id = course.id;

    // 檢查是否已經加入過課程
    const [exists] = await pool.query(
      'SELECT 1 FROM enrollments WHERE student_id = ? AND course_id = ?',
      [student_id, course_id]
    );

    if (exists.length > 0) {
      return res.status(400).json({ error: '已加入過該課程' });
    }

    // 寫入新資料
    await pool.query(
      'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
      [student_id, course_id]
    );

    res.json({ success: true, message: '成功加入課程！' });
  } catch (err) {
    console.error('[Join Class] Error:', err);
    res.status(500).json({ error: '伺服器錯誤', detail: err.message });
  }
});


// 開始點名：建立一個新的 session，並更新課程目前的 session
app.post("/course/:course_id/attendance/start", async (req, res) => {
  const { course_id } = req.params;
  const { duration } = req.body || {}; // 秒數，可選（NULL 表示不自動關閉）

  try {
    // 1️⃣ 建立新的點名場次
    const [result] = await pool.query(
      "INSERT INTO attendance_sessions (course_id, started_at, duration, is_open) VALUES (?, NOW(), ?, 1)",
      [course_id, duration ?? null]
    );
    const newSessionId = result.insertId;

    // 2️⃣ 更新課程目前開啟狀態與 session
    await pool.query(
      "UPDATE courses SET is_attendance_open = 1, current_session_id = ? WHERE id = ?",
      [newSessionId, course_id]
    );

    // 3️⃣ 為所有學生建立「缺席」紀錄（避免 data_hash / ipfs_cid / onchain_txhash 為 NULL）
    await pool.query(
      `INSERT INTO attendance (
          course_id, student_id, session_id, date, time, status, data_hash, ipfs_cid, onchain_txhash
        )
        SELECT ?, e.student_id, ?, CURDATE(), CURTIME(), 'absent', '', '', ''
        FROM enrollments e
        WHERE e.course_id = ?
          AND NOT EXISTS (
            SELECT 1 FROM attendance a
            WHERE a.course_id = ? AND a.session_id = ? AND a.student_id = e.student_id
          )AND e.student_id IS NOT NULL`,
      [course_id, newSessionId, course_id, course_id, newSessionId]
    );

    console.log(`✅ [Start Attendance] course_id=${course_id}, session_id=${newSessionId}`);
    res.json({ success: true, sessionId: newSessionId });
  } catch (err) {
    console.error("❌ [Start Attendance]", err);
    res.status(500).json({ success: false, error: "開啟點名失敗" });
  }
});


// 結束點名：關閉目前的 session 並更新課程狀態
app.post("/course/:course_id/attendance/stop", async (req, res) => {
  const { course_id } = req.params;

  try {
    // 取出目前的 session
    const [rows] = await pool.query(
      "SELECT current_session_id FROM courses WHERE id = ?",
      [course_id]
    );
    const currentSessionId = rows[0]?.current_session_id;

    // 關閉 session（若有）
    if (currentSessionId) {
      await pool.query(
        "UPDATE attendance_sessions SET is_open = 0 WHERE id = ? ",
        [currentSessionId]
      );
    }

    // 更新課程狀態
    await pool.query(
      "UPDATE courses SET is_attendance_open = 0, current_session_id = NULL WHERE id = ?",
      [course_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ [Stop Attendance]", err);
    res.status(500).json({ success: false, error: "結束點名失敗" });
  }
});


// ✅ 取得課程所有學生的出席紀錄（含場次時間 + 上鏈資訊）
app.get("/course/:course_id/attendance/records", async (req, res) => {
  const { course_id } = req.params;
  try {
    console.log(`[Fetch Attendance Records] course_id = ${course_id}`);

    const [rows] = await pool.query(
      `SELECT 
         a.course_id,
         a.student_id,
         s.name,
         s.grade,
         s.classroom,
         a.status,
         -- ✅ 日期與時間修正：若 date/time 為 NULL，顯示簽到時間
         COALESCE(
           DATE_FORMAT(a.date, '%Y/%m/%d'),
           DATE_FORMAT(a.signed_at, '%Y/%m/%d')
         ) AS display_date,
         COALESCE(
           DATE_FORMAT(a.time, '%H:%i:%s'),
           DATE_FORMAT(a.signed_at, '%H:%i:%s')
         ) AS display_time,
         a.session_id,
         sess.started_at,
         -- ✅ 顯示上鏈資訊（若需要可顯示在老師端畫面）
         a.data_hash,
         a.onchain_txhash,
         a.ipfs_cid
       FROM attendance a
       LEFT JOIN students s 
         ON a.student_id = s.student_id
         OR a.student_id = CAST(s.username AS UNSIGNED)
       LEFT JOIN attendance_sessions sess 
         ON a.session_id = sess.id
       WHERE a.course_id = ?
       ORDER BY 
         COALESCE(sess.started_at, a.signed_at, CONCAT(a.date, ' ', a.time)) DESC,
         s.name ASC`,
      [course_id]
    );

    console.log(`[Fetch Attendance Records] found ${rows.length} rows`);
    res.json(rows);
  } catch (err) {
    console.error("❌ [Fetch Attendance Records]", err);
    res.status(500).json({ error: "無法取得出席紀錄" });
  }
});



// 查詢課程是否有進行中的簽到
app.get('/course/:course_id/active-session', async (req, res) => {
  const { course_id } = req.params;
  const [rows] = await pool.query(
    'SELECT * FROM attendance_sessions WHERE course_id = ? AND is_active = TRUE LIMIT 1',
    [course_id]
  );
  if (rows.length > 0) res.json(rows[0]);
  else res.json({ is_active: false });
});

// 1️⃣ 查詢學生已加入的課程
app.get('/student/:username/courses', async (req, res) => {
  const { username } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.course_name, c.course_code, c.description
       FROM enrollments e
       JOIN students s ON e.student_id = s.student_id
       JOIN courses c ON e.course_id = c.id
       JOIN teachers t ON c.teacher_id = t.id
       WHERE s.username = ?`,
      [username]
    );
    res.json(rows);
  } catch (err) {
    console.error('[Get Student Courses]', err);
    res.status(500).json({ error: '查詢學生課程失敗' });
  }
});


// 2️⃣ 查詢學生在該課程的簽到紀錄
// ✅ 學生端查詢簽到紀錄（時間往前推 8 小時顯示）
app.get('/student/:username/course/:course_id/attendance', async (req, res) => {
  const { username, course_id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT 
         -- ✅ 將時間往前推 8 小時（減去 +08:00）
         DATE_FORMAT(DATE_SUB(CONCAT(a.date, ' ', a.time), INTERVAL 8 HOUR), '%Y/%m/%d ') AS base_date,
         CASE 
           WHEN HOUR(a.time) < 12 THEN '上午 '
  ELSE '下午 '
END AS ampm,
DATE_FORMAT(a.time, '%H:%i:%s') AS time_part,
         a.status,
         a.session_id
       FROM attendance a
       JOIN students s ON a.student_id = s.student_id
       WHERE s.username = ? 
         AND a.course_id = ?
       ORDER BY a.date ASC, a.time ASC`,
      [username, course_id]
    );

    // ✅ 合併三段字串顯示
    const formatted = rows.map((r) => ({
      ...r,
      display_time: `${r.base_date}${r.ampm}${r.time_part}`,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('[Student Attendance Records]', err);
    res.status(500).json({ error: '查詢學生簽到紀錄失敗' });
  }
});



// 查詢學生個人資料
app.get('/student/:username/profile', async (req, res) => {
  const { username } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT student_id, username, name, grade, classroom, created_at 
       FROM students 
       WHERE username = ?`,
      [username]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: '找不到學生資料' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('[Get Student Profile]', err);
    res.status(500).json({ error: '伺服器錯誤，無法查詢資料' });
  }
});


// ✅ 更新學生個人資料
app.put("/student/:username/profile", async (req, res) => {
  const { username } = req.params;
  const { grade, classroom, password } = req.body;

  try {
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE students SET grade=?, classroom=?, password=? WHERE username=?`,
        [grade, classroom, hashed, username]
      );
    } else {
      await pool.query(
        `UPDATE students SET grade=?, classroom=? WHERE username=?`,
        [grade, classroom, username]
      );
    }

    res.json({ success: true, message: "資料更新成功" });
  } catch (err) {
    console.error("[Update Student Profile]", err);
    res.status(500).json({ error: "伺服器錯誤，無法更新資料" });
  }
});

// ✅ 查詢目前課程的點名狀態（學生端／老師端輪詢用）
app.get("/course/:course_id/attendance/status", async (req, res) => {
  const { course_id } = req.params;

  try {
    const [[course]] = await pool.query(
      "SELECT is_attendance_open, current_session_id FROM courses WHERE id = ?",
      [course_id]
    );

    if (!course) {
      return res.json({ isOpen: false, sessionId: null, remainingSeconds: null, message: "找不到課程" });
    }

    let isOpen = !!course.is_attendance_open;
    let sessionId = course.current_session_id || null;
    let remainingSeconds = null;

    if (sessionId) {
      const [[session]] = await pool.query(
        "SELECT started_at, duration, is_open FROM attendance_sessions WHERE id = ?",
        [sessionId]
      );

      if (session) {
        // duration = NULL 代表不自動關閉 => remainingSeconds 保持 null
        if (session.duration != null) {
          const started = new Date(session.started_at).getTime();
          const endsAt = started + Number(session.duration) * 1000;
          const now = Date.now();
          remainingSeconds = Math.max(0, Math.ceil((endsAt - now) / 1000));

          // ⏰ 僅在有設定 duration 時才會自動關閉
          if (remainingSeconds === 0 && session.is_open === 1) {
            await pool.query("UPDATE attendance_sessions SET is_open = 0 WHERE id = ?", [sessionId]);
            await pool.query(
              "UPDATE courses SET is_attendance_open = 0, current_session_id = NULL WHERE id = ?",
              [course_id]
            );
            isOpen = false;
            sessionId = null;
          } else {
            isOpen = session.is_open === 1;
          }
        } else {
          // 沒有 duration，狀態依 is_open
          isOpen = session.is_open === 1;
          remainingSeconds = null;
        }
      } else {
        // 🧹 session 不存在，清理課程狀態
        await pool.query(
          "UPDATE courses SET current_session_id = NULL, is_attendance_open = 0 WHERE id = ?",
          [course_id]
        );
        isOpen = false;
        sessionId = null;
        remainingSeconds = null;
      }
    }

    res.json({ isOpen, sessionId, remainingSeconds });
  } catch (err) {
    console.error("❌ [Attendance Status Error]", err);
    res.status(500).json({ isOpen: false, sessionId: null, remainingSeconds: null, message: "伺服器錯誤" });
  }
});



// ✅ 學生簽到：確保時間以台灣時區（UTC+8）寫入
app.post("/course/:course_id/attendance/checkin", async (req, res) => {
  const { course_id } = req.params;
  let { student_id } = req.body;

  if (!student_id)
    return res.status(400).json({ success: false, message: "缺少 student_id" });

  try {
    const [[course]] = await pool.query(
      "SELECT is_attendance_open, current_session_id FROM courses WHERE id = ?",
      [course_id]
    );
    if (!course)
      return res.status(404).json({ success: false, message: "課程不存在" });
    if (course.is_attendance_open !== 1 || !course.current_session_id)
      return res.status(403).json({ success: false, message: "目前未開放簽到" });

    const sessionId = course.current_session_id;

    if (typeof student_id === "string") {
      const [result] = await pool.query(
        "SELECT student_id FROM students WHERE username = ? LIMIT 1",
        [student_id]
      );
      student_id = result.length > 0 ? result[0].student_id : Number(student_id);
    }

    // ✅ 強制以 CONVERT_TZ(NOW(), '+00:00', '+08:00') 寫入台灣時間
    await pool.query(
      `INSERT INTO attendance (course_id, student_id, session_id, date, time, status)
       VALUES (?, ?, ?, 
               DATE(CONVERT_TZ(NOW(), '+00:00', '+08:00')),
               TIME(CONVERT_TZ(NOW(), '+00:00', '+08:00')),
               'present')
       ON DUPLICATE KEY UPDATE 
           status='present',
           date=DATE(CONVERT_TZ(NOW(), '+00:00', '+08:00')),
           time=TIME(CONVERT_TZ(NOW(), '+00:00', '+08:00'))`,
      [course_id, student_id, sessionId]
    );

    console.log(`[Check-in ✅] student_id=${student_id} 成功簽到`);
    res.json({ success: true, message: "簽到成功！" });
  } catch (err) {
    console.error("❌ [Student Check-in]", err);
    res.status(500).json({ success: false, message: "伺服器錯誤", detail: err.message });
  }
});

// 發 nonce（Step B）
app.post("/nonces/issue", async (req, res) => {
  try {
    const { student_id, course_id, ttl = 300 } = req.body || {};
    if (!student_id || !course_id)
      return res.status(400).json({ error: "缺少 student_id 或 course_id" });

    const nonce = crypto.randomBytes(16).toString("hex");
    const [r] = await pool.query(
      `INSERT INTO nonces (student_id, course_id, nonce, issued_at, expires_at, used)
       VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? SECOND), 0)`,
      [student_id, course_id, nonce, ttl]
    );

    const [rows] = await pool.query("SELECT * FROM nonces WHERE id=?", [r.insertId]);
    res.json({ id: r.insertId, nonce, expires_at: rows[0]?.expires_at });
  } catch (e) {
    console.error("❌ issue nonce failed:", e);
    res.status(500).json({ error: "issue nonce failed", detail: String(e.message || e) });
  }
});


// 簽到並上鏈（Step C）
app.post("/attendance/signin", async (req, res) => {
  try {
    const { student_id, course_id, nonceId, signedAt, ipfsCid } = req.body || {};
    if (!student_id || !course_id || !nonceId || !signedAt)
      return res.status(400).json({ error: "缺少必要欄位" });

    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    // ⭐ 新增：提取前端傳來的 message、signature
    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    const { message, signature } = req.body;

    if (!message || !signature) {
      return res.status(400).json({ error: "缺少簽章資料（message 或 signature）" });
    }

    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    // ⭐ 新增：從 DB 取出學生 public_key（錢包地址）
    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    const [[stu]] = await pool.query(
      "SELECT public_key FROM students WHERE student_id = ? LIMIT 1",
      [student_id]
    );

    if (!stu || !stu.public_key) {
      return res.status(400).json({
        error: "學生尚未註冊公鑰，無法驗證簽章"
      });
    }

    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    // ⭐ 新增：verifyMessage 驗證 signer address
    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    let recoveredAddress;
    try {
      recoveredAddress = ethers.utils.verifyMessage(message, signature);
    } catch (err) {
      console.error("❌ 簽章格式錯誤：", err);
      return res.status(400).json({
        error: "簽章格式錯誤（verifyMessage 失敗）",
        detail: err.message
      });
    }

    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    // ⭐ 新增：比對 recoveredAddress === DB 中的 public_key
    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    if (!recoveredAddress ||
        recoveredAddress.toLowerCase() !== stu.public_key.toLowerCase()) {
      return res.status(401).json({
        error: "簽章驗證失敗：不是本人簽到",
        detail: {
          recovered: recoveredAddress,
          expected: stu.public_key
        }
      });
    }

    console.log("🟢 Signature verified OK:", recoveredAddress);

    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    // ⭐ ⚠️ 以下為你的原始程式碼（完全不動） ⚠️
    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐

    // 驗證 nonce 是否有效
    const [[nonceRow]] = await pool.query(
      "SELECT * FROM nonces WHERE id=? AND used=0 AND expires_at>NOW()",
      [nonceId]
    );
    if (!nonceRow)
      return res.status(400).json({ error: "nonce 無效或已過期" });

    // 計算雜湊
    const payloadStr = JSON.stringify({
      student_id,
      course_id,
      nonce: nonceRow.nonce,
      ipfsCid,
      signedAt,
    });
    const data_hash = crypto.createHash("sha256").update(payloadStr).digest("hex");

    // 檢查是否已有預設 absent 紀錄
    const [existing] = await pool.query(
      "SELECT id FROM attendance WHERE student_id=? AND course_id=? AND session_id = (SELECT current_session_id FROM courses WHERE id=?) ORDER BY id DESC LIMIT 1",
      [student_id, course_id, course_id]
    );

    let attendanceId;
    if (existing.length > 0) {
      attendanceId = existing[0].id;
      await pool.query(
        `UPDATE attendance 
         SET status='present',
             signed_at=FROM_UNIXTIME(?),
             ipfs_cid=?,
             data_hash=?
         WHERE id=?`,
        [signedAt, ipfsCid, data_hash, attendanceId]
      );
    } else {
      const [ins] = await pool.query(
        `INSERT INTO attendance 
         (student_id, course_id, signed_at, ipfs_cid, data_hash, status)
         VALUES (?, ?, FROM_UNIXTIME(?), ?, ?, 'present')`,
        [student_id, course_id, signedAt, ipfsCid, data_hash]
      );
      attendanceId = ins.insertId;
    }

    // 上鏈
    console.log(`📤 [上鏈中] data_hash = 0x${data_hash}`);
    const txHash = await writeOnchainByHash("0x" + data_hash);
    console.log(`⏳ 等待區塊確認中... txHash = ${txHash}`);

    // 更新上鏈結果
    await pool.query(
      "UPDATE attendance SET onchain_txhash=?, data_hash=CONCAT('0x', TRIM(data_hash)) WHERE id=?",
      [txHash, attendanceId]
    );

    // 將 nonce 標記為已使用
    await pool.query("UPDATE nonces SET used=1 WHERE id=?", [nonceId]);

    res.json({
      ok: true,
      attendance_id: attendanceId,
      data_hash: "0x" + data_hash,
      onchain_txhash: txHash,
    });
  } catch (e) {
    console.error("❌ signin error:", e);
    res.status(500).json({ error: "signin failed", detail: String(e.message || e) });
  }
});




//讀鏈紀錄（Step D）⭐ 修改版：加詳細 log，避免靜悄悄 500
app.get("/onchain/seen/:datahash", async (req, res) => {
  try {
    let { datahash } = req.params;

    // ⭐ 新增：基本防呆 + log
    console.log("🔍 [/onchain/seen] 收到參數 =", datahash);
    if (!datahash) {
      return res
        .status(400)
        .json({ ok: false, seen: false, error: "缺少 datahash 參數" });
    }

    datahash = datahash.trim();

    // ⭐ 調用區塊鏈查詢
    const r = await readSeenByHash(datahash);
    console.log("🔍 [/onchain/seen] 查詢結果 =", r);

    // 預期 r 會是 { seen: true/false, ... }
    return res.json(r);
  } catch (e) {
    console.error("❌ [/onchain/seen] readSeenByHash 發生錯誤：", e);
    res.status(500).json({
      ok: false,
      seen: false,
      error: "read onchain failed",
      detail: String(e.message || e),
    });
  }
});


app.get("/__debug/abi", (req, res) => {
  try {
    res.json({
      contract: process.env.CONTRACT_ADDRESS,
      functions: getAbiFunctions(),
    });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// ✅ 顯示課程內所有簽到的鏈上狀態
app.get("/onchain/debug/:course_id", async (req, res) => {
  const { course_id } = req.params;

  try {
    console.log(`🧩 [Debug Onchain] 查詢課程 ${course_id} 的上鏈狀態`);

    // 從資料庫抓出該課程的簽到紀錄
    const [records] = await pool.query(
      `SELECT 
        a.id,
        a.student_id,
        s.name AS student_name,
        a.session_id,
        a.status,
        a.data_hash,
        a.onchain_txhash
      FROM attendance a
      LEFT JOIN students s ON a.student_id = s.student_id
      WHERE a.course_id = ?
      ORDER BY a.id DESC`,
      [course_id]
    );

    // 如果沒有資料
    if (!records.length) {
      return res.json({ ok: false, message: "沒有簽到資料" });
    }

    // 查詢每筆資料是否存在鏈上
    const results = [];
    for (const r of records) {
      let seen = false;
      try {
        const chainResult = await readSeenByHash(r.data_hash);
        seen = !!chainResult.seen;
      } catch (err) {
        console.warn(`⚠️ 查詢鏈上失敗 [id=${r.id}]：`, err.message);
      }

      results.push({
        id: r.id,
        student_id: r.student_id,
        student_name: r.student_name || "(未知學生)",
        username: r.username,
        session_id: r.session_id,
        status: r.status,
        data_hash: r.data_hash,
        txHash: r.onchain_txhash,
        onchain_seen: seen,
      });
    }

    console.log(`✅ [Debug Onchain] 已查詢 ${results.length} 筆紀錄`);
    res.json({ ok: true, course_id, results });
  } catch (err) {
    console.error("❌ [Debug Onchain Error]", err);
    res.status(500).json({ ok: false, error: "查詢上鏈狀態失敗", detail: err.message });
  }
});

// ✅ 新增：確認上鏈結果
app.post("/attendance/confirm_onchain/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      "UPDATE attendance SET onchain_txhash = IF(onchain_txhash='', 'manual_confirmed', onchain_txhash) WHERE id = ?",
      [id]
    );
    res.json({ ok: true, affected: result.affectedRows });
  } catch (e) {
    console.error("❌ [Confirm Onchain Error]", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ⭐⭐ 新增：查詢單一交易的區塊高度 / from / to（簡易 block explorer） ⭐⭐
app.get("/onchain/tx/:txhash", async (req, res) => {
  try {
    if (!txProvider) {
      return res.status(500).json({ ok: false, error: "RPC_URL 未設定，無法查詢交易" });
    }

    const { txhash } = req.params;
    console.log(`[Onchain TX] 查詢交易：${txhash}`);

    const receipt = await txProvider.getTransactionReceipt(txhash);

    if (!receipt) {
      return res.json({
        ok: false,
        txHash: txhash,
        message: "找不到這筆交易（可能還沒打包進區塊或 txHash 錯誤）",
      });
    }

    res.json({
      ok: true,
      txHash: txhash,
      blockNumber: receipt.blockNumber,
      status: receipt.status,       // 1 = 成功, 0 = 失敗
      from: receipt.from,
      to: receipt.to,
      gasUsed: receipt.gasUsed.toString(),
    });
  } catch (e) {
    console.error("[Onchain TX] 查詢失敗:", e);
    res.status(500).json({ ok: false, error: e.message || String(e) });
  }
});

// ⭐⭐ 新增：查詢「單一點名 Session」的鏈上詳情 ⭐⭐
app.get("/onchain/session/:session_id", async (req, res) => {
  const { session_id } = req.params;

  try {
    // ① 先查這個 session 的基本資訊 + 課堂總人數 + 出席人數
    const [[sessionRow]] = await pool.query(
      `
      SELECT 
        s.id AS session_id,
        s.course_id,
        s.started_at,
        c.course_name,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = s.course_id) AS class_size,
        (SELECT COUNT(*) FROM attendance a WHERE a.session_id = s.id AND a.status = 'present') AS present_count
      FROM attendance_sessions s
      JOIN courses c ON c.id = s.course_id
      WHERE s.id = ?
      `,
      [session_id]
    );

    if (!sessionRow) {
      return res.status(404).json({ ok: false, error: "找不到該點名 Session" });
    }

    // ② 取出這次點名的所有出席紀錄，連學生資料
    const [rows] = await pool.query(
      `
      SELECT 
        a.id AS attendance_id,
        a.student_id,
        st.username,
        st.name,
        a.status,
        a.data_hash,
        a.onchain_txhash
      FROM attendance a
      JOIN students st ON st.student_id = a.student_id
      WHERE a.session_id = ?
      ORDER BY a.student_id ASC
      `,
      [session_id]
    );

    // ③ 對每一筆 record 查鏈上 & tx receipt（如果有 provider）
    const enriched = [];
    for (const r of rows) {
      let verifiedOnChain = false;
      let blockNumber = null;
      let gasUsed = null;

      // 3-1 查鏈上 seen(dataHash)
      if (r.data_hash && r.data_hash.trim() !== "") {
        try {
          const seenResult = await readSeenByHash(r.data_hash);
          verifiedOnChain = !!(seenResult && seenResult.seen);
        } catch (e) {
          console.warn("⚠️ [onchain/session] 查詢 seen 失敗:", r.data_hash, e.message);
        }
      }

      // 3-2 若有 txHash 且有 provider，就查交易 receipt
      if (rpcProvider && r.onchain_txhash) {
        try {
          const receipt = await rpcProvider.getTransactionReceipt(r.onchain_txhash);
          if (receipt) {
            blockNumber = receipt.blockNumber ?? null;
            gasUsed = receipt.gasUsed ? receipt.gasUsed.toString() : null;
          }
        } catch (e) {
          console.warn("⚠️ [onchain/session] getTransactionReceipt 失敗:", r.onchain_txhash, e.message);
        }
      }

      enriched.push({
        attendance_id: r.attendance_id,
        student_id: r.student_id,
        username: r.username,
        name: r.name,
        status: r.status,
        data_hash: r.data_hash,
        txHash: r.onchain_txhash,
        verifiedOnChain,
        blockNumber,
        gasUsed,
      });
    }

    // ④ 回傳給前端使用
    res.json({
      ok: true,
      session: {
        session_id: sessionRow.session_id,
        course_id: sessionRow.course_id,
        course_name: sessionRow.course_name,
        started_at: sessionRow.started_at,
        class_size: sessionRow.class_size || 0,
        present_count: sessionRow.present_count || 0,
      },
      records: enriched,
    });
  } catch (e) {
    console.error("❌ [/onchain/session/:session_id] error:", e);
    res
      .status(500)
      .json({ ok: false, error: "查詢 Session 鏈上詳情失敗", detail: String(e.message || e) });
  }
});

// ⭐ 取得某次點名 session 的所有出席紀錄（含課堂人數與出席人數）
app.get("/course/:course_id/session/:session_id/records", async (req, res) => {
  try {
    const { course_id, session_id } = req.params;

    // 1️⃣ 抓出該課程所有學生 → totalStudents
    const [students] = await pool.query(
      `SELECT st.student_id, st.username, st.name 
        FROM enrollments e
        JOIN students st ON e.student_id = st.student_id
        WHERE e.course_id = ?`,
      [course_id]
    );

    const totalStudents = students.length;

    // 2️⃣ 抓該次 session 的出席紀錄
    const [records] = await pool.query(
      `SELECT a.*, s.username, s.name
       FROM attendance a
       JOIN students s ON a.student_id = s.student_id
       WHERE a.course_id = ? AND a.session_id = ?
       ORDER BY a.student_id ASC`,
      [course_id, session_id]
    );

    // 3️⃣ 逐筆查鏈上狀態
    const detailedRecords = await Promise.all(
      records.map(async (r) => {
        let onchain = false;
        try {
          if (r.data_hash && r.data_hash !== "0x") {
            const chain = await readSeenByHash(r.data_hash);
            onchain = chain.seen === true;
          }
        } catch (err) {
          onchain = false;
        }

        return {
          id: r.id,
          student_id: r.student_id,
          username: r.username,
          name: r.name,
          status: r.status,
          data_hash: r.data_hash,
          onchain_seen: onchain,
          onchain_txhash: r.onchain_txhash || null
        };
      })
    );

    // 4️⃣ 計算出席人數（present）
    const presentCount = detailedRecords.filter(r => r.status === "present").length;

    // 5️⃣ 回傳
    res.json({
      ok: true,
      sessionInfo: {
        session_id,
        course_id,
        totalStudents,
        presentCount
      },
      records: detailedRecords
    });

  } catch (err) {
    console.error("❌ [Session Explorer Error]:", err);
    res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

app.get("/attendance/verify/:attendance_id", async (req, res) => {
  try {
    const { attendance_id } = req.params;

    // 1️⃣ 查 DB 取得簽到紀錄
    const [[record]] = await pool.query(
      `SELECT student_id, data_hash, onchain_txhash, signer_address
       FROM attendance WHERE id=? LIMIT 1`,
      [attendance_id]
    );

    if (!record || !record.onchain_txhash) {
      return res.status(404).json({ error: "找不到記錄或尚未上鏈" });
    }

    // 2️⃣ 透過 txHash 查詢鏈上真實交易資訊
    const txInfo = await provider.getTransaction(record.onchain_txhash);
    const onchainSigner = txInfo.from;

    // 3️⃣ 比對是否為本人
    const isValid = onchainSigner.toLowerCase() === record.signer_address.toLowerCase();

    res.json({
      ok: true,
      attendance_id,
      student_id: record.student_id,
      onchain_signer: onchainSigner,
      db_signer: record.signer_address,
      txHash: record.onchain_txhash,
      data_hash: record.data_hash,
      isValid,
      status: isValid ? "本人簽到 ✔" : "疑似代簽 ⚠",
    });
  } catch (e) {
    res.status(500).json({ error: "verify failed", detail: String(e.message) });
  }
});


// === 404 錯誤處理 ===
app.use((req, res) => {
  res.status(404).json({ error: 'not found', method: req.method, url: req.originalUrl });
});

// === 啟動伺服器 ===
const server = app.listen(PORT, '0.0.0.0', () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`✅ Server running at http://localhost:${port}`);
  console.log(`✅ 本機測試：http://localhost:${port}`);
  console.log(`✅ 手機/其他電腦測試：http://${getLocalIP()}:${port}`);
  console.log(`✅ ngrok 外部測試：https://hirable-blake-deficiently.ngrok-free.dev`);
});

server.on('close', () => console.log('⚠️ server closed'));
process.on('uncaughtException', (err) => console.error('❌ uncaughtException:', err));
process.on('unhandledRejection', (reason) => console.error('❌ unhandledRejection:', reason));
process.on('exit', (code) => console.log('ℹ️ process exit with code:', code));
setInterval(() => {}, 1 << 30);
