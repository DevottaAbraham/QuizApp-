import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * A layout component for all admin-facing pages.
 * It renders shared UI elements and an Outlet for nested routes.
 */
const AdminLayout = () => {
    return (
        <div className="admin-layout">
            {/* A shared admin navbar or sidebar can be placed here */}
            <Outlet /> {/* Nested admin routes will be rendered here */}
        </div>
    );
};

export default AdminLayout;