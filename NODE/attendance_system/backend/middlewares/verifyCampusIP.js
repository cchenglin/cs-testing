// ./middlewares/verifyCampusIP.js

// demoMode = true 時：當抓不到 IP 就會塞一個示範用的校內 IP（方便展示）
// demoMode = false 時：會嘗試取真實 IP（x-forwarded-for / socket.remoteAddress / req.ip）
const demoMode = false; // 測試展示時改成 true

function getClientIP(req) {
  // 優先 x-forwarded-for（多 proxy 時會是 comma-separated），再 fallback
  const xff = req.headers["x-forwarded-for"];
  let ip =
    (xff && xff.split(",")[0]) ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    "";

  // 移除 IPv4-mapped IPv6 prefix（例如 ::ffff:127.0.0.1）
  ip = String(ip).replace("::ffff:", "").trim();

  return ip;
}

// 校園允許的 IP 網段（如需新增請加在此）→ 改成實際校園範圍，例如台大140.113.*
const allowedRanges = [
  /^140\.113\./,  // 替換成你的校園IP前綴，例如 /^140\.113\./ 或 /^192\.168\.1\./
  /^127\.0\.0\.1$/,
  /^::1$/,
];

function verifyCampusIP(req, res, next) {
  let ip = getClientIP(req);

  // DEMO mode：若抓不到就塞一個示範校內 IP（保證展示成功）
  if (demoMode && (!ip || ip === "" || ip === "0.0.0.0")) {
    ip = "140.113.0.1";  // 改成範例校園IP
    console.log("🟩 verifyCampusIP DEMO MODE: force IP ->", ip);
  }

  // 若仍沒抓到，給一個可辨識的 placeholder（避免 null）
  if (!ip || ip === "") {
    ip = "0.0.0.0";
  }

  // 判斷是否校內 IP（使用 allowedRanges）
  const isCampusIP = allowedRanges.some((re) => re.test(ip));

  // attach 到 req 以便後續 route 使用
  req.client_ip = ip;
  req.isCampusIP = isCampusIP;

  console.log(`🌐 [verifyCampusIP] ip=${ip}  isCampus=${isCampusIP ? 'V (符合)' : 'X (不符合)'}`);  // 改善log，加V/X

  // 不阻擋請求（maintain current behavior）
  next();
}

module.exports = verifyCampusIP;