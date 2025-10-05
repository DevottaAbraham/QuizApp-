import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';

const AdminPage = ({ currentAdmin, onLogout, children, theme, toggleTheme, ...props }) => {
    return <AdminLayout currentAdmin={currentAdmin} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} {...props}>{children}</AdminLayout>;
};

export default AdminPage;
