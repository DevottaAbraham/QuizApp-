import React, { useState } from 'react';
import { Card, Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiFetch } from '../../services/apiServices'; // Use the generic fetch

const AdminSetup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [setupToken, setSetupToken] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        try {
            // The backend automatically assigns the ADMIN role to the first user.
            const response = await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, password, role: 'ADMIN', adminSetupToken: setupToken }),
            });

            toast.success(response.message || "Admin account created successfully! Please log in.");
            navigate('/admin/login'); // Redirect to login page after successful registration

        } catch (error) {
            // apiFetch already shows a toast for network/auth errors.
            console.error("Admin setup failed:", error);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Row className="w-100 justify-content-center">
                <Col md="auto">
                    <Card style={{ width: '24rem' }} className="shadow-lg">
                        <Card.Header as="h5" className="text-center bg-success text-white">Create Administrator Account</Card.Header>
                        <Card.Body className="p-4">
                            <Alert variant="info" className="small">
                                Welcome! As the first user, you will be creating the primary administrator account for this application.
                            </Alert>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="adminUsername">
                                    <Form.Label>Admin Username</Form.Label>
                                    <Form.Control type="text" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="adminPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="confirmPassword">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="setupToken">
                                    <Form.Label>Setup Token</Form.Label>
                                    <Form.Control type="text" placeholder="Enter the secret setup token" value={setupToken} onChange={(e) => setSetupToken(e.target.value)} required />
                                </Form.Group>

                                <Button variant="success" type="submit" className="w-100">Create Admin Account</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminSetup;