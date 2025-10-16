import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../services/apiServices';
import { toast } from 'react-toastify';

const AdminLogin = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. The adminLogin service calls your backend and gets the user data.
            const loginData = await adminLogin(username, password);

            // 2. Check if the login was successful and we have the data.
            if (loginData && loginData.token) {
                // 3. Call the onLogin prop to update the application's state.
                onLogin(loginData);

                // 4. Redirect the user based on their role.
                if (loginData.role === 'ADMIN') {
                    navigate('/admin/dashboard'); // Redirect to the admin dashboard
                } else {
                    // Handle cases where a non-admin user tries to log in.
                    toast.error("Login failed: You do not have administrator privileges.");
                }
            }
        } catch (error) {
            console.error("Admin login failed:", error);
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