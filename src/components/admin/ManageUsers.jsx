import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Form, Row, Col, Spinner, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '' });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPasswordInfo, setNewPasswordInfo] = useState({ username: '', password: '' });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

        try {
            const createdUser = await api.createUser(newUser);
            setUsers([...users, createdUser]); // Add to local state
            toast.success(`User '${newUser.username}' created successfully.`);
            setNewUser({ username: '', password: '' }); // Reset form
        } catch (err) {
            console.error("Failed to create user:", err);
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete the user '${username}'?`)) {
            return;
        }

        try {
            await api.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
            toast.success(`User '${username}' was deleted.`);
        } catch (err) {
            console.error("Failed to delete user:", err);
        }
    };

    const handleResetPassword = async (user) => {
        if (!window.confirm(`Are you sure you want to reset the password for user "${user.username}"?`)) {
            return;
        }
        try {
            const result = await api.resetUserPassword(user.id);
            setNewPasswordInfo({ username: user.username, password: result.newPassword });
            setShowPasswordModal(true);
            toast.success(`Password for ${user.username} has been reset.`);
        } catch (err) {
            // Error toast is handled by apiService
        }
    };

    return (
        <>
            <Row>
                <Col lg={4}>
                    <Card className="shadow-sm mb-4">
                        <Card.Header as="h5"><i className="bi bi-person-plus-fill me-2"></i>Add New User</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleAddUser}>
                                <Form.Group className="mb-3"><Form.Label>Username</Form.Label><Form.Control type="text" name="username" value={newUser.username} onChange={handleInputChange} required placeholder="New user username" /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" name="password" value={newUser.password} onChange={handleInputChange} required placeholder="Temporary password" /></Form.Group>
                                <Button type="submit" variant="primary" className="w-100">Add User</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={8}>
                    <Card className="shadow-sm">
                        <Card.Header as="h5"><i className="bi bi-people-fill me-2"></i>Current Users</Card.Header>
                        <Card.Body>
                            {loading && <div className="text-center"><Spinner animation="border" /></div>}
                            {error && <Alert variant="danger">{error}</Alert>}
                            {!loading && !error && (
                                <Table striped bordered hover responsive>
                                    <thead><tr><th>ID</th><th>Username</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td><td>{user.username}</td>
                                                <td>
                                                    <Link to={`/admin/users/${user.id}/performance`} className="btn btn-outline-info btn-sm me-2">View Performance</Link>
                                                    <Button variant="outline-warning" size="sm" className="me-2" onClick={() => handleResetPassword(user)}>Reset Password</Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUser(user.id, user.username)}>Remove</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Password Reset Successful</Modal.Title></Modal.Header>
                <Modal.Body>
                    <p>The password for user <strong>{newPasswordInfo.username}</strong> has been changed.</p>
                    <p>Please copy the new password and provide it to the user:</p>
                    <Alert variant="info" className="text-center"><strong className="fs-5 font-monospace">{newPasswordInfo.password}</strong></Alert>
                </Modal.Body>
                <Modal.Footer><Button variant="primary" onClick={() => setShowPasswordModal(false)}>Close</Button></Modal.Footer>
            </Modal>
        </>
    );
};

export default ManageUsers;