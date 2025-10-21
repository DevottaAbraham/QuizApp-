import React, { useState, useCallback } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Modal, Form } from 'react-bootstrap';
import UserNavbar from '../../components/user/UserNavbar';
import { ToastContainer } from 'react-toastify';

const UserLayout = ({ currentUser, onLogout, theme, toggleTheme, children }) => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const location = useLocation();

    const handleLogout = useCallback(() => {
        onLogout();
    }, [onLogout]);

    return (
        <div className="d-flex flex-column min-vh-100">
            <UserNavbar currentUser={currentUser} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} />

            <main className="flex-grow-1">
                <Container className="py-4">
                    {children}
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