// src/pages/StudentForm.jsx
import { useState, useEffect } from "react";

export default function StudentForm({ form, onSubmit }) {
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    if (form && form.questions) {
      setAnswers(form.questions.map(() => ""));
    }
  }, [form]);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(answers);
  };

  if (!form || !Array.isArray(form.questions) || form.questions.length === 0) {
    return <div>載入中...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>填寫表單：{form.name}</h2>
      <form onSubmit={handleSubmit}>
        {form.questions.map((q, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              {i + 1}. {q.text}
            </label>
            {q.type === "shortAnswer" ? (
              <input
                type="text"
                value={answers[i]}
                onChange={(e) => handleAnswerChange(i, e.target.value)}
                style={{ width: "100%", padding: 6 }}
                required
              />
            ) : (
              <select
                value={answers[i]}
                onChange={(e) => handleAnswerChange(i, e.target.value)}
                style={{ width: "100%", padding: 6 }}
                required
              >
                <option value="">請選擇</option>
                <option value="是">是</option>
                <option value="否">否</option>
              </select>
            )}
          </div>
        ))}
        <button type="submit" style={{ padding: "8px 16px" }}>
          送出答案
        </button>
      </form>
    </div>
  );
}
