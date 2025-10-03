import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminPage = ({ currentAdmin, onLogout }) => {
    return <AdminLayout currentAdmin={currentAdmin} onLogout={onLogout} />;
};

export default AdminPage;
