import React, { useState, useCallback, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Modal, Form } from 'react-bootstrap';
import { getCurrentUser, logout } from '../../services/apiServices';
import { toast } from 'react-toastify';

const UserLayout = ({ theme, toggleTheme }) => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const location = useLocation();

    // CRITICAL FIX: UserLayout should be responsible for fetching its own user data
    // and handling its own authentication state, making it a self-contained protected layout.
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await getCurrentUser();
                if (user) {
                    setCurrentUser(user);
                } else {
                    toast.error("Session expired. Please log in again.");
                    navigate('/user/login');
                }
            } catch (error) {
                console.error("Failed to fetch current user for UserLayout:", error);
                toast.error("You must be logged in to access this page.");
                navigate('/user/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            // CRITICAL FIX: Pass 'USER' role to ensure correct redirection and session invalidation.
            await logout('USER');
            setCurrentUser(null);
            setShowLogoutModal(false);
            toast.info("You have been logged out.");
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Logout failed. Please try again.");
        }
    };

    if (loading || !currentUser) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div>Loading User Session...</div>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar bg={theme === 'dark' ? 'dark' : 'primary'} variant="dark" expand="lg" className="shadow-sm" collapseOnSelect>
                <Container>
                    <Navbar.Brand as={Link} to="/user/home">Quiz Platform</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto" activeKey={location.pathname}>
                            <Nav.Link as={NavLink} to="/user/home" end>Home</Nav.Link>
                            <Nav.Link as={NavLink} to="/user/quiz">Take Quiz</Nav.Link>
                            <Nav.Link as={NavLink} to="/user/history">My History</Nav.Link>
                            <Nav.Link as={NavLink} to="/user/performance">My Performance</Nav.Link>
                        </Nav>
                        <Nav className="ms-auto align-items-center">
                            <Form.Check
                                type="switch"
                                id="theme-switch-user"
                                label={theme === 'light' ? <i className="bi bi-brightness-high-fill fs-5"></i> : <i className="bi bi-moon-stars-fill fs-5"></i>}
                                checked={theme === 'dark'}
                                onChange={toggleTheme}
                                className="d-flex align-items-center my-2 my-lg-0 mx-lg-3"
                                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            />
                            <Navbar.Text className="my-2 my-lg-0">
                                <i className="bi bi-person-circle me-1"></i>
                                <span className="fw-bold">{currentUser.username}</span>
                            </Navbar.Text>
                            <Button variant="outline-light" onClick={() => setShowLogoutModal(true)} className="ms-lg-3 my-2 my-lg-0" >
                                <i className="bi bi-box-arrow-right me-1"></i> Logout
                            </Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <main className="flex-grow-1">
                <Container className="py-4">
                    <Outlet context={{ currentUser }} />
                </Container>
            </main>

            <footer className="bg-body-tertiary text-center text-muted py-3 mt-auto border-top">
                &copy; {new Date().getFullYear()} Quiz Platform. All Rights Reserved.
            </footer>

            <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Logout</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to log out?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleLogout}>
                        Logout
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserLayout;