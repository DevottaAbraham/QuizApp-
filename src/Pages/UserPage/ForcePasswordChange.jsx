import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';
import { useAuth } from '../../contexts/AuthContext';

const ForcePasswordChange = () => {
    const { currentUser } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        if (!currentUser) {
            toast.error("You must be logged in to change your password.");
            navigate('/user/login');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.forceChangePassword({
                userId: currentUser.id,
                oldPassword: oldPassword,
                newPassword: newPassword,
            });

            toast.success("Password changed successfully! Please log in again with your new password.");
            await api.logout(); // Log the user out to force re-authentication
            navigate('/user/login');

        } catch (err) {
            // Error is already toasted by apiService
            setError(err.message || "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Row className="w-100 justify-content-center">
                <Col md={6} lg={5} xl={4}>
                    <Card className="shadow-lg">
                        <Card.Header as="h4" className="text-center">Change Your Password</Card.Header>
                        <Card.Body className="p-4">
                            <p className="text-muted text-center mb-4">You are required to change your temporary password.</p>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="oldPassword">
                                    <Form.Label>Current (Temporary) Password</Form.Label>
                                    <Form.Control type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="newPassword">
                                    <Form.Label>New Password</Form.Label>
                                    <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                </Form.Group>
                                <Form.Group className="mb-4" controlId="confirmNewPassword">
                                    <Form.Label>Confirm New Password</Form.Label>
                                    <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </Form.Group>
                                <Button variant="primary" type="submit" className="w-100" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ForcePasswordChange;