import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';

const AdminForgotPassword = () => {
    const [username, setUsername] = useState('');
    const [adminSetupToken, setAdminSetupToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setNewPassword('');

        try {
            const response = await api.adminForgotPassword({ username, adminSetupToken });
            toast.success(response.message || "Password reset successfully.");
            if (response.newPassword) {
                setNewPassword(response.newPassword);
            }
        } catch (err) {
            // The apiService already shows a toast for the error message
            setError(err.message || "An unknown error occurred.");
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
                            <h3 className="text-center mb-4">Admin Password Reset</h3>
                            {newPassword ? (
                                <Alert variant="danger" className="text-center">
                                    <Alert.Heading>Temporary Password Generated!</Alert.Heading>
                                    <p>Please copy this password. You will be required to change it on your next login.</p>
                                    <hr />
                                    <p className="mb-0" style={{ fontSize: '1.2rem', fontWeight: 'bold', userSelect: 'all' }}>
                                        {newPassword}
                                    </p>
                                </Alert>
                            ) : (
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3" controlId="username">
                                        <Form.Label>Admin Username</Form.Label>
                                        <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="adminSetupToken">
                                        <Form.Label>Admin Setup Token</Form.Label>
                                        <Form.Control type="password" value={adminSetupToken} onChange={(e) => setAdminSetupToken(e.target.value)} required />
                                        <Form.Text className="text-muted">
                                            This is the secret token from your server's configuration file.
                                        </Form.Text>
                                    </Form.Group>
                                    <div className="d-grid">
                                        <Button variant="primary" type="submit" disabled={loading}>
                                            {loading ? 'Resetting...' : 'Reset Password'}
                                        </Button>
                                    </div>
                                </Form>
                            )}
                            <div className="text-center mt-3">
                                <Link to="/admin/login">Back to Login</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminForgotPassword;