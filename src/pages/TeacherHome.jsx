import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";

export default function TeacherHome({ user, onLogout, attendanceList }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  // 📘 載入老師的課程清單
  useEffect(() => {
    if (!user?.uid) return;

    fetch(`http://localhost:3001/teacher/${user.uid}/courses`)
      .then((res) => res.json())
      .then((data) => {
        console.log("課程回傳資料:", data);
        if (Array.isArray(data)) setCourses(data);
        else setCourses([]);
      })
      .catch((err) => {
        console.error("載入課程失敗:", err);
        setCourses([]);
      });
  }, [user?.uid]);

return (
  <div className="page">
    <h1>👩‍🏫 老師主頁</h1>
    <p className="dim">
      歡迎回來，<b>{user.username}</b>
    </p>

    {/* ✅ 建立課程 + 登出放同一行 */}
    <div className="row mb-20">
      <button
        className="btn btn-primary"
        onClick={() => navigate("/create-course")}
      >
        ➕ 建立新課程
      </button>

      <button className="btn btn-danger" onClick={onLogout}>
        🚪 登出
      </button>
    </div>

    {/* 📚 課程列表 */}
    <h2 className="section-title">📚 我的課程</h2>
    {courses.length === 0 ? (
      <p className="dim">尚未建立任何課程</p>
    ) : (
      <ul className="list">
        {courses.map((c) => (
          <li
            key={c.course_id}
            className="item clickable"
            onClick={() => navigate(`/course/${c.course_id}`)}
          >
            <div className="item-title">{c.course_name}</div>
            <div className="item-sub">代碼：{c.course_code || "未設定"}</div>
          </li>
        ))}
      </ul>
    )}
  </div>
);


}
