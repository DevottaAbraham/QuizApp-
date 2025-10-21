import React, { useState } from 'react';
import { Card, Form, Button, InputGroup, Alert, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import * as api from '../../services/apiServices';

const AdminLogin = ({ onLogin, isSetupComplete }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotUsername, setForgotUsername] = useState('');

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await api.login(username, password);
            if (user) {
                onLogin(user);
            }
        } catch (error) {
            // Error is handled by apiServices
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!forgotUsername) {
            toast.warn("Please enter the username of the admin account.");
            return;
        }
        try {
            const response = await api.forgotPasswordGenerateTemp(forgotUsername);
            toast.success(<div><p>{response.message}</p><strong>New Password: {response.tempPassword}</strong></div>, { autoClose: 15000 });
            setShowForgotModal(false);
            setForgotUsername('');
        } catch (error) {
            // Error is already handled by apiServices
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
                        <div className="text-end mb-3">
                            <Button variant="link" size="sm" onClick={() => setShowForgotModal(true)}>Forgot Password?</Button>
                        </div>
                        <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                            {loading ? 'Logging In...' : 'Login'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            <Modal show={showForgotModal} onHide={() => setShowForgotModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reset Admin Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Enter the admin username to generate a new temporary password. The new password will be displayed here.</p>
                    <Form.Group>
                        <Form.Label>Admin Username</Form.Label>
                        <Form.Control
                            type="text"
                            value={forgotUsername}
                            onChange={(e) => setForgotUsername(e.target.value)}
                            placeholder="Enter admin username"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowForgotModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleForgotPassword}>Generate New Password</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminLogin;