import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Modal, Badge, Form } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import { useTheme } from '../../hooks/useTheme';

const UserLayout = ({ currentUser, onLogout }) => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [newNoticesCount, setNewNoticesCount] = useState(0);
    const [isBellRinging, setIsBellRinging] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const checkForNewNotices = useCallback(() => {
        const allNotices = JSON.parse(localStorage.getItem("quizNotices")) || [];
        const userSeenNotices = JSON.parse(localStorage.getItem(`seenNotices_${currentUser.userId}`)) || [];

        const newNotices = allNotices.filter(notice =>
            (notice.recipient === 'global' || notice.recipient === currentUser.userId) &&
            !userSeenNotices.includes(notice.id)
        );

        if (newNotices.length > newNoticesCount) {
            setIsBellRinging(true);
            setTimeout(() => setIsBellRinging(false), 1000); // Animation duration
        }
        setNewNoticesCount(newNotices.length);
    }, [currentUser.userId, newNoticesCount]);

    useEffect(() => {
        checkForNewNotices();
        const interval = setInterval(checkForNewNotices, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [checkForNewNotices]);

    const handleLogout = () => {
        onLogout();
    };

    const handleBellClick = () => {
        const allNotices = JSON.parse(localStorage.getItem("quizNotices")) || [];
        const relevantNoticeIds = allNotices
            .filter(notice => notice.recipient === 'global' || notice.recipient === currentUser.userId)
            .map(notice => notice.id);
        
        localStorage.setItem(`seenNotices_${currentUser.userId}`, JSON.stringify(relevantNoticeIds));
        setNewNoticesCount(0);
        
        // If not already on the dashboard, navigate there
        if (location.pathname !== '/user/dashboard') {
            navigate('/user/dashboard');
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
                <Container>
                    <Navbar.Brand as={Link} to="/user/home">Quiz Platform</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/user/home" active={location.pathname === '/user/home'}>Home</Nav.Link>
                            <Nav.Link as={Link} to="/user/dashboard" active={location.pathname === '/user/dashboard'}>Dashboard & Notices</Nav.Link>
                            <Nav.Link as={Link} to="/user/quiz" active={location.pathname.startsWith('/user/quiz')}>Take Quiz</Nav.Link>
                            <Nav.Link as={Link} to="/user/score" active={location.pathname.startsWith('/user/score')}>Performance</Nav.Link>
                        </Nav>
                        <Nav className="ms-auto align-items-center">
                            <Nav.Link onClick={handleBellClick} className="position-relative me-lg-2" title="View Notices">
                                <i className={`bi bi-bell-fill fs-5 ${isBellRinging ? 'ring' : ''}`}></i>
                                {newNoticesCount > 0 && (
                                    <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle border border-light" style={{ fontSize: '0.6em' }}>
                                        {newNoticesCount > 9 ? '9+' : newNoticesCount}
                                    </Badge>
                                )}
                            </Nav.Link>
                            <Form.Check
                                type="switch"
                                id="theme-switch-user"
                                label={theme === 'light' ? <i className="bi bi-brightness-high-fill text-white fs-5"></i> : <i className="bi bi-moon-stars-fill text-white fs-5"></i>}
                                checked={theme === 'dark'}
                                onChange={toggleTheme}
                                className="d-flex align-items-center my-2 my-lg-0 mx-lg-3"
                                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            />
                            <Navbar.Text className="my-2 my-lg-0">
                                <i className="bi bi-person-circle me-1"></i>
                                <span className="fw-bold">{currentUser.username}</span>
                            </Navbar.Text>
                            <Button variant="outline-light" onClick={() => setShowLogoutModal(true)} className="ms-lg-3 mt-2 mt-lg-0">
                                <i className="bi bi-box-arrow-right me-1"></i> Logout
                            </Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <main className="flex-grow-1">
                <Container className="py-4">
                    <Outlet />
                </Container>
            </main>

            <footer className="bg-body-tertiary text-center text-muted py-3 mt-auto border-top">
                &copy; {new Date().getFullYear()} Quiz Platform. All Rights Reserved.
            </footer>

            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />

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