import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { loginAdmin } from './adminAuthService';

const AdminLogin = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    useEffect(() => {
        // The default admin is now created by the backend's DataInitializer.
        // No need to seed admins on the frontend anymore.
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Use the username and password to log in.
        // loginAdmin will show a toast on failure and return null.
        const admin = await loginAdmin(username, password);
        if (admin) {
            onLogin(admin);
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
                                <Form.Group className="mb-3" controlId="adminUsername">
                                    <Form.Label>Admin Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter admin username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        autoComplete="username"
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
                                <strong>Default Admin Credentials:</strong><br />
                                Username: <code>admin</code><br />
                                Password: <code>adminpassword</code>
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