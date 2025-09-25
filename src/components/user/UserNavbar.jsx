import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Form } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';

const UserNavbar = ({ currentUser, onLogout, theme, toggleTheme, hasUnread, markNoticesAsRead }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm mb-4" expanded={expanded}>
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="fw-bold">📖 QuizeBees</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarNav" onClick={() => setExpanded(prev => !prev)} />
                <Navbar.Collapse id="navbarNav">
                    <Nav className="me-auto">
                        <Nav.Link as={NavLink} to="/" end onClick={() => setExpanded(false)}><i className="bi bi-house-door-fill me-1"></i>Home</Nav.Link>                        
                        <Nav.Link as={NavLink} to="/notice-board" onClick={() => { setExpanded(false); markNoticesAsRead(); }}>
                            <i className="bi bi-clipboard-data-fill me-1"></i>Notice Board
                            {hasUnread && <span className="badge rounded-pill bg-danger ms-1" style={{ fontSize: '0.6em', verticalAlign: 'super' }}>New</span>}
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/quiz" onClick={() => setExpanded(false)}><i className="bi bi-patch-question-fill me-1"></i>Today's Questions</Nav.Link>
                        <Nav.Link as={NavLink} to="/score" onClick={() => setExpanded(false)}><i className="bi bi-bar-chart-line-fill me-1"></i>My Score</Nav.Link>
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
                                    label={theme === 'light' ? <i className="bi bi-brightness-high-fill"></i> : <i className="bi bi-moon-stars-fill"></i>}
                                    checked={theme === 'dark'}
                                    onChange={toggleTheme}
                                    className="text-white me-3"
                                />
                                <Nav.Link as={Link} to="/notice-board" className="text-white me-3 position-relative" onClick={markNoticesAsRead}>
                                    <i className="bi bi-bell-fill fs-5"></i>
                                    {hasUnread && (
                                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                                            <span className="visually-hidden">New alerts</span>
                                        </span>
                                    )}
                                </Nav.Link>
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