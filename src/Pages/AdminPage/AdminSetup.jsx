import React, { useState } from 'react';
import { Card, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/apiServices';

const AdminSetup = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast.warn("Please fill in both username and password.");
            return;
        }
        setLoading(true);
        try {
            // Use the standard registration. The backend will automatically make the first user an admin.
            const newUser = await api.register(username, password);
            if (newUser) {
                toast.success(`Admin user '${username}' created successfully! Redirecting to dashboard...`);
                onLogin(newUser); // This will set the user state and trigger the redirect to the dashboard.
            }
        } catch (error) {
            // Error is already handled and toasted by apiServices
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#f8f9fa' }}>
            <Card className="shadow-lg" style={{ width: '400px' }}>
                <Card.Header className="text-center">
                    <h3>Initial Admin Setup</h3>
                </Card.Header>
                <Card.Body className="p-4">
                    <Alert variant="info">
                        Create the first administrator account for the application.
                    </Alert>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label>Admin Username</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>👤</InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Choose an admin username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>Password</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>🔑</InputGroup.Text>
                                <Form.Control
                                    type="password"
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </InputGroup>
                        </Form.Group>
                        <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Admin Account'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default AdminSetup;