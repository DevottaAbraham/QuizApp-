import React from 'react';
import { Outlet } from 'react-router-dom';
import UserLayout from './UserLayout';

/**
 * A wrapper component for the user section of the application.
 * It uses UserLayout to provide a consistent look and feel.
 * The <Outlet /> component from react-router-dom will render the specific
 * user page component that matches the current route (e.g., Home, Quiz, Score).
 */
const UserPage = ({ currentUser, onLogout, theme, toggleTheme }) => {
    return <UserLayout currentUser={currentUser} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} children={<Outlet />} />;
};

export default UserPage;