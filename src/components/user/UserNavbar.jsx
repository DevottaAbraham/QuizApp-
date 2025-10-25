import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Form } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';

const UserNavbar = ({ currentUser, onLogout, theme, toggleTheme }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Navbar bg={theme === 'dark' ? 'dark' : 'primary'} variant="dark" expand="lg" className="shadow-sm mb-4" expanded={expanded} onToggle={setExpanded}>
            <Container fluid>
                <Navbar.Brand as={Link} to="/user/home" className="fw-bold">📖 QuizeBees</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarNav" />
                <Navbar.Collapse id="navbarNav">
                    <Nav className="me-auto">
                        <Nav.Link as={NavLink} to="/user/home" end onClick={() => setExpanded(false)}><i className="bi bi-house-door-fill me-1"></i>Home</Nav.Link>
                        <Nav.Link as={NavLink} to="/user/quiz" onClick={() => setExpanded(false)}><i className="bi bi-patch-question-fill me-1"></i>Today's Questions</Nav.Link>
                        <Nav.Link as={NavLink} to="/user/history" onClick={() => setExpanded(false)}><i className="bi bi-list-columns-reverse me-1"></i>My History</Nav.Link>
                        <Nav.Link as={NavLink} to="/user/performance" onClick={() => setExpanded(false)}><i className="bi bi-bar-chart-line-fill me-1"></i>My Performance</Nav.Link>
                    </Nav>
                    <div className="d-flex align-items-center">
                        {currentUser ? (
                            <>
                                <Navbar.Text className="me-3 text-white">
                                    Welcome, {currentUser.username}
                                </Navbar.Text>
                                <Button variant="outline-light" onClick={() => onLogout(currentUser.role)}>
                                    <i className="bi bi-box-arrow-left me-1"></i>Logout
                                </Button>
                            </>
                        ) : null}
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default UserNavbar;