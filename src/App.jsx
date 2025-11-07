import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import AdminLayout from './AdminLayout';
import UserLayout from './UserLayout';

// General Components
import RootRedirect from './components/RootRedirect';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminSetup from './pages/AdminSetup';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

// User Pages
import UserLogin from './pages/UserLogin';
import UserDashboard from './pages/UserDashboard';
import UserRegister from './pages/UserRegister';

function App() {
    return (
        <AuthProvider>
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
        </AuthProvider>
    );
}

export default App;