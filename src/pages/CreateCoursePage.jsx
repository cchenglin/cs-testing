import { useState } from "react";
import BackToHomeButton from "../components/BackToHomeButton";

export default function CreateCoursePage({ teacher }) {
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:3001/create-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: teacher.uid,
          course_name: courseName,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "建立課程失敗");
        return;
      }

      setGeneratedCode(data.course_code);
      setMessage(data.msg);
    } catch (err) {
      setMessage("伺服器錯誤：" + err.message);
    }
  };

 return (
    <div className="page">
      <h1 className="section-title">建立新課程</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          maxWidth: "400px",
        }}
      >
        <label>
          <span>課程名稱：</span>
          <input
            type="text"
            className="input"
            placeholder="請輸入課程名稱"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
        </label>

        <label>
          <span>課程描述（可選）：</span>
          <textarea
            className="input"
            placeholder="輸入課程簡介或重點..."
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <button type="submit" className="btn btn-success mt-20">
          建立課程
        </button>
      </form>

      {/* 訊息提示 */}
      {message && <p style={{ marginTop: 15 }}>{message}</p>}

      {/* 顯示課程代碼 */}
      {generatedCode && (
        <div className="card mt-20">
          <strong>課程代碼：</strong>{" "}
          <span style={{ color: "#22c55e", fontWeight: 600 }}>
            {generatedCode}
          </span>
        </div>
      )}

      <BackToHomeButton role="teacher" />
    </div>
  );
}
