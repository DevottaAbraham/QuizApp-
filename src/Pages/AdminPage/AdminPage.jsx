import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import AdminDashboard from '../../components/admin/AdminDashboard';

/**
 * The main layout for the authenticated admin section.
 * It includes a simple navigation bar and renders the AdminDashboard.
 */
const AdminPage = ({ admin, onLogout }) => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
                <Container>
                    <Navbar.Brand as={Link} to="/admin">Admin Panel</Navbar.Brand>
                    <Nav className="ms-auto">
                        <Navbar.Text className="me-3">
                            Signed in as: <span className="fw-bold">{admin.username}</span>
                        </Navbar.Text>
                        <Button variant="outline-light" onClick={onLogout}>
                            <i className="bi bi-box-arrow-right me-1"></i> Logout
                        </Button>
                    </Nav>
                </Container>
            </Navbar>

            <main className="flex-grow-1 bg-light">
                <Container className="py-4">
                    {/* We render the AdminDashboard directly here */}
                    <AdminDashboard admin={admin} />
                </Container>
            </main>
        </div>
    );
};

export default AdminPage;