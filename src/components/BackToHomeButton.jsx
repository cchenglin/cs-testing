// src/components/BackToHomeButton.jsx
import { useNavigate } from "react-router-dom";

export default function BackToHomeButton({ role = "student" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (role === "teacher") {
      navigate("/teacher");
    } else {
      navigate("/student");
    }
  };

  return (
    <button onClick={handleBack} className="back-btn" title="返回主畫面">
      🏠
    </button>
  );
}
