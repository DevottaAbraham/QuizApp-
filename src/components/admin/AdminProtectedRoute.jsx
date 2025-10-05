import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AdminPage from '../Pages/AdminPage/AdminPage.jsx';

const AdminProtectedRoute = ({ admin, onLogout, theme, toggleTheme, redirectPath = '/admin/login' }) => {
    if (!admin) {
        return <Navigate to={redirectPath} replace />;
    }
    return <AdminPage currentAdmin={admin} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} children={<Outlet />} />;
};

export default AdminProtectedRoute;
