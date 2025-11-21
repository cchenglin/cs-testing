// src/components/ThemeToggle.jsx
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="btn btn-warning"
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 999,
      }}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
