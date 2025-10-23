import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Spinner } from 'react-bootstrap';

// Auth and Layout
import UserLogin from './Pages/UserPage/UserLogin.jsx';
import AdminSetup from './Pages/AdminPage/AdminSetup.jsx'; // Import the new setup component
import AdminForgotPassword from './Pages/AdminPage/AdminForgotPassword.jsx'; // Import the new component
import AdminLogin from './Pages/AdminPage/AdminLogin.jsx';

// Corrected import path for the protected route component
import UserProtectedRoute from './Pages/UserPage/UserProtectedRoute.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';

// Modern Admin Pages (from /components/admin)

import Dashboard from './components/admin/Dashboard.jsx';
import ManageQuestions from './components/admin/ManageQuestions.jsx';
import UserManagement from './components/admin/UserManagement.jsx';
import AppearanceSettings from './components/admin/AppearanceSettings.jsx';
import ManageAdmins from './Pages/AdminPage/ManageAdmins.jsx';
import PublishQueue from './components/admin/PublishQueue.jsx';

// Legacy or other Admin Pages (from /Pages/AdminPage)
import QuestionHistory from './Pages/AdminPage/QuestionHistory.jsx';
import Leaderboard from './Pages/AdminPage/Leaderboard.jsx';
import ViewScores from './Pages/AdminPage/ViewScores.jsx';
import ActiveUser from './Pages/AdminPage/ActiveUser.jsx';
import UserScoreDetails from './components/UserScoreDetails.jsx'; // Import the new component

// User Pages
import Home from './Pages/UserPage/Home.jsx';
import UserDashboard from './Pages/UserPage/UserDashboard.jsx';
import UserRegistration from './Pages/UserPage/UserRegistration.jsx';
import Quiz from './Pages/UserPage/Quiz.jsx';
import PerformanceHistory from './Pages/UserPage/PerformanceHistory.jsx';
import ScoreDetail from './Pages/UserPage/ScoreDetail.jsx';

// Error Pages
import NotFound from './Pages/Error/NotFound.jsx';
import { apiFetch, getCurrentUser } from './services/apiServices.js';
import { useAuth } from './contexts/AuthContext.jsx';

// Wrapper component to use the outlet context
const UserQuizPage = () => {
  const { currentUser } = useOutletContext();
  return <Quiz currentUser={currentUser} />;
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
  const { authenticatedUser, setUser, logout } = useAuth();
  const [activeUsers, setActiveUsers] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(true); // Unified loading state
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Check if the initial admin setup is complete
        const { isSetupComplete } = await apiFetch('/auth/setup-status', { isPublic: true });
        setIsSetupComplete(isSetupComplete);

        // 2. Check for an existing session if no user is authenticated
        if (!authenticatedUser) {
          // The most reliable way to restore a session is to ask the backend
          // who the current user is. The browser's httpOnly cookie handles the auth.
          const userData = await getCurrentUser();
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        // This can happen if the API is down or if getCurrentUser fails (e.g., invalid token)
        console.error("Failed to initialize app or restore session:", error);
        logout(); // Ensure a clean state on error
      } finally {
        setIsLoading(false); // Stop loading once all checks are done
      }
    };

    initializeApp();
  }, [setUser, logout]); // This should only run once on initial app load.

  const navigate = useNavigate();
  const location = useLocation();

  // Derived state for convenience
  const isUserAdmin = authenticatedUser?.role === 'ADMIN';
  const currentUser = !isUserAdmin ? authenticatedUser : null;
  const currentAdmin = isUserAdmin ? authenticatedUser : null;

  const handleAdminLogin = (userData) => {
    setUser(userData); // Just update the state. The routing logic will handle navigation.
  };

  const handleUserLogin = (userData) => {
    setUser(userData);
    navigate('/user/home', { replace: true });
  };

  const handleLogout = () => {
    apiFetch('/auth/logout', { method: 'POST' }); // Explicitly call the backend logout
    logout(); // This clears the frontend user state and tokens
    // Always redirect to the admin login page after logout.
    navigate('/admin/login', { replace: true });
  };

  const handleSetupComplete = () => {
    setIsSetupComplete(true);
  };

  const toggleTheme = () => {
    setTheme(current => (current === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.body.setAttribute('data-bs-theme', theme);
  }, [theme]);

  // Show a loading indicator while we check the setup status
  if (isLoading) {
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
        {/* Intelligent Root Path Redirect */}
        <Route
          path="/"
          element={
            isUserAdmin ? (
              <Navigate to="/admin/dashboard" replace />
            ) : currentUser ? (
              <Navigate to="/user/home" replace />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        {/* Conditional Admin Root: Setup or Login */}
        <Route path="admin/login" element={
          currentAdmin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin onLogin={handleAdminLogin} isSetupComplete={isSetupComplete} />
        } />
        <Route path="admin/setup" element={isSetupComplete ? <Navigate to="/admin/login" replace /> : <AdminSetup onLogin={handleAdminLogin} onSetupComplete={handleSetupComplete} />} />
        <Route path="admin/forgot-password" element={<AdminForgotPassword />} />

        {/* Protected Admin Routes */}
        {/* This route is only accessible if a user is authenticated AND their role is ADMIN. */}
        <Route
          path="/admin"
          element={authenticatedUser && isUserAdmin ? <AdminLayout currentAdmin={currentAdmin} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} /> : <Navigate to="/admin/login" replace />}
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="questions" element={<ManageQuestions />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/:userId/scores" element={<UserScoreDetails />} />
          <Route path="appearance" element={<AppearanceSettings />} />
          {/* Pass currentAdmin to ManageAdmins for highlighting and self-deletion prevention */}
          <Route path="manage-admins" element={<ManageAdmins currentAdmin={currentAdmin} />} />
          <Route path="publish" element={<PublishQueue />} />
          <Route path="history" element={<QuestionHistory />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="scores" element={<ViewScores />} />
          <Route path="users/active" element={<ActiveUser />} />
        </Route>

        {/* Public User Login Route */}
        <Route path="user/login" element={
          currentUser ? <Navigate to="/user/home" replace /> : <UserLogin onLogin={handleUserLogin} />
        } />

        <Route path="user/register" element={
          currentUser ? <Navigate to="/user/home" replace /> : <UserRegistration />
        } />

        {/* 
          If a logged-in user IS an admin, any attempt to access a /user/* path
          should redirect them back to their admin dashboard. This prevents 404s and confusion.
        */}
        {isUserAdmin && <Route path="/user/*" element={<Navigate to="/admin/dashboard" replace />} />}

        {/* Protected User Routes - Only render these if the authenticated user is NOT an admin */}
        {authenticatedUser && !isUserAdmin && (
          <Route path="/user" element={<UserProtectedRoute user={currentUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} /> {/* Render Home directly */}
            <Route path="dashboard" element={<UserDashboardPage />} />
            <Route path="quiz" element={<UserQuizPage />} />
            <Route path="history" element={<UserHistoryPage />} />
            <Route path="score/:id" element={<UserScoreDetailPage />} />
            <Route path="*" element={<Navigate to="home" replace />} />
          </Route>
        )}

        {/* Fallback for any other unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
