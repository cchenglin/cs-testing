// src/pages/EditStudentProfilePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackToHomeButton from "../components/BackToHomeButton";

export default function EditStudentProfilePage({ username }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ grade: "", classroom: "", password: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  // ✅ 取得目前學生資料
  async function fetchProfile() {
    try {
      const res = await fetch(`http://localhost:3001/student/${username}/profile`);
      const data = await res.json();

      if (data.error) {
        alert("無法載入資料：" + data.error);
        return;
      }

      setForm({
        grade: data.grade || "",
        classroom: data.classroom || "",
        password: "", // 🚫 不顯示原密碼
      });
    } catch (err) {
      console.error("載入錯誤：", err);
      alert("無法載入資料，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  // ✅ 提交修改
  async function handleSubmit(e) {
    e.preventDefault();

    // 前端防呆
    if (!form.grade.trim() || !form.classroom.trim()) {
      alert("請輸入年級與班級！");
      return;
    }

    // 準備要送出的資料
    const updatedData = {
      grade: form.grade,
      classroom: form.classroom,
    };

    // 🚫 密碼留空則不傳
    if (form.password && form.password.trim() !== "") {
      updatedData.password = form.password;
    }

    try {
      const res = await fetch(`http://localhost:3001/student/${username}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ 資料更新成功！");
        navigate("/student/profile");
      } else {
        alert("❌ 更新失敗：" + (data.error || "未知錯誤"));
      }
    } catch (err) {
      console.error("更新錯誤：", err);
      alert("伺服器錯誤，請稍後再試");
    }
  }

  if (loading) return <p>載入中...</p>;

return (
  <div className="page">
    <h1>✏️ 編輯個人資料</h1>

    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label>年級：</label>
        <input
          type="text"
          value={form.grade}
          onChange={(e) => setForm({ ...form, grade: e.target.value })}
          className="input"
          placeholder="輸入年級"
        />
      </div>

      <div className="form-group">
        <label>班級：</label>
        <input
          type="text"
          value={form.classroom}
          onChange={(e) => setForm({ ...form, classroom: e.target.value })}
          className="input"
          placeholder="輸入班級"
        />
      </div>

      <div className="form-group">
        <label>密碼（留空則不修改）：</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="input"
          placeholder="輸入新密碼（可留空）"
        />
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: "10px" }}>
  <button type="submit" className="btn btn-success">
    💾 儲存變更
  </button>

  <button
    type="button"
    onClick={() => navigate("/student/profile")}
    className="btn btn-warning"
  >
    🔙 取消
  </button>
</div>

    </form>

    <BackToHomeButton role="student" />
  </div>
);

}
