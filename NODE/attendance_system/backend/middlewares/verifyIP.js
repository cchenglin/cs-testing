module.exports = function verifyIP(req, res, next) {
  let ip = req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress;

  // 有些會出現 "::ffff:140.113.20.17" → 清理一下格式
  ip = ip.replace("::ffff:", "");

  console.log("User IP:", ip);

  const allowedRanges = ["10.", "172.16.", "140.113."]; // 自己換成學校的

  const isAllowed = allowedRanges.some((range) => ip.startsWith(range));

  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      message: "IP 驗證失敗：請連接校園網路後再簽到。",
      ip,
    });
  }

  next(); // 通過驗證
};
