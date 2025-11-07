import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * A layout component for all user-facing pages.
 * It renders shared UI elements and an Outlet for nested routes.
 */
const UserLayout = () => {
    return (
        <div className="user-layout">
            {/* A shared user navbar or header can be placed here */}
            <Outlet /> {/* Nested user routes will be rendered here */}
        </div>
    );
};

export default UserLayout;