import React from 'react';
import AdminLayout from '../components/admin/AdminLayout';

const AdminPage = ({ currentAdmin, onLogout }) => {
    // This component now simply passes props through to the layout.
    // The authentication state is managed by App.jsx.
    return <AdminLayout currentAdmin={currentAdmin} onLogout={onLogout} />;
};

export default AdminPage;