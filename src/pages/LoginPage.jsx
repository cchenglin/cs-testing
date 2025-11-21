import { useState } from "react";
import { ethers } from "ethers";

function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [classroom, setClassroom] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:3001";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    if (!username || !password) {
      setMessage("請輸入帳號和密碼");
      setLoading(false);
      return;
    }

    // ✅ 註冊流程
    if (isRegister) {
      if (password !== confirmPassword) {
        setMessage("兩次輸入的密碼不一致");
        setLoading(false);
        return;
      }
      if (!name || !grade || !classroom) {
        setMessage("請完整填寫姓名、年級、班級");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, name, grade, classroom }),
        });

        const data = await res.json();
        if (!res.ok) {
          setMessage(`❌ 註冊失敗：${data.error || "伺服器錯誤"}`);
        } else {
          setMessage("✅ 註冊成功！請返回登入頁面登入");
          setIsRegister(false);
          setUsername("");
          setPassword("");
          setConfirmPassword("");
          setName("");
          setGrade("");
          setClassroom("");
        }
      } catch (err) {
        setMessage("❌ 伺服器連線失敗：" + err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // ✅ 登入流程
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ 登入失敗：${data.error || "帳號或密碼錯誤"}`);
      } else {
        // 儲存登入資訊
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            username: data.username || username,
            role: data.role,
            name: data.name,
            uid: data.uid,
            token: data.token,
          })
        );

        setMessage("✅ 登入成功，正在進入系統...");
    // === 若沒有 privateKey，則自動生成 ===
      try {
        let privateKey = localStorage.getItem("privateKey");
        let publicKey  = localStorage.getItem("publicKey");

        if (!privateKey || !publicKey) {
          // 生成錢包（Ethers v5）
          const wallet = ethers.Wallet.createRandom();
          privateKey = wallet.privateKey;
          publicKey  = wallet.address;

          // 存入 localStorage（只存私鑰在前端）
          localStorage.setItem("privateKey", privateKey);
          localStorage.setItem("publicKey", publicKey);

          // 上傳公鑰到後端
          await fetch("http://localhost:3001/students/register-public-key", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              student_id: data.uid,   // 後端登入回傳的 student_id
              publicKey: publicKey,
            }),
          });

          console.log("🔑 已生成 keypair 並上傳 publicKey");
        }
      } catch (err) {
        console.error("❌ keypair 生成錯誤：", err);
      }

        // 觸發父層登入狀態更新
        setTimeout(() => {
          onLogin({
            username: data.username || username,
            role: data.role,
            name: data.name,
            uid: data.uid,
            token: data.token,
          });
        }, 500);
      }
    } catch (err) {
      setMessage("❌ 伺服器連線錯誤：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <div className="animated-bg"></div>
      <div className="login-container">
        <h1 className="section-title mb-20">
          {isRegister ? "🧑‍🎓 學生註冊" : "🔐 登入系統"}
        </h1>

        <form onSubmit={handleSubmit} className="login-form" style={formStyle}>
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
            </div>
          )}

          <input
            type="text"
            placeholder="帳號"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="密碼"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          {isRegister && (
            <>
              <input
                type="password"
                placeholder="確認密碼"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="姓名"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
              <div className="row">
                <input
                  type="text"
                  placeholder="年級"
                  className="input"
                  style={{ flex: 1 }}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  disabled={loading}
                />
                <input
                  type="text"
                  placeholder="班級"
                  className="input"
                  style={{ flex: 1 }}
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  disabled={loading}
                />
              </div>
            </>
          )}

          {!isRegister && (
            <select
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="student">🎓 學生</option>
              <option value="teacher">👩‍🏫 老師</option>
            </select>
          )}

          <button type="submit" className="btn btn-primary mt-20" disabled={loading}>
            {loading ? "登入中..." : isRegister ? "註冊" : "登入"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "16px",
              color: message.includes("✅") ? "#22c55e" : "#ef4444",
            }}
          >
            {message}
          </p>
        )}

        <button
          onClick={() => {
            if (loading) return;
            setIsRegister(!isRegister);
            setMessage("");
            setUsername("");
            setPassword("");
            setConfirmPassword("");
            setName("");
            setGrade("");
            setClassroom("");
          }}
          className="mt-20 clickable"
          style={switchButtonStyle}
        >
          {isRegister ? "已有帳號？點此登入" : "還沒帳號？點此註冊"}
        </button>
      </div>
    </div>
  );
}

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  background: "rgba(255,255,255,0.05)",
  padding: "28px",
  borderRadius: "14px",
  border: "1px solid var(--border)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  position: "relative",
  backdropFilter: "blur(8px)",
};

const switchButtonStyle = {
  color: "var(--primary)",
  background: "none",
  border: "none",
  fontWeight: "600",
  textDecoration: "underline",
  cursor: "pointer",
};

export default LoginPage;
