import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';
import { getCurrentUser, logout } from '../../services/apiServices';
import { toast } from 'react-toastify';
import { Container, Spinner } from 'react-bootstrap';

const UserLayout = ({ theme, toggleTheme }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await getCurrentUser();
                if (user && user.role === 'USER') {
                    setCurrentUser(user);
                } else {
                    // If no user or not a USER, redirect to login
                    toast.error("Please log in to continue.");
                    navigate('/user/login');
                }
            } catch (error) {
                console.error("Failed to fetch current user for UserLayout:", error);
                toast.error("Session invalid. Please log in.");
                navigate('/user/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await logout('USER');
            setCurrentUser(null);
            toast.info("You have been logged out.");
            navigate('/user/login');
        } catch (error) {
            toast.error("Logout failed. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <div className="d-flex flex-column min-vh-100">
            <UserNavbar currentUser={currentUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
            <main className="flex-grow-1">
                <Container className="py-4">
                    <Outlet context={{ currentUser }} />
                </Container>
            </main>
        </div>
    );
};

export default UserLayout;