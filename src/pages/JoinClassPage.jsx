import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // ✅ 新增：用來接收上一頁傳的 username
import BackToHomeButton from "../components/BackToHomeButton";

export default function JoinClassPage() {
  const location = useLocation(); // ✅ 取得上一頁的傳值
  const username = location.state?.username; // ✅ 從 state 取出 username

  const [classCode, setClassCode] = useState("");
  const [joinedClasses, setJoinedClasses] = useState([]);

  useEffect(() => {
    if (username) {
      fetchJoinedClasses();
    }
  }, [username]);

  // ✅ 改成以 username 查詢該學生課程
  async function fetchJoinedClasses() {
    try {
      const res = await fetch(`http://localhost:3001/student/${username}/courses`);
      const data = await res.json();
      setJoinedClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ 載入課程錯誤:", err);
    }
  }

  async function handleJoinClass() {
    if (!classCode.trim()) {
      alert("請輸入課程代碼");
      return;
    }

    const confirmJoin = window.confirm(`確定要加入課程代碼 ${classCode} 嗎？`);
    if (!confirmJoin) return;

    try {
      // ✅ 呼叫專屬學生的 API
      const res = await fetch(`http://localhost:3001/student/${username}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_code: classCode.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ 成功加入課程！");
        setClassCode("");
        fetchJoinedClasses(); // 更新課程列表
      } else {
        alert("❌ 加入失敗：" + (data.error || data.message || "課程代碼錯誤"));
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ 無法連線到伺服器");
    }
  }

return (
  <div className="page">
    <h1>加入課程</h1>

    {/* 輸入課程代碼 */}
    <div className="row mb-20">
      <input
        type="text"
        value={classCode}
        onChange={(e) => setClassCode(e.target.value)}
        placeholder="輸入課程代碼"
        className="input"
        style={{ width: 220 }}
      />
      <button onClick={handleJoinClass} className="btn btn-success">
        加入課程
      </button>
    </div>

    {/* 已加入課程清單 */}
    <h3 className="section-title">已加入的課程：</h3>
    {joinedClasses.length === 0 ? (
      <p className="dim">尚未加入任何課程</p>
    ) : (
      <ul className="list">
        {joinedClasses.map((course) => (
          <li
            key={`${course.id}-${course.course_code}`} // ✅ 唯一 key
            className="item"
          >
            <div className="item-title">
              {course.course_name}（代碼：{course.course_code}）
            </div>
            <div className="item-sub">👨‍🏫 授課老師：{course.teacher_name || "未知"}</div>
          </li>
        ))}
      </ul>
    )}
    <BackToHomeButton role="student" />
  </div>
);

}
