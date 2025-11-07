import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import AdminLayout from './AdminLayout.jsx';
import UserLayout from './UserLayout.jsx';

// General Components
import RootRedirect from './components/RootRedirect.jsx';
import NotFound from "./pages/NotFound.jsx";

// Admin Pages
import AdminSetup from './pages/Adminpage/AdminSetup.jsx';
import AdminDashboard from './pages/AdminPage/AdminDashboard.jsx';
import AdminLogin from './pages/AdminPage/AdminLogin.jsx';

// User Pages
import UserLogin from './pages/UserPage/UserLogin.jsx';
import UserDashboard from './pages/UserPage/UserDashboard.jsx';
import UserRegister from './pages/UserPage/UserRegistration.jsx';

function App() {
    return (
        <Routes>
            {/* Root path redirects based on setup and auth status */}
            <Route path="/" element={<RootRedirect />} />

            {/* User-facing routes */}
            <Route path="/user" element={<UserLayout />}>
                <Route path="login" element={<UserLogin />} />
                <Route path="register" element={<UserRegister />} />
                <Route path="dashboard" element={<UserDashboard />} />
                {/* Add other user routes here */}
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route path="setup" element={<AdminSetup />} />
                <Route path="login" element={<AdminLogin />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                {/* Add other admin routes here */}
            </Route>

            {/* Fallback for any other route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;