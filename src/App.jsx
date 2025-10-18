import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Spinner } from 'react-bootstrap';

// Auth and Layout
import UserLogin from './pages/UserPage/UserLogin.jsx';
import AdminSetup from './Pages/AdminPage/AdminSetup.jsx'; // Import the new setup component
import AdminLogin from './Pages/AdminPage/AdminLogin.jsx';

// Corrected import path for the protected route component
import UserProtectedRoute from './Pages/UserPage/UserProtectedRoute.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';

// Modern Admin Pages (from /components/admin)

import Dashboard from './components/admin/Dashboard.jsx';
import ManageQuestions from './components/admin/ManageQuestions.jsx';
import UserManagement from './components/admin/UserManagement.jsx';
import ManageNotices from './components/admin/ManageNotices.jsx';
import AppearanceSettings from './components/admin/AppearanceSettings.jsx';
import ManageAdmins from './Pages/AdminPage/ManageAdmins.jsx';
import PublishQueue from './components/admin/PublishQueue.jsx';

// Legacy or other Admin Pages (from /Pages/AdminPage)
import QuestionHistory from './Pages/AdminPage/QuestionHistory.jsx';
import Leaderboard from './Pages/AdminPage/Leaderboard.jsx';
import ViewScores from './Pages/AdminPage/ViewScores.jsx';
import ActiveUser from './pages/AdminPage/ActiveUser.jsx';

// User Pages
import Home from './pages/UserPage/Home.jsx';
import UserDashboard from './Pages/UserPage/UserDashboard.jsx';
import Quiz from './pages/UserPage/Quiz.jsx';
import PerformanceHistory from './Pages/UserPage/PerformanceHistory.jsx';
import ScoreDetail from './Pages/UserPage/ScoreDetail.jsx';

// Error Pages
import NotFound from './pages/Error/NotFound.jsx';
import { setAuthToken, clearAuthToken, apiFetch } from './services/apiServices.js';

// Wrapper component to use the outlet context
const UserQuizPage = () => {
  const { currentUser } = useOutletContext();
  return <Quiz currentUser={currentUser} />;
};

const UserHomePage = () => {
  const { currentUser } = useOutletContext();
  return <Home currentUser={currentUser} />;
};

const UserDashboardPage = () => {
  const { currentUser } = useOutletContext();
  return <UserDashboard currentUser={currentUser} />;
};

const UserHistoryPage = () => {
  const { currentUser } = useOutletContext();
  return <PerformanceHistory currentUser={currentUser} />;
};

const UserScoreDetailPage = () => {
  const { currentUser } = useOutletContext();
  return <ScoreDetail currentUser={currentUser} />;
};

function App() {
  // Unified state for any authenticated user (admin or regular user)
  const [authenticatedUser, setAuthenticatedUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')));
  const [activeUsers, setActiveUsers] = useState([]);
  const [theme, setTheme] = useState('light');
  const [isSetupComplete, setIsSetupComplete] = useState(null); // null: loading, true: setup done, false: needs setup

  useEffect(() => {
    // Check if the initial admin setup is complete when the app loads
    const checkSetup = async () => {
      try {
        const { isSetupComplete } = await apiFetch('/auth/setup-status');
        setIsSetupComplete(isSetupComplete);
      } catch (error) {
        console.error("Failed to check setup status:", error);
        setIsSetupComplete(true); // Fail safe to the login page
      }
    };
    checkSetup();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // This effect runs after `authenticatedUser` state has been updated.
    if (authenticatedUser) {
      if (authenticatedUser.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/user/home', { replace: true });
      }
    }
  }, [authenticatedUser]); // Dependency array ensures this runs only when the user state changes.

  // Derived state for convenience
  const isUserAdmin = authenticatedUser?.role === 'ADMIN';
  const currentUser = !isUserAdmin ? authenticatedUser : null;
  const currentAdmin = isUserAdmin ? authenticatedUser : null;

  const handleLogin = (user) => {
    setAuthToken(user);
    setAuthenticatedUser(user); // Just set the state. The useEffect will handle navigation.
  };

  const handleLogout = () => {
    clearAuthToken();
    setAuthenticatedUser(null);
    // Redirect to a public page after logout
    if (location.pathname.startsWith('/admin')) {
      navigate('/admin/login');
    } else {
      navigate('/user/login');
    }
  };

  const toggleTheme = () => {
    setTheme(current => (current === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.body.setAttribute('data-bs-theme', theme);
  }, [theme]);

  // Show a loading indicator while we check the setup status
  if (isSetupComplete === null) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        {/* Root path redirects to admin login by default */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* Conditional Admin Root: Setup or Login */}
        <Route path="admin/login" element={
          currentAdmin ? <Navigate to="/admin/dashboard" replace /> :
          isSetupComplete ? <AdminLogin onLogin={handleLogin} /> : <Navigate to="/admin/setup" replace />
        } />
        <Route path="admin/setup" element={isSetupComplete ? <Navigate to="/admin/login" replace /> : <AdminSetup />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={currentAdmin ? <AdminLayout currentAdmin={currentAdmin} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} /> : <Navigate to="/admin/login" replace />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="questions" element={<ManageQuestions />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="notices" element={<ManageNotices />} />
          <Route path="appearance" element={<AppearanceSettings />} />
          {/* The ManageAdmins component will handle its own visibility logic if needed */}
          <Route path="manage-admins" element={<ManageAdmins />} />
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
          <Route path="home" element={<UserHomePage />} />
          <Route path="dashboard" element={<UserDashboardPage />} />
          <Route path="quiz" element={<UserQuizPage />} />
          <Route path="history" element={<UserHistoryPage />} />
          <Route path="score/:id" element={<UserScoreDetailPage />} />
          <Route path="*" element={<Navigate to="home" replace />} />
        </Route>

        {/* Fallback for any other unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
