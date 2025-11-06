import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Auth and Layout
import UserLogin from './Pages/UserPage/UserLogin.jsx';
import AdminSetup from './Pages/AdminPage/AdminSetup.jsx';
import AdminForgotPassword from './Pages/AdminPage/AdminForgotPassword.jsx';
import AdminLogin from './Pages/AdminPage/AdminLogin.jsx';

// Import Layouts
import AdminLayout from './components/admin/AdminLayout.jsx';
import UserLayout from './components/user/UserLayout.jsx';
import RootRedirect from './components/RootRedirect.jsx'; // Import the new component
import ForcePasswordChange from './Pages/UserPage/ForcePasswordChange.jsx';
import UserRegistration from './Pages/UserPage/UserRegistration.jsx';


// Import Admin Pages
import Dashboard from './components/admin/Dashboard.jsx';
import ManageUsers from './components/admin/ManageUsers.jsx';
import ManageAdmins from './Pages/AdminPage/ManageAdmins.jsx';
import ManageQuestions from './components/admin/ManageQuestions.jsx';
import PublishQueue from './components/admin/PublishQueue.jsx';
import QuestionHistory from './Pages/AdminPage/QuestionHistory.jsx'; // Import the new component
import ViewScores from './Pages/AdminPage/ViewScores.jsx';
import UserPerformance from './components/admin/UserPerformance.jsx';
import AdminMonthlyPerformance from './Pages/AdminPage/AdminMonthlyPerformance.jsx';
import AppearanceSettings from './Pages/AdminPage/AppearanceSettings.jsx';
import Leaderboard from './Pages/AdminPage/Leaderboard.jsx';

// User Pages
import Home from './components/user/Home.jsx';
import QuizPage from './Pages/UserPage/Quiz.jsx';
import PerformanceHistory from './Pages/UserPage/PerformanceHistory.jsx';
import ScoreDetail from './Pages/UserPage/ScoreDetail.jsx'; 
import MyScore from './components/user/MyScore.jsx';

// Error Pages
import NotFound from './Pages/Error/NotFound.jsx';

function App() {
    // Centralized theme management
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const location = useLocation();

    useEffect(() => {
        document.body.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Apply a specific background color for login/setup pages
    const isAuthPage = ['/user/login', '/user/register', '/admin/login', '/admin/setup'].includes(location.pathname);
    document.body.style.backgroundColor = isAuthPage ? (theme === 'dark' ? '#212529' : '#f8f9fa') : '';

    return (
        <AuthProvider>
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
        {/* Public Authentication and Setup Routes */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/admin/setup" element={<AdminSetup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/register" element={<UserRegistration />} />
        <Route path="/force-change-password" element={<ForcePasswordChange />} />

                {/* User Routes (Protected by UserLayout) */}
                <Route path="/user" element={<UserLayout theme={theme} toggleTheme={toggleTheme} />}>
                    <Route path="home" element={<Home />} />
                    <Route path="quiz" element={<QuizPage />} />
                    <Route path="history" element={<PerformanceHistory />} />
                    <Route path="history/:scoreId" element={<ScoreDetail />} />
                    <Route path="performance" element={<MyScore />} />
                </Route>
                {/* Admin Routes (Protected by AdminLayout) */}
                <Route path="/admin" element={<AdminLayout theme={theme} toggleTheme={toggleTheme} />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="manage-users" element={<ManageUsers />} />
                    <Route path="manage-admins" element={<ManageAdmins />} />
                    <Route path="questions" element={<ManageQuestions />} />
                    <Route path="publish" element={<PublishQueue />} /> 
                    <Route path="history" element={<QuestionHistory />} /> {/* Corrected route */}
                    <Route path="view-scores" element={<ViewScores />} />
                    <Route path="users/:userId/performance" element={<UserPerformance />} />
                    <Route path="performance" element={<AdminMonthlyPerformance />} />
                    <Route path="appearance" element={<AppearanceSettings />} />
                    <Route path="leaderboard" element={<Leaderboard />} />
                </Route>

                {/* Catch-all for 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>            
        </AuthProvider>
    );
};

export default App;

    
