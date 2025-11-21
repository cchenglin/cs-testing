// backend/blockchain.js
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// 預設變數
let writeOnchainByHash;
let readSeenByHash;
let getAbiFunctions;

// 🟡 模擬模式（開發階段預設）
if (!RPC_URL || !CONTRACT_ADDRESS || !PRIVATE_KEY) {
  console.warn("⚠️ 偵測到缺少鏈上設定，後端啟用『模擬模式』");

  writeOnchainByHash = async (hash) => {
    console.log("🧩 [Mock 上鏈中] hash =", hash);
    return "mock_tx_hash_" + Date.now();
  };

  readSeenByHash = async (hash) => {
    console.log("🧩 [Mock 查詢上鏈紀錄] hash =", hash);
    return { seen: false };
  };

  getAbiFunctions = () => ["mock_recordData", "mock_seen"];

  console.log("✅ Backend 已進入模擬區塊鏈模式（不會連線真實鏈）");
} else {
  // 🧩 實際鏈上模式
  const abiPath = path.join(__dirname, "abi", "AttendanceRecorder.json");
  const artifact = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  const abi = artifact.abi;

  // ⭐ 正確的 ethers v5 Provider 寫法
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  // ⭐ 正確的 ethers v5 Wallet 寫法
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // ⭐ ethers v5 Contract 寫法（不變）
  const c = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

  // ✅ 確保雜湊為正確 bytes32 格式
  function toBytes32Hex(x) {
    const h = (x || "").toString().trim().toLowerCase();
    const clean = h.startsWith("0x") ? h : "0x" + h;
    if (clean.length !== 66) {
      console.warn("⚠️ Hash 長度非 32 bytes:", clean);
    }
    return clean;
  }

  // ✅ 寫入鏈上
  writeOnchainByHash = async (dataHashHex) => {
    try {
      const h32 = toBytes32Hex(dataHashHex);
      console.log("📤 [上鏈中] data_hash =", h32);

      const tx = await c.recordData(h32);
      console.log("⏳ 等待區塊確認中... txHash =", tx.hash);

      const receipt = await tx.wait();

      console.log("✅ 上鏈成功：", {
        data_hash: h32,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      });

      return receipt.transactionHash;
    } catch (err) {
      console.error("❌ 上鏈失敗：", err);
      throw err;
    }
  };

  // ✅ 查詢鏈上紀錄
  readSeenByHash = async (dataHashHex) => {
    try {
      const h32 = toBytes32Hex(dataHashHex);
      console.log("🔍 [查詢鏈上紀錄] data_hash =", h32);

      const ok = await c.seen(h32);
      console.log("🔍 查詢結果：", ok ? "✅ 已存在" : "❌ 未找到");

      return { seen: ok };
    } catch (err) {
      console.error("❌ 查詢鏈上紀錄失敗：", err);
      throw err;
    }
  };

  // ⭐ ethers v5 的 ABI function 讀取方式
  getAbiFunctions = () => {
    try {
      return c.interface.fragments
        .filter((f) => f.type === "function")
        .map((f) => f.name);
    } catch {
      return [];
    }
  };

  console.log("✅ Blockchain 已載入實際合約:", CONTRACT_ADDRESS);
}

export { writeOnchainByHash, readSeenByHash, getAbiFunctions };
