import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackToHomeButton from "../components/BackToHomeButton";

export default function StudentProfilePage({ username }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch(`http://localhost:3001/student/${username}/profile`);
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("❌ 無法載入個人資料:", err);
    }
  }

  if (!profile) return <p>載入中...</p>;

return (
  <div className="page">
    <h1>👤 個人資料</h1>

    <div className="profile-card">
      <p><b>帳號：</b>{profile.username}</p>
      <p><b>姓名：</b>{profile.name}</p>
      <p><b>年級：</b>{profile.grade || "未設定"}</p>
      <p><b>班級：</b>{profile.classroom || "未設定"}</p>
      <p><b>註冊時間：</b>{new Date(profile.created_at).toLocaleString()}</p>
    </div>

    <div className="row mt-20">
      <button
        onClick={() => navigate(`/student/profile/edit`)}
        className="btn btn-primary"
      >
        ✏️ 編輯資料
      </button>

      <BackToHomeButton role="student" />
    </div>
  </div>
);

}
