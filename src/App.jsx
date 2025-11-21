// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TeacherHome from "./pages/TeacherHome";
import CreateCoursePage from "./pages/CreateCoursePage";
import StudentHome from "./pages/StudentHome";
import JoinClassPage from "./pages/JoinClassPage";
import StudentForm from "./pages/StudentForm";
import AttendancePage from "./pages/AttendancePage";
import CourseDetailPage from "./pages/CourseDetailPage";
import StudentCourseDetailPage from "./pages/StudentCourseDetailPage";
import LoginPage from "./pages/LoginPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import EditStudentProfilePage from "./pages/EditStudentProfilePage";
import ThemeToggle from "./components/ThemeToggle";
import { Toaster } from "react-hot-toast";
import "./styles/ui.css";
import SessionExplorer from "./pages/SessionExplorer";

// ⭐ 必須加這行（你之前缺少）
import BlockchainTamperDemo from "./pages/BlockchainTamperDemo";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <>
      <ThemeToggle />
      <Toaster position="top-center" />

      <Routes>
        {currentUser.role === "teacher" ? (
          <>
            {/* 👩‍🏫 老師端 */}
            <Route path="/teacher" element={<TeacherHome user={currentUser} onLogout={handleLogout} />} />
            <Route path="/create-course" element={<CreateCoursePage teacher={currentUser} />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/course/:course_id" element={<CourseDetailPage />} />

            {/* ⭐ 正確位置：放在 * 前面 */}
            <Route path="/teacher/course/:course_id/session/:session_id/explorer" element={<SessionExplorer />} />

            <Route path="*" element={<Navigate to="/teacher" />} />
          </>
        ) : (
          <>
            {/* 🎓 學生端 */}
            <Route path="/student" element={<StudentHome username={currentUser.username} onLogout={handleLogout} />} />
            <Route path="/join-class" element={<JoinClassPage username={currentUser.username} />} />
            <Route path="/form" element={<StudentForm />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/student/course/:course_id" element={<StudentCourseDetailPage username={currentUser.username} />} />
            <Route path="/student/profile" element={<StudentProfilePage username={currentUser.username} />} />
            <Route path="/student/profile/edit" element={<EditStudentProfilePage username={currentUser.username} />} />

            {/* ⭐ 修正：demo route */}
            <Route path="/blockchain/demo" element={<BlockchainTamperDemo />} />

            <Route path="*" element={<Navigate to="/student" />} />
          </>
        )}
      </Routes>
    </>
  );
}

export default App;
