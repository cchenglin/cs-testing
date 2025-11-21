// src/pages/CourseDetailPage.jsx
import { useState, useEffect } from "react";
import BackToHomeButton from "../components/BackToHomeButton";
import { useParams, useNavigate } from "react-router-dom";

// 📊 Chart.js 套件
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

export default function CourseDetailPage() {
  const { course_id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [countdown, setCountdown] = useState(0);
  const [onchainRecords, setOnchainRecords] = useState([]);
  const [demoMode, setDemoMode] = useState(false);

  // ========= INIT =========
  useEffect(() => {
    if (!course_id) return;
    fetchCourse();
    fetchStudents();
    fetchAttendanceRecords();
  }, [course_id]);

  // ========= AUTO REFRESH =========
  useEffect(() => {
    let interval;
    if (isAttendanceOpen) {
      interval = setInterval(() => {
        fetchAttendanceRecords();
      }, 5000);
    } else {
      fetchAttendanceRecords();
    }
    return () => interval && clearInterval(interval);
  }, [isAttendanceOpen]);

  // ========= 課堂人數 =========
  const classSize = students.length;

  // ========= 動態 Session 列表（這段要放在最上面） =========
  const attendanceSessions = [
    ...new Map(
      attendanceRecords.map((r) => [r.session_id, r.started_at])
    ).entries(),
  ];

  // ========= 每次 Session 的統計（出席率用） =========
  const sessionStats = attendanceSessions
    .map(([sessionId, startedAt]) => {
      const presentCount = attendanceRecords.filter(
        (r) => r.session_id === sessionId && r.status === "present"
      ).length;

      return { sessionId, startedAt, presentCount };
    })
    .sort((a, b) => {
      if (!a.startedAt) return 1;
      if (!b.startedAt) return -1;
      return new Date(a.startedAt) - new Date(b.startedAt);
    });

  // ========= 折線圖資料 =========
  const attendanceChartData = {
    labels: sessionStats.map((s, idx) =>
      s.startedAt
        ? new Date(s.startedAt).toLocaleString("zh-TW", {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : `第 ${idx + 1} 次`
    ),
    datasets: [
      {
        label: "出席率 (%)",
        data: sessionStats.map((s) =>
          classSize ? Math.round(((s.presentCount / classSize) * 100) * 10) / 10 : 0
        ),
        tension: 0.35,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.4)",
      },
    ],
  };

  // ========= 折線圖 Options =========
  const attendanceChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "#e5e7eb" },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const idx = ctx.dataIndex;
            const stat = sessionStats[idx];
            const rate = ctx.parsed.y;
            return `出席率: ${rate}% (${stat.presentCount} / ${classSize} 人)`;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: "#9ca3af",
          callback: (v) => `${v}%`,
        },
        grid: {
          color: "rgba(148,163,184,0.3)",
        },
      },
      x: {
        ticks: { color: "#9ca3af" },
        grid: { display: false },
      },
    },
  };

  // ========= API =========
  async function fetchCourse() {
    try {
      const res = await fetch(`http://localhost:3001/course/${course_id}`);
      const data = await res.json();
      setCourse(Array.isArray(data) ? data[0] : data);
    } catch (err) {
      console.error("❌ course error", err);
    }
  }

  async function fetchStudents() {
    try {
      const res = await fetch(`http://localhost:3001/course/${course_id}/students`);
      const data = await res.json();
      const unique = data.filter(
        (s, idx, arr) => idx === arr.findIndex((t) => t.student_id === s.student_id)
      );
      setStudents(unique);
    } catch (err) {
      console.error("❌ students error", err);
    }
  }

  async function fetchAttendanceRecords() {
    try {
      const res = await fetch(
        `http://localhost:3001/course/${course_id}/attendance/records`
      );
      const data = await res.json();

      const enhanced = await Promise.all(
        data.map(async (rec) => {
          if (!rec.data_hash || rec.data_hash === "0x") {
            return { ...rec, verifiedOnChain: false };
          }
          try {
            const chain = await fetch(
              `http://localhost:3001/onchain/seen/${rec.data_hash}`
            );
            const c = await chain.json();
            return { ...rec, verifiedOnChain: c.seen === true };
          } catch {
            return { ...rec, verifiedOnChain: false };
          }
        })
      );

      setAttendanceRecords(enhanced);
    } catch (err) {
      console.error("❌ records error", err);
    }
  }

  // ========= 點名控制 =========
  async function handleStartAttendance() {
    try {
      const res = await fetch(
        `http://localhost:3001/course/${course_id}/attendance/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ duration: selectedDuration }),
        }
      );

      const data = await res.json();
      if (!data.success) return alert("❌ 開始點名失敗：" + data.error);

      setIsAttendanceOpen(true);
      setCountdown(selectedDuration);
      fetchAttendanceRecords();

      const id = setInterval(() => {
        setCountdown((t) => {
          if (t <= 1) {
            clearInterval(id);
            handleStopAttendance();
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      setIntervalId(id);
      alert(`✅ 點名已開始 (${selectedDuration} 秒)`);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStopAttendance() {
    try {
      clearInterval(intervalId);
      setIsAttendanceOpen(false);

      await fetch(`http://localhost:3001/course/${course_id}/attendance/stop`, {
        method: "POST",
      });

      fetchAttendanceRecords();
      alert("🔴 點名已結束");
    } catch (err) {
      console.error(err);
    }
  }

  // ========= UI =========
  return (
    <div className="page">
      <h1 className="section-title">📘 課程詳細資料</h1>

      {/* 課程資訊 */}
      {course && (
        <div className="card mb-20">
          <p><b>課程名稱：</b> {course.course_name}</p>
          <p><b>課程代碼：</b> {course.course_code}</p>
          <p><b>課程描述：</b> {course.description || "（無描述）"}</p>
        </div>
      )}

      {/* 點名控制 */}
      <div className="card mb-20">
        {!isAttendanceOpen ? (
          <div className="row">
            <label>⏱️ 點名時長（秒）：</label>
            <input
              type="number"
              className="input"
              min="10"
              max="600"
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(Number(e.target.value))}
              style={{ width: "100px" }}
            />
            <button className="btn btn-success" onClick={handleStartAttendance}>
              ▶️ 開始點名
            </button>

            <button
              style={{ backgroundColor: "#4f46e5", color: "white", border: "none" }}
              className="btn"
              onClick={() =>
                window.open(`http://localhost:3001/onchain/debug/${course_id}`, "_blank")
              }
            >
              🧩 檢視上鏈狀態
            </button>
          </div>
        ) : (
          <div className="row">
            <span style={{ color: "#f87171" }}>🔴 點名進行中（剩餘 {countdown} 秒）</span>
            <button className="btn btn-danger" onClick={handleStopAttendance}>
              ⏹️ 結束點名
            </button>
          </div>
        )}
      </div>
    


      {/* 學生 / 每次點名狀態 */}
      <h2 className="section-title">👥 學生名單與出席紀錄</h2>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>帳號</th>
              <th>姓名</th>
              <th>年級</th>
              <th>班級</th>

              {attendanceSessions.map(([sessionId, startedAt]) => (
                <th
                  key={sessionId}
                  style={{ cursor: "pointer", color: "#3b82f6" }}
                  onClick={() =>
                    navigate(`/teacher/course/${course_id}/session/${sessionId}/explorer`)
                  }
                >
                  {startedAt
                    ? new Date(startedAt).toLocaleString("zh-TW", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Session"}
                  <br />
                  <span style={{ fontSize: "0.8em", color: "#888" }}>（詳情）</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {students.map((stu) => (
              <tr key={stu.student_id}>
                <td>{stu.username}</td>
                <td>{stu.name}</td>
                <td>{stu.grade || "-"}</td>
                <td>{stu.classroom || "-"}</td>

                {attendanceSessions.map(([sessionId]) => {
                  const rec = attendanceRecords.find(
                    (r) =>
                      r.student_id === stu.student_id &&
                      r.session_id === sessionId
                  );

                  if (!rec)
                    return (
                      <td key={sessionId}>
                        <span className="badge badge-secondary">❌ 缺席</span>
                      </td>
                    );

                  return (
                    <td key={sessionId}>
                      {rec.status === "present" ? (
                        <>
                          ✅ 出席
                          <br />
                          {rec.verifiedOnChain ? (
                            <span className="badge badge-success">鏈上完成</span>
                          ) : (
                            <span className="badge badge-warning">待上鏈</span>
                          )}
                        </>
                      ) : (
                        <span className="badge badge-secondary">❌ 缺席</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📊 出席率折線圖 */}
      {attendanceSessions.length > 0 && classSize > 0 && (
        <div className="card mb-20" style={{ marginTop: "20px" }}>
          <h2 className="section-title">📊 出席率趨勢（每次點名）</h2>

          <div className="chart-container">
            <Line data={attendanceChartData} options={attendanceChartOptions} />
          </div>

          <div style={{ marginTop: "12px", textAlign: "left", fontSize: "0.9rem" }}>
            {sessionStats.map((s, idx) => {
              const rate = classSize
                ? Math.round((s.presentCount / classSize) * 1000) / 10
                : 0;

              return (
                <div key={s.sessionId} style={{ marginBottom: "4px" }}>
                  <span style={{ color: "#9ca3af" }}>
                    第 {idx + 1} 次（
                    {s.startedAt
                      ? new Date(s.startedAt).toLocaleString("zh-TW", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "未知時間"}
                    ）：
                  </span>{" "}
                  <b style={{ color: "#e5e7eb" }}>
                    出席 {s.presentCount} / {classSize} 人（{rate}%）
                  </b>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <BackToHomeButton role="teacher" />
    </div>
  );
}
