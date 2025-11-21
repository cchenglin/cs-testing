function HomePage({ username, onLogout }) {
  return (
    <div>
      <h1>歡迎，{username}</h1>
      <button onClick={() => alert("點名功能")}>點名簽到</button>
      <button onClick={() => alert("填寫表單")}>填寫表單</button>
      <button onClick={() => alert("查看報表")}>查看報表</button>
      <button onClick={onLogout}>登出</button>
    </div>
  );
}

export default HomePage;
