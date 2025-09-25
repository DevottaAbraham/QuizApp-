import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout.jsx';
import UserLayout from './components/user/UserLayout.jsx';

function App() {
  return (
    <Routes>
      {/* Redirect root path to the admin login page */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      {/* All admin routes will be nested under /admin */}
      <Route path="admin/*" element={<AdminLayout />} />
      {/* All user-facing routes will be under /user. The UserLayout will handle its own sub-routes. */}
      <Route path="user/*" element={<UserLayout />} />
    </Routes>
  );
}

export default App;
