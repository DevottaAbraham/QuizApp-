import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Form } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';

const UserNavbar = ({ currentUser, onLogout, theme, toggleTheme }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Navbar bg={theme === 'dark' ? 'dark' : 'primary'} variant={theme === 'dark' ? 'dark' : 'light'} expand="lg" className="shadow-sm mb-4" expanded={expanded}>
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="fw-bold">📖 QuizeBees</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarNav" onClick={() => setExpanded(prev => !prev)} />
                <Navbar.Collapse id="navbarNav">
                    <Nav className="me-auto">
                        <Nav.Link as={NavLink} to="/user/home" end onClick={() => setExpanded(false)}><i className="bi bi-house-door-fill me-1"></i>Home</Nav.Link>
                        <Nav.Link as={NavLink} to="/user/quiz" onClick={() => setExpanded(false)}><i className="bi bi-patch-question-fill me-1"></i>Today's Questions</Nav.Link>
                        <Nav.Link as={NavLink} to="/user/history" onClick={() => setExpanded(false)}><i className="bi bi-bar-chart-line-fill me-1"></i>My Score</Nav.Link>
                    </Nav>
                    <div className="d-flex align-items-center">
                        {currentUser ? (
                            <>
                                <Navbar.Text className="me-3">
                                    Welcome, {currentUser.username}
                                </Navbar.Text>
                                <Form.Check
                                    type="switch"
                                    id="theme-switch-user"
                                    label={theme === 'light' ? <i className="bi bi-brightness-high-fill text-white"></i> : <i className="bi bi-moon-stars-fill text-white"></i>}
                                    checked={theme === 'dark'} 
                                    onChange={toggleTheme}
                                />
                                <Button variant="outline-light" onClick={onLogout}>
                                    <i className="bi bi-box-arrow-left me-1"></i>Logout
                                </Button>
                            </>
                        ) : (
                            <Button as={Link} to="/login" variant="outline-light">
                                <i className="bi bi-box-arrow-in-right me-1"></i>Login
                            </Button>
                        )}
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default UserNavbar;