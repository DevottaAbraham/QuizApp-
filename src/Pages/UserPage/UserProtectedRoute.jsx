import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import UserLayout from './UserLayout';

const UserProtectedRoute = ({ user, onLogout, theme, toggleTheme }) => {
    if (!user) {
        // If no user is authenticated, redirect to the login page
        return <Navigate to="/user/login" replace />;
    }

    // If a user is authenticated, render the UserLayout with its children
    return (
        <UserLayout currentUser={user} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme}>
            {/* Pass the user object to child routes via the Outlet's context */}
            <Outlet context={{ currentUser: user }} />
        </UserLayout>
    );
};

export default UserProtectedRoute;
