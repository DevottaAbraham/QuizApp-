import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import UserPage from './UserPage.jsx';

const UserProtectedRoute = ({ user, onLogout, theme, toggleTheme, redirectPath = '/user/login' }) => {
    if (!user) {
        return <Navigate to={redirectPath} replace />;
    }
    return <UserPage currentUser={user} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} children={<Outlet context={{ currentUser: user }} />} />;
};

export default UserProtectedRoute;