// src/pages/AttendancePage.jsx
import { useState, useEffect } from "react";

export default function AttendancePage() {
  const [courses, setCourses] = useState([]);
  const [activeClassId, setActiveClassId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // 模擬呼叫後端取得課程資料
    async function fetchCourses() {
      try {
        // 假設從後端取得資料
        const res = await fetch("http://localhost:3001/classes");
        const data = await res.json();

        setCourses(data.classes); // [{id, name}, ...]
        setActiveClassId(data.activeClassId); // 後端回傳目前開放簽到的課程
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();

    // 每隔10秒重新拉資料 → 即時偵測老師開放哪一堂課
    const interval = setInterval(fetchCourses, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async (classId) => {
    try {
      setMessage("簽到中...");

      // Step A：登入取得 token（暫時用假帳號測試）
      const loginRes = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "S001", password: "123456" }),
      });
      const loginData = await loginRes.json();
      const token = loginData.token;

      // Step B：向後端索取 nonce
      const nonceRes = await fetch("http://localhost:3001/nonces/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          student_id: loginData.uid,
          class_id: classId,
        }),
      });
      const nonceData = await nonceRes.json();

      // Step C：送出簽到 + 上鏈
      const now = Math.floor(Date.now() / 1000);
      const attendRes = await fetch("http://localhost:3001/attendance/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          student_id: loginData.uid,
          class_id: classId,
          ipfsCid: "bafybeigdemoCID",
          nonceId: nonceData.id,
          signedAt: now,
        }),
      });
      const attendData = await attendRes.json();

      if (attendData.ok) {
        setMessage(`✅ 簽到成功，上鏈成功！TxHash：${attendData.onchain_txhash}`);
      } else {
        setMessage("❌ 簽到失敗，請稍後再試");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ 發生錯誤，請檢查連線或伺服器狀態");
    }
  };

  if (loading) return <p>載入中...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>課程簽到頁面</h1>

      {courses.map((course) => (
        <div
          key={course.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            padding: 12,
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        >
          <span>{course.name}</span>
          <button
            disabled={course.id !== activeClassId}
            style={{
              backgroundColor:
                course.id === activeClassId ? "#4CAF50" : "#aaa",
              color: "white",
              padding: "8px 16px",
              borderRadius: 4,
              cursor: course.id === activeClassId ? "pointer" : "not-allowed",
            }}
            onClick={() => handleSignIn(course.id)}
          >
            {course.id === activeClassId ? "簽到" : "未開放"}
          </button>
        </div>
      ))}

      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </div>
  );
}
