import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Form, Row, Col, Spinner, Alert, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'USER' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const fetchedUsers = await api.getUsers();
            // Filter to only show regular users
            setUsers(fetchedUsers.filter(u => u.role === 'USER'));
        } catch (err) {
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password) {
            toast.warn("Please provide both a username and password.");
            return;
        }
        if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
            toast.error("A user with this username already exists.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Force role to USER
            const userToCreate = { ...newUser, role: 'USER' };
            const createdUser = await api.createUser(userToCreate);
            setUsers([...users, createdUser]);
            toast.success(`User '${newUser.username}' created successfully.`);
            setNewUser({ username: '', password: '', role: 'USER' });
        } catch (err) {
            console.error("Failed to create user:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete the user '${username}'?`)) {
            return;
        }

        setIsSubmitting(true);
        try {
            await api.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
            toast.success(`User '${username}' was deleted.`);
        } catch (err) {
            console.error("Failed to delete user:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenResetModal = (user) => {
        setSelectedUser(user);
        setNewPassword('');
        setShowResetModal(true);
    };

    const handleCloseResetModal = () => {
        setShowResetModal(false);
        setSelectedUser(null);
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!selectedUser || !newPassword) {
            toast.warn("Please enter a new password.");
            return;
        }

        setIsSubmitting(true);
        try {
            // We only need to send the password for an update
            const userData = { password: newPassword, username: selectedUser.username, role: selectedUser.role };
            await api.updateUser(selectedUser.id, userData);
            toast.success(`Password for '${selectedUser.username}' has been reset.`);
            handleCloseResetModal();
        } catch (err) {
            console.error("Failed to reset password:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Row>
                <Col md={4}>
                    <Card className="shadow-sm mb-4">
                        <Card.Header as="h5">Add New User</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleAddUser}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control type="text" name="username" value={newUser.username} onChange={handleInputChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" name="password" value={newUser.password} onChange={handleInputChange} required />
                                </Form.Group>
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Loading...</>
                                    ) : (
                                        'Add User'
                                    )}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={8}>
                    <h2>User Management</h2>
                    {loading && <Spinner animation="border" />}
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.role}</td>
                                    <td className="d-flex gap-2">
                                        <Button variant="secondary" size="sm" onClick={() => handleOpenResetModal(user)}>
                                            Reset Password
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user.id, user.username)} disabled={isSubmitting}>
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>

            {/* Password Reset Modal */}
            <Modal show={showResetModal} onHide={handleCloseResetModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reset Password for {selectedUser?.username}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handlePasswordReset}>
                        <Form.Group>
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter a new temporary password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                autoFocus
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseResetModal}>Cancel</Button>
                    <Button variant="primary" onClick={handlePasswordReset} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Saving...</>
                        ) : (
                            'Set New Password'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default UserManagement;