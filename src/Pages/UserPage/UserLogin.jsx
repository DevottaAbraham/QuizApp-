import React, { useState, useEffect } from 'react';
import { Card, Nav, Form, Button, InputGroup, FormControl } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { login, register } from '../../components/user/authService';

const UserLogin = ({ onLogin }) => {
    const [activeTab, setActiveTab] = useState('signup');
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupUsername, setSignupUsername] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    const generateUserPassword = () => {
        const password = Math.random().toString(36).slice(-8);
        setSignupPassword(password);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!loginUsername || !loginPassword) {
            toast.warn("Please enter both username and password.");
            return;
        }
        try {
            const user = await login(loginUsername, loginPassword);
            if (user) {
                onLogin(user);
            }
        } catch (error) {
            // The service already showed a toast, but we could add more specific UI changes here.
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!signupUsername || !signupPassword) {
            toast.warn("Please enter a username and generate a password.");
            return;
        }
        try {
            const newUser = await register(signupUsername, signupPassword);
            if (newUser) {
                toast.success(`User '${signupUsername}' created successfully! Logging you in...`);
                onLogin(newUser);
            }
        } catch (error) {
            // The service already showed a toast.
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center px-3" style={{ minHeight: '70vh' }}>
            <Card className="shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
                <Card.Header>
                    <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                        <Nav.Item>
                            <Nav.Link eventKey="login">Login</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="signup">Sign Up</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body className="p-4">
                    {activeTab === 'login' && (
                        <Form onSubmit={handleLogin}>
                            <h5 className="card-title text-center mb-3">Welcome Back!</h5>
                            <Form.Group className="mb-3" controlId="username">
                                <Form.Label>Username</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>👤</InputGroup.Text>
                                    <Form.Control type="text" placeholder="Enter username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
                                </InputGroup>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="password">
                                <Form.Label>Password</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>🔑</InputGroup.Text>
                                    <Form.Control type="password" placeholder="Enter password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                                </InputGroup>
                            </Form.Group>
                            <Button type="submit" variant="primary" className="w-100 rounded-pill mt-2">Login</Button>
                        </Form>
                    )}

                    {activeTab === 'signup' && (
                        <Form onSubmit={handleRegister}>
                            <h5 className="card-title text-center mb-3">Create Your Account</h5>
                            <Form.Group className="mb-3" controlId="signupUsername">
                                <Form.Label>Choose a Username</Form.Label>
                                <Form.Control type="text" placeholder="e.g., David123" value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="signupPassword">
                                <Form.Label>Generated Password</Form.Label>
                                <InputGroup>
                                    <Form.Control type="text" placeholder="Click 'Generate'" readOnly value={signupPassword} />
                                    <Button variant="secondary" onClick={generateUserPassword}>Generate</Button>
                                </InputGroup>
                            </Form.Group>
                            <Button type="submit" variant="success" className="w-100 rounded-pill mt-2">Sign Up &amp; Login</Button>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default UserLogin;