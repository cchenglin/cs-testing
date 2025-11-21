import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

const pool = await mysql.createPool({
  host: "localhost",
  user: "root",
  password: "你的MySQL密碼", // 🔹改成你自己的密碼
  database: "attendance_system",
});

async function fixPasswords() {
  const [students] = await pool.query("SELECT student_id, username, password FROM students");
  for (const s of students) {
    // 如果密碼不是 bcrypt 格式（沒 $2b$ 開頭），就重新加密
    if (!s.password.startsWith("$2b$")) {
      const hashed = await bcrypt.hash(s.password, 10);
      await pool.query("UPDATE students SET password=? WHERE student_id=?", [hashed, s.student_id]);
      console.log(`✅ 已加密 ${s.username} 的密碼`);
    } else {
      console.log(`🔹 ${s.username} 已是加密格式，略過`);
    }
  }
  console.log("全部處理完成！");
  process.exit(0);
}

fixPasswords();
