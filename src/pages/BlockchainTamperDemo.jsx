// src/pages/BlockchainTamperDemo.jsx
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SHA256 from "crypto-js/sha256";   // ⭐ 新增：真實 SHA256 計算
import "./tamper-demo.css";

export default function BlockchainTamperDemo() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);

  // ⭐ 從 URL 帶入真實資料
  const student = searchParams.get("student") || "學生A";
  const course = searchParams.get("course") || "Blockchain 課程";
  const dataHash = searchParams.get("hash") || "0xdemo_hash_abc";
  const txHash = searchParams.get("tx") || "0xdemo_txHash_123";
  const blockNumber = searchParams.get("block") || "12094";
  const gasUsed = searchParams.get("gas") || "24110";

  // ⭐ 真實 SHA256 模擬（對原始資料做 Hash）
  const rawData = `${student}-${course}-${Date.now()}`;
  const sha256Hash = SHA256(rawData).toString().slice(0, 32) + "...";

  // ⭐ 模擬 Merkle Tree 建構
  const leaf1 = SHA256("attend-01").toString().slice(0, 14);
  const leaf2 = SHA256("attend-02").toString().slice(0, 14);
  const merklePair = SHA256(leaf1 + leaf2).toString().slice(0, 18);
  const merkleRoot = SHA256(merklePair).toString().slice(0, 26);

  const fakeHash = dataHash.replace(/.$/, "9");
  const stuPublicKey = searchParams.get("signer") || "0x5A3...E91c";  // 真實簽到者
  const fakeAddress = "0xF9B1f23C8d9...9A7C"; // 攻擊者偽造
  // ⭐ 模擬簽章驗證動畫用（未串接後端時先用假的）
  const signature = "0x3b4c5d6e7f8a9b00112233445566778899aabbccddee...";
  const recoveredAddress = stuPublicKey;
  const expectedAddress = stuPublicKey;


  // 🔢 升級版動畫步驟（含 Merkle Tree 結構）
  const steps = [
    `學生 ${student} 發起簽到請求`,
    `產生 nonce + timestamp ➤ ${rawData}`,
    `SHA256 哈希計算 ➤ ${sha256Hash}`,
    `Merkle Tree 建構中...（2筆出席紀錄）`,
    `寫入 Block #${blockNumber} ➤ txHash: ${txHash}`,
    `產生 Merkle Root ➤ ${merkleRoot}`,
  ];

  // ⏳ 每 2.2 秒自動播放
  useEffect(() => {
    if (phase > steps.length ) return;
    const timer = setTimeout(() => setPhase(phase + 1), 2200);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="page demo-page">
      <h1 className="section-title">🛡 區塊鏈防竄改機制 — 可視化互動演示</h1>
      <p className="dim">
        以下使用 <b>{student}</b> 在 <b>{course}</b> 的簽到紀錄進行展示
      </p>

      {/* 🎯 動態步驟流程 */}
      <div className="step-grid">
        {steps.map((text, idx) => (
          <div
            key={idx}
            className={`step-box ${
                idx === phase && phase < steps.length - 1
                    ? "active"
                    : idx === steps.length - 1 && idx === phase
                    ? "final-step"   // ⭐ 最後一個進度條效果（一次性播放）
                    : idx <= phase
                    ? "completed"
                    : ""
                }`}
          >
            {text}
          </div>
        ))}
      </div>

      {/* 🧬 Merkle Tree 可視化 */}
      {phase >= 3 && (
        <div className="merkle-container">
          <div className="merkle-leaf">{leaf1}</div>
          <div className="merkle-leaf">{leaf2}</div>
          <div className="merkle-arrow">⇩ 哈希結合 ⇩</div>
          <div className="merkle-node">{merklePair}</div>
          <div className="merkle-arrow">⇩ 再哈希 ⇩</div>
          <div className="merkle-root">{merkleRoot}</div>
        </div>
      )}

      {/* 🧱 Block 區塊展示 */}
      {phase >= 4 && (
        <div className="chain-visual">
          <div className={`block ${phase >= 4 ? "visible zoom" : ""}`}>
            <h3>Block #{blockNumber}</h3>
            <p><b>TxHash：</b> <span className="mono">{txHash}</span></p>
            <p><b>data_hash：</b> <span className="mono">{dataHash}</span></p>
            <p><b>Gas Used：</b> {gasUsed}</p>
          </div>
        </div>
      )}

      
        {/* 🚨 偽造攻擊展示 — 防竄改驗證區 */}
        {phase === 5 && (
        <div className="attack-stage">

            <h2 className="attack-title">⚡ Signer Address 驗證 — 防止代簽名</h2>
            <p className="dim">
            下方展示：「真正簽名者地址」與「偽造者地址」比對，
            如果不一致 ➤ 🚫 拒絕點名（防止代簽）
            </p>

            {/* 🛡 原始鏈上紀錄區塊 */}
            <div className="block-compare block-original secure-glow">
            <h3>真實紀錄（鏈上）</h3>
            <p><b>TxHash：</b><span className="mono">{txHash}</span></p>
            <p><b>Signer Address：</b> <span className="mono highlight">{stuPublicKey}</span></p>
            <p><b>Stored Hash：</b><span className="mono">{dataHash}</span></p>
            <div className="verify-ok">✔ 驗證通過 — 本人簽到</div>
            </div>

            {/* 🚨 偽造紀錄區塊 */}
            <div className="block-compare block-fake electric-shock">
            <div className="electric-effect">⚡</div>
            <h3>🚨 攻擊者偽造資料</h3>
            <p><b>偽造 Signer：</b><span className="mono highlight-bad">{fakeAddress}</span></p>
            <p><b>原始 Signer：</b><span className="mono">{stuPublicKey}</span></p>
            <p><b>偽造 data_hash：</b><span className="mono highlight-bad">{fakeHash}</span></p>
            <div className="verify-failed">❌ 驗證失敗 — 非本人簽到（防代簽）</div>
            </div>

        </div>
        )}

        {/* 🔍 簽章驗證動畫區：Signature → Recover → Compare */}
        {phase >= steps.length - 1 && signature && recoveredAddress && expectedAddress && (
        <div className="signature-verify-container">

            <h2 className="verify-title">簽章驗證 — Signature ➜ Address 比對</h2>

            <div className="verify-flow">
            <div className="verify-box">
                <h4>🖊 Signature</h4>
                <p className="mono">{signature.slice(0,20)}...{signature.slice(-20)}</p>
            </div>

            <div className="arrow-flow">⇩ Recover</div>

            <div className="verify-box">
                <h4>Recovered Address</h4>
                <p className="mono highlight">{recoveredAddress}</p>
            </div>

            <div className="arrow-flow">⇩ 比對 DB</div>

            <div className="verify-box">
                <h4>DB 存的 Student Public Key</h4>
                <p className="mono highlight">{expectedAddress}</p>
            </div>

            <div className="arrow-flow">⇩ 結果</div>

            <div className="verify-result">
                {recoveredAddress.toLowerCase() === expectedAddress.toLowerCase() ? (
                <div className="verify-ok">✔ 驗證通過 — 本人簽到</div>
                ) : (
                <div className="verify-failed electric-effect">⚡ 非本人簽章 — 防代簽成功</div>
                )}
            </div>
            </div>
        </div>
        )}




      {/* 🔙 控制按鈕 */}
      <div className="demo-actions">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ⬅ 返回上一頁
        </button>
        <button className="btn btn-primary" onClick={() => setPhase(0)}>
         重新播放動畫
        </button>
      </div>
    </div>
  );
}
