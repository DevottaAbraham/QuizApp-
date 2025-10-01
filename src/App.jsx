import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout.jsx';
import UserLayout from './components/user/UserLayout.jsx'; 
import UserLogin from './components/user/UserLogin.jsx';
import UserDashboard from './components/user/UserDashboard.jsx';
import Home from './components/user/Home.jsx';
import Quiz from './components/user/Quiz.jsx';
import PerformanceHistory from './components/user/PerformanceHistory.jsx';
import ScoreDetail from './components/user/ScoreDetail.jsx';
import './components/user/UserLayout.css';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("currentUser");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      const savedUser = localStorage.getItem("currentUser");
      setCurrentUser(savedUser ? JSON.parse(savedUser) : null);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = (user) => {
    // Add user to active users list
    const activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || [];
    if (!activeUsers.some(u => u.userId === user.userId)) {
      activeUsers.push(user);
      localStorage.setItem("activeUsers", JSON.stringify(activeUsers));
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    setCurrentUser(user);
    window.dispatchEvent(new Event('storageUpdated')); // Notify dashboard

    // Check for active quizzes and redirect accordingly
    const allQuestions = JSON.parse(localStorage.getItem("quizQuestions")) || [];
    const now = new Date();
    const hasActiveQuiz = allQuestions.some(q => {
        if (q.status !== 'published' || !q.releaseDate || !q.disappearDate) {
            return false;
        }
        const release = new Date(q.releaseDate);
        const disappear = new Date(q.disappearDate);
        return now >= release && now < disappear;
    });

    navigate(hasActiveQuiz ? '/user/quiz' : '/user/home');
  };

  const handleLogout = () => {
    // Remove user from active users list
    const activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || [];
    const updatedActiveUsers = activeUsers.filter(u => u.userId !== currentUser.userId);
    localStorage.setItem("activeUsers", JSON.stringify(updatedActiveUsers));
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate('/user/login');
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      <Route path="admin/*" element={<AdminLayout />} />

      {currentUser ? (
        // Authenticated user routes
        <Route path="user" element={<UserLayout currentUser={currentUser} onLogout={handleLogout} />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="score" element={<PerformanceHistory />} />
          <Route path="score/:date" element={<ScoreDetail />} />
          {/* Redirect any other authenticated /user/* routes to the dashboard */}
          <Route path="*" element={<Navigate to="home" replace />} />
        </Route>
      ) : (
        // Unauthenticated user routes
        <Route path="user/login" element={<UserLogin onLogin={handleLogin} />} />
      )}
      {/* Redirect any other /user/* route to the login page if not authenticated */}
      <Route path="user/*" element={<Navigate to="/user/login" replace />} />
    </Routes>
  );
}

export default App;
