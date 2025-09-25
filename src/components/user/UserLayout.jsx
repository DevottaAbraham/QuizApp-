import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Navbar, Nav, Container, Button, Form } from 'react-bootstrap';
import UserLogin from './UserLogin';
import Home from './Home';
import Quiz from './Quiz';
import MyScore from './MyScore';
import PerformanceHistory from './PerformanceHistory';
import { useTheme } from '../../hooks/useTheme';

// Custom hook for managing user authentication
const useUserAuth = () => {
    const [currentUser, setCurrentUser] = useState(() => {
        const savedUser = localStorage.getItem("currentUser");
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const navigate = useNavigate();
    const location = useLocation();

    const login = (user) => {
        setCurrentUser(user);
        localStorage.setItem("currentUser", JSON.stringify(user));
        
        // Add to active users list for admin panel simulation
        let activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || [];
        if (!activeUsers.some(u => u.userId === user.userId)) {
            activeUsers.push({ userId: user.userId, username: user.username });
            localStorage.setItem("activeUsers", JSON.stringify(activeUsers));
            window.dispatchEvent(new Event('storageUpdated')); // Notify dashboard
        }
        
        // After login, go to the page they were trying to access, or the user home.
        const from = location.state?.from?.pathname || '/user/home';
        navigate(from, { replace: true });
    };

    const logout = () => {
        // Remove from active users list
        if (currentUser) {
            let activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || [];
            activeUsers = activeUsers.filter(user => user.userId !== currentUser.userId);
            localStorage.setItem("activeUsers", JSON.stringify(activeUsers));
            window.dispatchEvent(new Event('storageUpdated')); // Notify dashboard
        }

        setCurrentUser(null);
        localStorage.removeItem("currentUser");
        navigate('/user/login');
    };

    useEffect(() => {
        // If user is not logged in and not on the login page, redirect them.
        if (!currentUser && location.pathname !== '/user/login') {
            navigate('/user/login', { state: { from: location }, replace: true });
        }
    }, [currentUser, navigate, location]);

    return { currentUser, login, logout };
};

const UserLayout = () => {
    const { currentUser, login, logout } = useUserAuth();
    const { theme, toggleTheme } = useTheme();

    // If no user is logged in, only render the login route.
    if (!currentUser) {
        return (
            <>
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
                <Routes>
                    <Route path="login" element={<UserLogin onLogin={login} />} />
                    {/* Redirect any other user path to login if not authenticated */}
                    <Route path="*" element={<Navigate to="/user/login" replace />} />
                </Routes>
            </>
        );
    }

    // If user is logged in, render the full application layout.
    return (
        <>
            <Navbar bg="primary" variant="dark" expand="lg" className="sticky-top shadow">
                <Container fluid>
                    <Navbar.Brand as={Link} to="/user/home">Quiz App</Navbar.Brand>
                    <Navbar.Toggle aria-controls="userNavbar" />
                    <Navbar.Collapse id="userNavbar">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="quiz">Take Quiz</Nav.Link>
                            <Nav.Link as={Link} to="score">My Score</Nav.Link>
                            <Nav.Link as={Link} to="performance"><i className="bi bi-eye-fill me-1"></i>Performance</Nav.Link>
                        </Nav>
                        <div className="d-flex align-items-center">
                            <Navbar.Text className="me-3">
                                Signed in as: <strong>{currentUser.username}</strong>
                            </Navbar.Text>
                            <Form.Check
                                type="switch"
                                id="theme-switch-user"
                                label={theme === 'light' ? <i className="bi bi-brightness-high-fill"></i> : <i className="bi bi-moon-stars-fill"></i>}
                                checked={theme === 'dark'}
                                onChange={toggleTheme}
                                className="text-white me-3"
                            />
                            <Button variant="outline-light" size="sm" onClick={logout}>
                                <i className="bi bi-box-arrow-right me-1"></i>Logout
                            </Button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <main className="container mt-4">
                <Routes>
                    <Route index element={<Navigate to="home" replace />} />
                    <Route path="home" element={<Home />} />
                    <Route path="quiz" element={<Quiz />} />
                    <Route path="score" element={<MyScore />} />
                    <Route path="performance" element={<PerformanceHistory />} />
                </Routes>
            </main>
        </>
    );
};

export default UserLayout;