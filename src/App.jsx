import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth and Layout
import AdminLogin from './components/admin/AdminLogin.jsx';
import UserLogin from './Pages/UserPage/UserLogin.jsx';

// Corrected import path for the protected route component
import AdminProtectedRoute from './components/admin/AdminProtectedRoute.jsx';
import UserProtectedRoute from './Pages/UserPage/UserProtectedRoute.jsx';

// Modern Admin Pages (from /components/admin)
import Dashboard from './components/admin/Dashboard.jsx';
import ManageQuestions from './components/admin/ManageQuestions.jsx';
import UserManagement from './components/admin/UserManagement.jsx';
import ManageNotices from './components/admin/ManageNotices.jsx';
import AppearanceSettings from './components/admin/AppearanceSettings.jsx';
import ManageAdmins from './components/admin/ManageAdmins.jsx';
import PublishQueue from './components/admin/PublishQueue.jsx';

// Legacy or other Admin Pages (from /Pages/AdminPage)
import QuestionHistory from './Pages/AdminPage/QuestionHistory.jsx';
import Leaderboard from './Pages/AdminPage/Leaderboard.jsx';
import ViewScores from './Pages/AdminPage/ViewScores.jsx';
import ActiveUser from './Pages/AdminPage/ActiveUser.jsx';

// User Pages
import Home from './Pages/UserPage/Home.jsx';
import UserDashboard from './Pages/UserPage/UserDashboard.jsx';
import Quiz from './Pages/UserPage/Quiz.jsx';
import PerformanceHistory from './Pages/UserPage/PerformanceHistory.jsx';
import ScoreDetail from './Pages/UserPage/ScoreDetail.jsx';

// Error Pages
import NotFound from './Pages/Error/NotFound.jsx';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  // Initialize admin state from localStorage
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem('currentAdmin');
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });
  const [activeUsers, setActiveUsers] = useState([]);
  const [theme, setTheme] = useState('light');

  const navigate = useNavigate();
  const location = useLocation();

  // Effect to save admin to localStorage whenever it changes
  useEffect(() => {
    if (currentAdmin) {
      localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
    } else {
      localStorage.removeItem('currentAdmin');
    }
  }, [currentAdmin]);

  const handleLogin = (user) => {
    // Add user to active users list if not already present
    setActiveUsers(prevUsers => {
      if (!prevUsers.some(u => u.userId === user.userId)) {
        return [...prevUsers, user];
      }
      return prevUsers;
    });
    setCurrentUser(user);
    navigate('/user/home'); // Simplified redirection
  };

  const handleLogout = () => {
    setActiveUsers(prevUsers => prevUsers.filter(u => u.userId !== currentUser?.userId));
    setCurrentUser(null);
  };

  const handleAdminLogin = (admin) => {
    setCurrentAdmin(admin);
    // The useEffect will handle saving to localStorage
    navigate('/admin/dashboard'); // Explicitly navigate on login
  };

  const handleAdminLogout = () => {
    // This will trigger the useEffect to clear localStorage
    setCurrentAdmin(null);
  };

// In App.jsx
useEffect(() => {
  document.body.setAttribute('data-bs-theme', theme);
}, [theme]);

  const toggleTheme = () => {
    setTheme(current => (current === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      <Routes>
        {/* Root path redirects to admin login by default */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* Public Admin Login Route */}
        <Route path="admin/login" element={
          currentAdmin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin onLogin={handleAdminLogin} />
        } />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminProtectedRoute admin={currentAdmin} onLogout={handleAdminLogout} theme={theme} toggleTheme={toggleTheme} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="questions" element={<ManageQuestions />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="notices" element={<ManageNotices />} />
          <Route path="appearance" element={<AppearanceSettings />} />
          {/* Only show the Manage Admins route if the logged-in admin is the main 'admin' user */}
          {currentAdmin?.username === 'admin' && <Route path="manage-admins" element={<ManageAdmins />} />}
          <Route path="publish" element={<PublishQueue />} />
          <Route path="history" element={<QuestionHistory />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="scores" element={<ViewScores />} />
          <Route path="activeUser" element={<ActiveUser />} />
        </Route>

        {/* Public User Login Route */}
        <Route path="user/login" element={
          currentUser ? <Navigate to="/user/home" replace /> : <UserLogin onLogin={handleLogin} />
        } />

        {/* Protected User Routes */}
        <Route path="/user" element={<UserProtectedRoute user={currentUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home currentUser={currentUser} />} />
          <Route path="dashboard" element={<UserDashboard currentUser={currentUser} />} />
          <Route path="quiz" element={<Quiz currentUser={currentUser} />} />
          <Route path="score" element={<PerformanceHistory currentUser={currentUser} />} />
          <Route path="score/:date" element={<ScoreDetail currentUser={currentUser} />} />
          <Route path="*" element={<Navigate to="home" replace />} />
        </Route>

        {/* Fallback for any other unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default App;
