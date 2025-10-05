import React, { useState, useCallback } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Modal, Form } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';

const UserLayout = ({ currentUser, onLogout, theme, toggleTheme, children }) => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const location = useLocation();

    const handleLogout = useCallback(() => {
        onLogout();
    }, [onLogout]);

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar bg={theme === 'dark' ? 'dark' : 'primary'} variant="dark" expand="lg" className="shadow-sm" collapseOnSelect>
                <Container>
                    <Navbar.Brand as={Link} to="/user/home">Quiz Platform</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto" activeKey={location.pathname}>
                            <Nav.Link as={NavLink} to="/user/home" end>Home</Nav.Link>
                            <Nav.Link as={NavLink} to="/user/dashboard">Dashboard & Notices</Nav.Link>
                            <Nav.Link as={NavLink} to="/user/quiz">Take Quiz</Nav.Link>
                            <Nav.Link as={NavLink} to="/user/score">Performance</Nav.Link>
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
                    {children || <Outlet />}
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