import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import { getCurrentUser, logout } from '../../services/apiServices';
import { toast } from 'react-toastify';
import { Container, Spinner } from 'react-bootstrap';

/**
 * Renders the main application layout for a logged-in admin.
 * This component is wrapped in Routes and can safely use router hooks.
 */
const AdminLayout = ({ theme, toggleTheme }) => {
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation(); // Get the current location

    useEffect(() => {
        // Only run the admin check if we are on an admin path.
        if (location.pathname.startsWith('/admin')) {
            const fetchAdminUser = async () => {
                try {
                    const user = await getCurrentUser();
                    if (user && user.role === 'ADMIN') {
                        setCurrentAdmin(user);
                    } else {
                        // This case handles when a non-admin tries to access an admin URL directly.
                        toast.error("Access Denied. Admin privileges required.");
                        navigate('/admin/login');
                    }
                } catch (error) {
                    toast.error("Session expired. Please log in.");
                    navigate('/admin/login');
                } finally {
                    setLoading(false);
                }
            };
            fetchAdminUser();
        }
    }, [navigate, location]); // CRITICAL FIX: Add location to re-run this on every navigation change

    const handleLogout = async () => {
        try {
            await logout('ADMIN');
            setCurrentAdmin(null);
            toast.info("You have been logged out.");
            navigate('/admin/login');
        } catch (error) {
            toast.error("Logout failed. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading Admin Panel...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <>
            <AdminNavbar currentUser={currentAdmin} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
            <main className="container-fluid mt-4">
                <Outlet context={{ currentAdmin }} />
            </main>
        </>
    );
};

export default AdminLayout;
