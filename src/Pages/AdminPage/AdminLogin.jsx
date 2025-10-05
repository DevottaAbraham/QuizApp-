import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { loginAdmin } from '../../components/admin/adminAuthService';

const AdminLogin = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    useEffect(() => {
        // Seed the first main admin if no admins exist
        const admins = JSON.parse(localStorage.getItem("quizAdmins"));
        if (!admins || admins.length === 0) {
            const initialAdmins = [
                { email: 'main@email.com', password: 'password', role: 'main' },
                { email: 'admin1@email.com', password: 'password', role: 'admin' },
                { email: 'admin2@email.com', password: 'password', role: 'admin' },
                { email: 'admin3@email.com', password: 'password', role: 'admin' },
                { email: 'admin4@email.com', password: 'password', role: 'admin' },
            ];
            localStorage.setItem("quizAdmins", JSON.stringify(initialAdmins));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const admin = await loginAdmin(email, password);
            if (admin) {
                onLogin(admin);
            }
        } catch (error) {
            // Errors (like invalid credentials) are handled by the loginAdmin service, which shows a toast.
        }
    };

    return (
        <>
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Row className="w-100 justify-content-center">
                <Col md="auto">
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
                                Email: <code>admin1@email.com</code><br />
                                Password: <code>password</code>
                            </Alert>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
        </>
    );
};

export default AdminLogin;