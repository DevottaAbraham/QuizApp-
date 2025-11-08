import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Spinner } from 'react-bootstrap';

/**
 * A layout component for all admin-facing pages.
 * It renders shared UI elements and an Outlet for nested routes.
 */
const AdminLayout = () => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    // While checking auth status, show a spinner
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" />
            </div>
        );
    }

    // Allow access to the setup page regardless of auth status
    if (location.pathname === '/admin/setup') {
        return <Outlet />;
    }

    // If not loading and no admin is logged in, redirect to the admin login page
    if (!currentUser || currentUser.role !== 'ADMIN') {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // If an admin is logged in, render the requested admin page
    return (
        <div className="admin-layout">
            {/* A shared admin navbar or sidebar can be placed here */}
            {/* Pass current user to child routes via context */}
            <Outlet context={{ currentUser }} />
        </div>
    );
};

export default AdminLayout;