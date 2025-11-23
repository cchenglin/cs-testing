console.log('目前使用的 API_BASE 是：', import.meta.env.VITE_API_BASE);
alert('API_BASE 是：' + import.meta.env.VITE_API_BASE); // 手機會跳視窗

// 小工具：統一 API_BASE、帶上 token、錯誤處理
const API_BASE = import.meta.env.VITE_API_BASE;

if (!API_BASE) {
  console.error("VITE_API_BASE 未設定！請到 Vercel 補填 ngrok 網址");
}

export async function apiFetch(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export { API_BASE };
