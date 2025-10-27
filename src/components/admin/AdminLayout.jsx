import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import AdminNavbar from './AdminNavbar';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../services/apiServices';
import { toast } from 'react-toastify';

/**
 * Renders the main application layout for a logged-in admin.
 * This component is wrapped in Routes and can safely use router hooks.
 */
const AdminLayout = ({ theme, toggleTheme }) => {
    const { currentUser, setCurrentUser, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // After the initial session load, check the user's role.
        if (!loading) {
            if (!currentUser || currentUser.role !== 'ADMIN') {
                toast.error("Access Denied. Admin privileges required.");
                // CRITICAL FIX: If a non-admin (or logged-out user) tries to access an admin route,
                // they should be sent to the admin login page, not the user login page.
                navigate('/admin/login', { replace: true });
            }
        }
    }, [currentUser, loading, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            setCurrentUser(null);
            toast.info("You have been logged out.");
            navigate('/admin/login');
        } catch (error) {
            toast.error("Logout failed. Please try again.");
        }
    };

    // While the session is being verified, show a loading spinner.
    if (loading) {
        return <div className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" /></div>;
    }

    // After loading, if there's still no valid admin, this component will have already navigated away.
    // So we only render the content if everything is correct.
    return (
        <>
            <AdminNavbar currentUser={currentUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
            <main className="container-fluid mt-4">
                <Outlet context={{ currentUser }} />
            </main>
        </>
    );
};

export default AdminLayout;
