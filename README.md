Blockchain Attendance Verification System
📦 專案簡介 | Project Overview

這是一個「課程點名與鏈上驗證」的全端專案：

前端 (Frontend)：Vite/React，提供學生簽到與老師管理介面。

後端 (Backend)：Node.js + Express，提供課程／簽到 API、上鏈流程與鏈上查驗。

鏈上 (Chain)：智慧合約互動封裝（可接本地或遠端節點；無設定時自動進入模擬模式）。

This is a full-stack “Attendance with On-Chain Verification” project:

Frontend (Vite/React) for student check-in and teacher dashboard.

Backend (Node.js/Express) exposing course/attendance APIs, writes to chain and verifies on chain.

Chain helper to talk to a smart contract (falls back to mock mode when not configured).

🗂️ 專案結構 | Project Structure

目前配置：backend 與 chain 都在 NODE\attendance_system 底下；前端在 cs-project-main 根目錄。
Current layout: backend and chain under NODE\attendance_system; frontend at project root.

C:\Users\user\Desktop\cs-project-main\
├─ backend\                # Node.js API server (Express)
│  ├─ app.js               # Server entry
│  ├─ blockchain.js        # On-chain write/read helpers (ethers v6)
│  ├─ db.js                # MySQL pool
│  ├─ .env.example         # Example env
│  └─ ...
├─ chain\                  # (optional) ABI / helpers
│  └─ abi\AttendanceRecorder.json (if present)
├─ (frontend files here)   # Vite/React app, run `npm run dev`
└─ README.md               # ← this file (recommended at project root)

需求 | Requirements

Node.js 18+

npm 9+

MySQL 8+

（可選 Optional）EVM 相容節點 / RPC（本地或遠端）

# ====== Database (MySQL) ======
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=12345678
DB_NAME=attendance_system
DB_TYPE=mysql

# ====== JWT ======
JWT_SECRET=super_secret_change_me

# ====== Blockchain (optional; leave empty for mock mode) ======
# 缺任一項 → 自動啟用模擬模式（不連鏈也可完整跑流程）
RPC_URL=
CONTRACT_ADDRESS=
PRIVATE_KEY=


▶️ 啟動專案 | Run the Project
1) 後端 Backend
cd C:\Users\user\Desktop\cs-project-main\NODE\attendance_system\backend
npm install
node app.js
後端預設：http://localhost:3001/

2) 前端 Frontend
cd C:\Users\user\Desktop\cs-project-main
npm install
npm run dev
Vite Dev Server 通常為 http://localhost:5173/（或自動換 5174）。

🧪 最快測試流程 | Quick Smoke Test

以教師登入（例如 teacher2 / password2），建立或選一門課，按 開始點名。

開新視窗或無痕，以學生登入（例如 56 / 56），進課程按 我要簽到。

回老師端數秒後，在該場次欄位看到：

✅ 出席 / 鏈上完成（真實鏈上）或

✅ 出席 / 待上鏈（模擬模式或 txhash 尚未寫回）。

點 🧩 檢視上鏈狀態 檢查每筆 data_hash 的 on-chain 查驗結果。

🔍 常見問題 | FAQ / Troubleshooting

CORS 錯誤：後端已允許 http://localhost:5173/5174，若改前端 port 請同步調整 CORS。

DB 連不上：確認 MySQL 啟動、帳密正確、DB 存在（attendance_system）。

都顯示「待上鏈」：

檢查 .env 是否為模擬模式；

確認 attendance.onchain_txhash 是否寫回；

/onchain/seen/:datahash 是否回 {seen:true}。

Port 已被占用：

Backend：改 PORT 或釋放 3001

Frontend：Vite 會自動跳下個可用 port（如 5174）