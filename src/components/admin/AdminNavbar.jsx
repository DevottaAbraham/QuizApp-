import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AdminNavbar = ({ currentUser, onLogout, theme, toggleTheme }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="sticky-top shadow" expanded={expanded} onToggle={setExpanded}>
            <Container fluid>
                <Navbar.Brand as={Link} to="/admin/dashboard">👑 Admin Panel</Navbar.Brand>
                <Navbar.Toggle aria-controls="adminNavbar" />
                <Navbar.Collapse id="adminNavbar">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/admin/dashboard" onClick={() => setExpanded(false)}><i className="bi bi-grid-1x2-fill me-1"></i>Dashboard</Nav.Link>
                        <NavDropdown title={<><i className="bi bi-journal-text me-1"></i>Questions</>} id="questions-dropdown">
                            <NavDropdown.Item as={Link} to="/admin/questions" onClick={() => setExpanded(false)}>Add/Edit Questions</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/admin/publish" onClick={() => setExpanded(false)}>Publish Queue</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/admin/history" onClick={() => setExpanded(false)}>Question History</NavDropdown.Item>
                        </NavDropdown>
                        <Nav.Link as={Link} to="/admin/manage-users" onClick={() => setExpanded(false)}><i className="bi bi-people-fill me-1"></i>Manage Users</Nav.Link>
                        {currentUser?.role === 'ADMIN' && <Nav.Link as={Link} to="/admin/manage-admins" onClick={() => setExpanded(false)}><i className="bi bi-person-badge-fill me-1"></i>Manage Admins</Nav.Link>}
                        <Nav.Link as={Link} to="/admin/appearance" onClick={() => setExpanded(false)}><i className="bi bi-palette-fill me-1"></i>Appearance</Nav.Link>
                        <Nav.Link as={Link} to="/admin/leaderboard" onClick={() => setExpanded(false)}><i className="bi bi-trophy-fill me-1"></i>Leaderboard</Nav.Link>
                        <Nav.Link as={Link} to="/admin/view-scores" onClick={() => setExpanded(false)}><i className="bi bi-clipboard2-pulse-fill me-1"></i>View Scores</Nav.Link>
                    </Nav>
                    <Nav className="ms-auto align-items-center">
                        <Navbar.Text className="my-2 my-lg-0 me-lg-3">
                            Welcome, <span className="fw-bold">{currentUser?.username}</span>
                        </Navbar.Text>
                        <Form.Check
                            type="switch"
                            id="admin-theme-switch"
                            checked={theme === 'dark'}
                            onChange={toggleTheme}
                            label={theme === 'light' ? <i className="bi bi-brightness-high-fill fs-5"></i> : <i className="bi bi-moon-stars-fill fs-5"></i>}
                            className="d-flex align-items-center my-2 my-lg-0 mx-lg-3"
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        />
                        <Button variant="outline-light" onClick={onLogout} className="my-2 my-lg-0">
                            <i className="bi bi-shield-slash-fill me-1"></i> Logout
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AdminNavbar;