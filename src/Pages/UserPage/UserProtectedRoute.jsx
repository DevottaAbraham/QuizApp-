import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import UserLayout from './UserLayout.jsx';

const UserProtectedRoute = ({ user, onLogout, theme, toggleTheme, redirectPath = '/user/login' }) => {
    if (!user) {
        return <Navigate to={redirectPath} replace />;
    }
    return <UserLayout currentUser={user} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme}><Outlet /></UserLayout>;
};

export default UserProtectedRoute;