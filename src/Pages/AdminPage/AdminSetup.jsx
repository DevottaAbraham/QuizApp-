import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';

const AdminSetup = ({ onLogin, onSetupComplete }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // FIX: Call the dedicated registerAdmin endpoint to guarantee an ADMIN role is created.
            // The backend will reject this if an admin already exists.
            const response = await api.registerAdmin(username, password);
            toast.success("Admin account created successfully! Logging you in...");
            
            // CRITICAL FIX:
            // 1. Notify the App component that setup is now complete.
            onSetupComplete();
            // 2. Log the new admin in.
            onLogin(response);

        } catch (err) {
            setError(err.message || "An unknown error occurred during setup.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Row className="w-100">
                <Col md={6} lg={5} xl={4} className="mx-auto">
                    <Card className="shadow-lg">
                        <Card.Body className="p-4">
                            <h3 className="text-center mb-4">Initial Admin Setup</h3>
                            <p className="text-center text-muted mb-4">Create the first administrator account for the application.</p>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="username">
                                    <Form.Label>Admin Username</Form.Label>
                                    <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </Form.Group>
                                <div className="d-grid">
                                    <Button variant="primary" type="submit" disabled={loading}>
                                        {loading ? 'Creating Account...' : 'Create Admin Account'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminSetup;