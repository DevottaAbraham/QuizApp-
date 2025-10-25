import React, { useState } from 'react';
import { Card, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../../services/apiServices';

const AdminLogin = ({ isSetupComplete }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await api.login(username, password, 'ADMIN');
            if (user && user.role === 'ADMIN') {
                toast.success("Admin login successful!");
                navigate('/admin/dashboard');
            }
        } catch (error) {
            // Error is handled by apiServices
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#f8f9fa' }}>
            <Card className="shadow-lg" style={{ width: '400px' }}>
                <Card.Header className="text-center">
                    <h3>Admin Login</h3>
                </Card.Header>
                <Card.Body className="p-4">
                    {!isSetupComplete && (
                        <Alert variant="warning" className="text-center small">
                            Application not set up. <Link to="/admin/setup">Create the first admin account.</Link>
                        </Alert>
                    )}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label>Username</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>👤</InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter username"
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
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </InputGroup>
                        </Form.Group>
                        <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                            {loading ? 'Logging In...' : 'Login'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default AdminLogin;