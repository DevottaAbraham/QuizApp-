import React, { useState } from 'react';
import { Card, Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiFetch } from '../../services/apiServices';

const UserRegistration = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        try {
            // CRITICAL FIX: This was incorrectly calling the admin registration endpoint.
            // It now correctly calls the general /auth/register endpoint, which will
            // assign the 'USER' role by default since an admin already exists.
            const response = await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
                isPublic: true,
            });

            toast.success(response.message || "Account created successfully! Please log in.");
            navigate('/user/login'); // Redirect to login page after successful registration

        } catch (error) {
            // The apiFetch service already shows a toast error for most cases.
            console.error("Registration failed:", error);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Row className="w-100 justify-content-center">
                <Col md="auto">
                    <Card style={{ width: '24rem' }} className="shadow-lg">
                        <Card.Header as="h5" className="text-center bg-primary text-white">Create Your Account</Card.Header>
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="username">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control type="text" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="confirmPassword">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100">Register</Button>
                            </Form>
                            <div className="text-center mt-3">
                                <Link to="/user/login">Already have an account? Login</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UserRegistration;