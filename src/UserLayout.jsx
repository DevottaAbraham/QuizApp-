import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Spinner } from 'react-bootstrap';

/**
 * A layout component for all user-facing pages.
 * It renders shared UI elements and an Outlet for nested routes.
 */
const UserLayout = () => {
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

    // If trying to access a protected page without being logged in, redirect to login
    if (!currentUser && location.pathname !== '/user/login' && location.pathname !== '/user/register') {
        return <Navigate to="/user/login" state={{ from: location }} replace />;
    }

    // If everything is fine, render the requested user page
    return (
        <div className="user-layout">
            {/* A shared user navbar or header can be placed here */}
            <Outlet context={{ currentUser }} />
        </div>
    );
};

export default UserLayout;