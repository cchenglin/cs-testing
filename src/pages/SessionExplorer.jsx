// src/pages/SessionExplorer.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackToHomeButton from "../components/BackToHomeButton";

export default function SessionExplorer() {
  const { course_id, session_id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionInfo, setSessionInfo] = useState(null);
  const [records, setRecords] = useState([]);

  // ⭐ 交易詳情 Modal
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          `http://localhost:3001/onchain/session/${session_id}`
        );
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || "載入失敗");
        }

        setSessionInfo(data.session);
        setRecords(data.records || []);
      } catch (err) {
        console.error("❌ [SessionExplorer] 載入失敗：", err);
        setError(err.message || "載入失敗");
      } finally {
        setLoading(false);
      }
    }

    if (session_id) fetchSession();
  }, [session_id]);

  function isCampusIP(ip) {
    if (!ip) return false;
    return (
      ip.startsWith("10.") ||
      ip.startsWith("172.16.") ||
      ip.startsWith("172.17.") ||
      ip.startsWith("172.18.") ||
      ip.startsWith("172.19.") ||
      ip.startsWith("192.168.") ||
      ip === "127.0.0.1"
    );
  }


  function formatTime(str) {
    if (!str) return "-";
    return new Date(str).toLocaleString("zh-TW", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  // ⚠ explorerBase 未使用，可保留或刪除
  const explorerBase = import.meta.env.VITE_BLOCK_EXPLORER_BASE || "";

  return (
    <div className="page">

      {/* ======= Title ======= */}
      <h1 className="section-title">點名 Session 鏈上詳情</h1>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-box">
            <div className="spinner"></div>
            <p>資料載入中...</p>
          </div>
        </div>
      )}

      {error && <p style={{ color: "#ef4444" }}>❌ {error}</p>}

      {!loading && !error && sessionInfo && (
        <>
          {/* ======= Summary card ======= */}
          <div className="card mb-20">
            <h2 style={{ marginBottom: "10px" }}>
              課程：{sessionInfo.course_name || "(課程名稱未知)"}
              <br />
              <span style={{ fontSize: "0.9em", color: "#94a3b8" }}>
                Course ID: {sessionInfo.course_id} ｜ Session ID: {sessionInfo.session_id}
              </span>
            </h2>

            <p>
              <b>點名時間：</b> {formatTime(sessionInfo.started_at)}
            </p>

            {/* ======= Stats row ======= */}
            <div className="stats-row">
              <div className="stats-box stats-blue">
                <div className="stats-title">課堂人數</div>
                <div className="stats-value">{sessionInfo.class_size}</div>
              </div>

              <div className="stats-box stats-green">
                <div className="stats-title">出席人數</div>
                <div className="stats-value">{sessionInfo.present_count}</div>
              </div>
            </div>
          </div>

          {/* ======= Table ======= */}
          <div className="card table-wrap">
            <h3 style={{ marginBottom: "12px" }}>本次點名鏈上紀錄</h3>

            {records.length === 0 ? (
              <p className="dim">尚無出席紀錄</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>帳號 (username)</th>
                    <th>學生姓名</th>
                    <th>出席狀態</th>
                    <th style={{ width: "170px", textAlign: "center" }}>校園 IP 驗證</th>
                    <th>簽名錢包</th>
                    <th>鏈上狀態</th>
                    <th>交易哈希 (txHash)</th>
                    <th>區塊高度</th>
                    <th>Gas Used</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((rec) => (
                    <tr
                      key={`att-rec-${rec.attendance_id}`}
                      className={
                        rec.verifiedOnChain
                          ? "row-onchain-green"
                          : rec.txHash
                          ? "row-onchain-warn"
                          : ""
                      }
                    >
                      <td>{rec.username}</td>
                      <td>{rec.name}</td>

                      <td>
                        {rec.status === "present" ? (
                          <span className="badge badge-success">出席</span>
                        ) : (
                          <span className="badge badge-secondary">缺席</span>
                        )}
                      </td>

                       {/* 校園 IP 驗證 - 超顯眼大 V / 大 X */}
                      <td style={{ textAlign: "center", padding: "12px 8px" }}>
                        {rec.ip_valid === true ? (
                          <div title={`校園內 IP：${rec.client_ip || "未知"}`}>
                            <div style={{ color: "#22c55e", fontWeight: "bold", fontSize: "2.4em", lineHeight: "1" }}>
                              V
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "#86efac", marginTop: "4px" }}>
                              在校園內
                            </div>
                          </div>
                        ) : rec.ip_valid === false ? (
                          <div title={`校外 IP：${rec.client_ip || "未知"}`}>
                            <div style={{ color: "#ef4444", fontWeight: "bold", fontSize: "2.4em", lineHeight: "1" }}>
                              X
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "#fca5a5", marginTop: "4px" }}>
                              校外簽到
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>–</span>
                        )}
                        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "8px", fontFamily: "monospace" }}>
                          {rec.client_ip || "-"}
                        </div>
                      </td>

                      {/* 簽名錢包 */}
                      <td style={{ maxWidth: "140px", wordBreak: "break-all" }} title={rec.signer_address || "-"}>
                        {rec.signer_address ? `${rec.signer_address.slice(0, 8)}...` : "-"}
                      </td>

                      {/* 鏈上狀態 */}
                      <td>
                        {rec.verifiedOnChain ? (
                          <span className="badge badge-success">鏈上完成</span>
                        ) : rec.txHash ? (
                          <span className="badge badge-warning">待確認</span>
                        ) : (
                          <span className="badge badge-secondary">未上鏈</span>
                        )}
                      </td>

                      {/* txHash button -> 開啟 Modal */}
                      <td style={{ maxWidth: "260px", wordBreak: "break-all" }}>
                        {rec.txHash ? (
                          <button
                            className="tx-btn"
                            onClick={async () => {
                              try {
                                const tx = await fetch(`http://localhost:3001/onchain/tx/${rec.txHash}`);
                                const txData = await tx.json();
                                setModalData({
                                  ...txData,
                                  client_ip: rec.client_ip,
                                  ip_valid: rec.ip_valid,
                                });
                              } catch (err) {
                                console.error("❌ 讀取交易資料失敗：", err);
                              }
                            }}
                          >
                            {rec.txHash.slice(0, 12)}...
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>{rec.blockNumber ?? "-"}</td>
                      <td>{rec.gasUsed ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ======= Buttons ======= */}
          <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
            <button className="btn btn-primary" onClick={() => navigate(-1)}>
              ⬅ 返回課程
            </button>
            <BackToHomeButton role="teacher" />
          </div>

          {/* ======= Modal for transaction details ======= */}
          {modalData && (
            <div
              className="modal-overlay"
              onClick={() => setModalData(null)}
            >
              <div
                className="modal-box"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="modal-title">🔍 交易詳細資訊</h3>
                <pre className="modal-content">
                  {JSON.stringify(
                    {
                      ...modalData,
                    },
                    null,
                    2
                  )}
                </pre>
                <button
                  className="btn btn-primary"
                  onClick={() => setModalData(null)}
                >
                  關閉
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );


}
