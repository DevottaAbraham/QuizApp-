import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AdminPage from './AdminPage';

const AdminProtectedRoute = ({ admin, onLogout, redirectPath = '/admin/login' }) => {
    if (!admin) {
        return <Navigate to={redirectPath} replace />;
    }
    return <AdminPage admin={admin} onLogout={onLogout} />;
};

export default AdminProtectedRoute;