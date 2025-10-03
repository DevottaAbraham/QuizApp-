import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import AdminLogin from './components/admin/AdminLogin.jsx';
import AdminPage from './Pages/AdminPage/AdminPage.jsx';
import UserLogin from './components/user/UserLogin.jsx';
import './components/user/UserLayout.css';
import UserPage from './pages/UserPage.jsx';

// Custom hook for managing state with localStorage
function useStorageState(key, defaultValue) {
  const [state, setState] = useState(() => {
    const savedState = localStorage.getItem(key);
    try {
      return savedState ? JSON.parse(savedState) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          setState(e.newValue ? JSON.parse(e.newValue) : defaultValue);
        } catch {
          setState(defaultValue);
        }
      }
    };

    // 'storage' event is for changes in other tabs.
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue]);

  const updateState = (newState) => {
    if (newState) {
      localStorage.setItem(key, JSON.stringify(newState));
    } else {
      localStorage.removeItem(key);
    }
    setState(newState);
    // Dispatch a custom event for same-tab updates if needed elsewhere.
    window.dispatchEvent(new StorageEvent('storage', { key }));
  };

  return [state, updateState];
}

// Protected Route Components
const AdminProtectedRoute = ({ admin, onLogout, redirectPath = '/admin/login' }) => {
  if (!admin) {
    return <Navigate to={redirectPath} replace />;
  }
  return <AdminPage currentAdmin={admin} onLogout={onLogout} />;
};

const UserProtectedRoute = ({ user, onLogout, redirectPath = '/user/login' }) => {
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }
  return <UserPage currentUser={user} onLogout={onLogout} />;
};

function App() {
  const [currentUser, setCurrentUser] = useStorageState("currentUser", null);
  const [currentAdmin, setCurrentAdmin] = useStorageState("currentAdmin", null);

  const navigate = useNavigate();

  const handleLogin = (user) => {
    const activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || [];
    if (!activeUsers.some(u => u.userId === user.userId)) {
      activeUsers.push(user);
      localStorage.setItem("activeUsers", JSON.stringify(activeUsers));
    }
    setCurrentUser(user);
    navigate('/user/home'); // Simplified redirection
  };

  const handleLogout = () => {
    if (currentUser) {
      const activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || [];
      const updatedActiveUsers = activeUsers.filter(u => u.userId !== currentUser.userId);
      localStorage.setItem("activeUsers", JSON.stringify(updatedActiveUsers));
    }
    setCurrentUser(null);
    navigate('/user/login');
  };

  const handleAdminLogin = (admin) => {
    setCurrentAdmin(admin);
    navigate('/admin/dashboard');
  };

  const handleAdminLogout = () => {
    setCurrentAdmin(null);
    navigate('/admin/login');
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      {/* Admin Routes */}
      <Route path="admin/*" element={<AdminProtectedRoute admin={currentAdmin} onLogout={handleAdminLogout} />} />
      <Route path="admin/login" element={
        currentAdmin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin onLogin={handleAdminLogin} />
      } />

      {/* User Routes */}
      <Route path="user/*" element={<UserProtectedRoute user={currentUser} onLogout={handleLogout} />} />
      <Route path="user/login" element={
        currentUser ? <Navigate to="/user/home" replace /> : <UserLogin onLogin={handleLogin} />
      } />

      {/* Fallback for any other unmatched routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
