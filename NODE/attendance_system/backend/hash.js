const bcrypt = require('bcrypt');
(async () => {
  const h = await bcrypt.hash('1234', 10);  // 把 1234 改成你要的密碼
  console.log(h);
})();
