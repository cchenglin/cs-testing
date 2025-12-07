// src/pages/StudentCourseDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BackToHomeButton from "../components/BackToHomeButton";
import { ethers } from "ethers";

export default function StudentCourseDetailPage() {
  const { course_id } = useParams();
  const [course, setCourse] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [signature, setSignature] = useState("");
  const [recoveredAddress, setRecoveredAddress] = useState("");
  const [expectedAddress, setExpectedAddress] = useState("");

  // ⭐ Demo Mode（可視化 竄改 vs 上鏈 動畫）
  const [demoMode, setDemoMode] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const student_id = user.username || user.student_id;

  useEffect(() => {
    if (!course_id) return;
    fetchCourse();
    fetchAttendanceRecords();
    checkSessionActive();

    const interval = setInterval(() => {
      checkSessionActive();
      fetchAttendanceRecords();
    }, 3000);

    return () => clearInterval(interval);
  }, [course_id]);

  async function fetchCourse() {
    try {
      const res = await fetch(`http://localhost:3001/course/${course_id}`);
      const data = await res.json();
      setCourse(Array.isArray(data) ? data[0] : data);
      console.log("✅ fetchCourse:", data);
    } catch (err) {
      console.error("❌ 無法取得課程資訊:", err);
    }
  }

  async function fetchAttendanceRecords() {
    try {
      const res = await fetch(
        `http://localhost:3001/student/${student_id}/course/${course_id}/attendance`
      );
      const data = await res.json();
      setAttendance(Array.isArray(data) ? data : []);
      console.log("✅ fetchAttendanceRecords:", data);
    } catch (err) {
      console.error("❌ 無法取得簽到紀錄:", err);
    }
  }

  async function checkSessionActive() {
    try {
      const res = await fetch(
        `http://localhost:3001/course/${course_id}/attendance/status`
      );
      const data = await res.json();
      const isOpen = data.isOpen || false;

      setIsSessionActive(isOpen);

      if (data.sessionId && data.sessionId !== currentSessionId) {
        setCurrentSessionId(data.sessionId);
        setIsSigned(false);
      }

      if (
        isOpen &&
        currentSessionId === data.sessionId &&
        attendance.some((a) => a.status === "present")
      ) {
        setIsSigned(true);
      }

      if (!isOpen) {
        setCurrentSessionId(null);
      }
      console.log("✅ checkSessionActive:", data);
    } catch (err) {
      console.error("❌ 無法取得點名狀態:", err);
    }
  }

  // ---------------------------------------------
  //            🔥 上鏈簽到（含 demoMode）
  // ---------------------------------------------
  async function handleSignAttendance() {
    console.log("🔥 點擊簽到按鈕，開始執行 handleSignAttendance");

    const username = user.username;
    if (!username) {
      alert("⚠️ 找不到學生帳號，請重新登入");
      return;
    }

    try {
      const blockchainMode = course?.is_blockchain_enabled ?? true;
      setIsLoading(true);
      setLoadingMessage("🟡 正在連線伺服器...");
      console.log("🔹 blockchainMode =", blockchainMode);

      // 非上鏈模式（正常 check-in）
      if (!blockchainMode) {
        console.log("➡️ 走非上鏈模式");
        const res = await fetch(
          `http://localhost:3001/course/${course_id}/attendance/checkin`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: username }),
          }
        );
        console.log("⬅️ check-in response status:", res.status);
        const data = await res.json();
        console.log("⬅️ check-in response data:", data);

        if (data.success) {
          setIsSigned(true);
          setLoadingMessage("✅ 一般簽到成功！");
          setTimeout(() => setIsLoading(false), 1500);
        } else {
          throw new Error(data.message || "簽到失敗");
        }
        return;
      }

      // Step B：nonce
      setLoadingMessage("🟡 正在產生 nonce...");
      console.log("➡️ 產生 nonce");
      const nonceRes = await fetch(`http://localhost:3001/nonces/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          student_id: user.uid || 1,
          course_id,
        }),
      });
      console.log("⬅️ nonce response status:", nonceRes.status);
      const nonceData = await nonceRes.json();
      console.log("⬅️ nonce response data:", nonceData);
      if (!nonceData.id) throw new Error("nonce 產生失敗");

      // Step C：簽章
      const privateKey = localStorage.getItem("privateKey");
      console.log("🔹 privateKey =", !!privateKey);
      if (!privateKey) throw new Error("找不到 privateKey，請重新登入");

      const signedAt = Math.floor(Date.now() / 1000);
      const wallet = new ethers.Wallet(privateKey);

      const message = JSON.stringify({
        student_id: user.uid,
        course_id,
        nonce: nonceData.nonce,
        signedAt,
      });
      console.log("➡️ message to sign:", message);

      const signature = await wallet.signMessage(message);
      const signerAddress = wallet.address;
      console.log("⬅️ signature:", signature, "signerAddress:", signerAddress);

      // Step C：送給後端
      setLoadingMessage("🟠 正在上鏈中...");
      const signinRes = await fetch(`http://localhost:3001/attendance/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          student_id: user.uid || 1,
          course_id,
          ipfsCid: "bafybeigdemoCID",
          nonceId: nonceData.id,
          signedAt,
          message,
          signature,
          //signerAddress,可不傳，後端會自己 recover（更安全）
        }),
      });
      console.log("⬅️ signin response status:", signinRes.status);
      const signinData = await signinRes.json();
      console.log("⬅️ signin response data:", signinData);

      if (!signinRes.ok || !signinData.ok)
        throw new Error(signinData.error || signinData.detail || "上鏈失敗");

      setSignature(signinData.signature);
      setRecoveredAddress(signinData.recovered_address);
      setExpectedAddress(signinData.expected_address);

      // Step D：確認鏈上
      setLoadingMessage("🟢 正在驗證鏈上紀錄...");
      const verifyRes = await fetch(
        `http://localhost:3001/onchain/seen/${signinData.data_hash}`
      );
      console.log("⬅️ verify response status:", verifyRes.status);
      const verifyData = await verifyRes.json();
      console.log("⬅️ verify response data:", verifyData);
      if (!verifyData.seen) throw new Error("上鏈驗證失敗");

      // 送出鏈上完成確認
      await fetch(
        `http://localhost:3001/attendance/confirm_onchain/${signinData.attendance_id}`,
        { method: "POST" }
      );
      console.log("✅ 已送出鏈上完成確認");

      // ---------------------------------------------
      //      🔥 Demo Mode：跳到動畫展示頁
      // ---------------------------------------------
      if (demoMode) {
        setLoadingMessage("✨ 正在啟動畫面...");
        setTimeout(() => {
          window.location.href = `/blockchain/demo?hash=${signinData.data_hash}&course=${course_id}&signature=${signature}&recovered=${recoveredAddress}&expected=${expectedAddress}`;
        }, 1000);
        return;
      }

      // 一般模式：完成 & 更新列表
      setLoadingMessage("✅ 點名完成！");
      setIsSigned(true);
      setTimeout(() => {
        setIsLoading(false);
        fetchAttendanceRecords();
      }, 1500);
    } catch (err) {
      console.error("❌ handleSignAttendance error:", err);

      if (String(err.message || "").includes("不是本人")) {
        setLoadingMessage("❌ 簽章驗證失敗：疑似代簽");
      } else {
        setLoadingMessage("❌ 發生錯誤：" + err.message);
      }

      setTimeout(() => setIsLoading(false), 2000);
    }
  }

  return (
    <div className="page">
      {course ? (
        <>
          <div className="card mb-20">
            <h1>{course.course_name}</h1>
            <p><b>課程代碼：</b>{course.course_code}</p>
            <p><b>授課老師：</b>{course.teacher_name || "未知"}</p>
            <p><b>課程描述：</b>{course.description || "尚無描述"}</p>
          </div>

          {/* Demo Mode Toggle */}
          <div className="card mb-20">
            <label>
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
              />{" "}
              啟用「區塊鏈上鏈 vs 竄改」動畫 Demo
            </label>
          </div>

          {/* Sign-in */}
          <div className="card mb-20">
            <h2>簽到系統</h2>
            {isSessionActive ? (
              isSigned ? (
                <button className="btn btn-success">✅ 已簽到</button>
              ) : (
                <button className="btn btn-primary" onClick={handleSignAttendance}>
                  我要簽到
                </button>
              )
            ) : (
              <p className="dim">老師尚未開啟簽到</p>
            )}
          </div>

          {/* Attendance Records */}
          <div className="card table-wrap">
            <h3>歷次簽到紀錄</h3>
            {attendance.length === 0 ? (
              <p>尚無簽到紀錄</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>日期與時間</th>
                    <th>狀態</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a, i) => (
                    <tr key={i}>
                      <td>{a.display_time}</td>
                      <td>
                        {a.status === "present" ? (
                          <span className="badge badge-success">出席</span>
                        ) : (
                          <span className="badge badge-danger">缺席</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <p>載入中...</p>
      )}

      <BackToHomeButton role="student" />

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-box">
            <div className="spinner"></div>
            <p>{loadingMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
