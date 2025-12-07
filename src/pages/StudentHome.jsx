// src/pages/StudentHome.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentHome({ username, onLogout }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (username) fetchStudentCourses();
  }, [username]);

  async function fetchStudentCourses() {
    try {
      const res = await fetch(`http://localhost:3001/student/${username}/courses`);
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ 無法取得學生課程:", err);
    }
  }

  return (
  <div className="page">
    <h1>學生頁面，歡迎 {username}</h1>

    <div className="row mb-20">
      <button
        onClick={() => navigate("/join-class", { state: { username } })}
        className="btn btn-primary btn-join"
      >
        加入課程
      </button>

      <button onClick={() => navigate("/student/profile")} className="btn btn-warning mr-8">
        查看個人資料
      </button>

      <button onClick={onLogout} className="btn btn-danger">
        登出
      </button>
    </div>

    <h2 className="section-title">已加入的課程</h2>
    {courses.length === 0 ? (
      <p className="dim">尚未加入任何課程</p>
    ) : (
      <ul className="list">
        {courses.map((course) => (
          <li
            key={`${course.id}-${course.course_code}`}
            onClick={() => navigate(`/student/course/${course.id}`)}
            className="item clickable"
          >
            <div className="item-title">
              {course.course_name}（{course.course_code}）
            </div>
            <div className="item-sub">
              授課老師：{course.teacher_name || "未知"}
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);
}
