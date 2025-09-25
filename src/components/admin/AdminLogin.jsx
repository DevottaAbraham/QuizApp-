import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import AlertToast from './AlertToast';

const AdminLogin = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '', variant: '' });

    useEffect(() => {
        // Seed the first main admin if no admins exist
        const admins = JSON.parse(localStorage.getItem("quizAdmins"));
        if (!admins || admins.length === 0) {
            const initialAdmins = [
                { email: 'main@example.com', password: 'password', role: 'main' },
                { email: 'admin1@example.com', password: 'password', role: 'admin' },
                { email: 'admin2@example.com', password: 'password', role: 'admin' },
                { email: 'admin3@example.com', password: 'password', role: 'admin' },
                { email: 'admin4@example.com', password: 'password', role: 'admin' },
            ];
            localStorage.setItem("quizAdmins", JSON.stringify(initialAdmins));
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const admins = JSON.parse(localStorage.getItem("quizAdmins")) || [];
        const foundAdmin = admins.find( // Correctly find admin by email and password
            admin => admin.email.toLowerCase() === email.toLowerCase() && admin.password === password
        );

        if (foundAdmin) {
            // Pass the entire admin object on login
            onLogin(foundAdmin);
        } else {
            setAlertInfo({ show: true, message: 'Invalid credentials. Please try again.', variant: 'danger' });
        }
    };

    return (
        <>
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Row>
                <Col>
                    <Card style={{ width: '22rem' }} className="shadow-lg">
                        <Card.Header as="h5" className="text-center bg-dark text-white">Admin Login</Card.Header>
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="adminEmail">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="adminPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        required
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit" className="w-100">Login</Button>
                            </Form>
                            <Alert variant="info" className="mt-4 small">
                                <strong>Demo Credentials:</strong><br />
                                Email: <code>main@example.com</code><br />
                                Password: <code>password</code>
                            </Alert>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
        <AlertToast
            show={alertInfo.show}
            message={alertInfo.message}
            variant={alertInfo.variant}
            onClose={() => setAlertInfo({ ...alertInfo, show: false })}
        />
        </>
    );
};

export default AdminLogin;