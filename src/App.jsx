import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLogin from './components/admin/AdminLogin.jsx';
import AdminPage from './Pages/AdminPage/AdminPage.jsx'; 
import UserLogin from './components/user/UserLogin.jsx';
import './components/user/UserLayout.css';
import UserPage from './pages/UserPage.jsx';


function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("currentUser");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem("currentAdmin");
    try {
      return savedAdmin ? JSON.parse(savedAdmin) : null;
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
    const handleAdminStorageChange = () => {
      const savedAdmin = localStorage.getItem("currentAdmin");
      setCurrentAdmin(savedAdmin ? JSON.parse(savedAdmin) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage', handleAdminStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleAdminStorageChange);
    };
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

  const handleAdminLogin = (admin) => {
    localStorage.setItem("currentAdmin", JSON.stringify(admin));
    setCurrentAdmin(admin);
    navigate('/admin/dashboard');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("currentAdmin");
    setCurrentAdmin(null);
    navigate('/admin/login');
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      {/* Admin Routes */}
      <Route
        path="admin/*"
        element={
          currentAdmin ? <AdminPage currentAdmin={currentAdmin} onLogout={handleAdminLogout} /> : <Navigate to="/admin/login" replace />
        }
      />
      <Route path="admin/login" element={!currentAdmin ? <AdminLogin onLogin={handleAdminLogin} /> : <Navigate to="/admin/dashboard" replace />} />
      
      {/* User Routes */}
      <Route path="user/*" element={currentUser ? <UserPage currentUser={currentUser} onLogout={handleLogout} /> : <Navigate to="/user/login" replace />} />
      <Route path="user/login" element={<UserLogin onLogin={handleLogin} />} />

      {/* Fallback for any other unmatched routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
