import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Form, Row, Col, Spinner, Alert, Modal } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';

const ManageAdmins = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '' });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPasswordInfo, setNewPasswordInfo] = useState({ username: '', password: '' });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentAdmin } = useOutletContext();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const fetchedUsers = await api.getUsers();
            // Filter to only show admin users
            setUsers(fetchedUsers.filter(u => u.role === 'ADMIN'));
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
            const createdUser = await api.createAdmin(newUser);
            setUsers([...users, createdUser]); // Add to local state
            toast.success(`Admin '${newUser.username}' created successfully.`);
            setNewUser({ username: '', password: '' }); // Reset form
        } catch (err) {
            // Error toast is handled by apiService
            console.error("Failed to create admin:", err);
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete the admin '${username}'?`)) {
            return;
        }

        try {
            await api.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
            toast.success(`Admin '${username}' was deleted.`);
        } catch (err) {
            console.error("Failed to delete admin:", err);
        }
    };

    const handleResetPassword = async (user) => {
        if (user.id === currentAdmin?.id) {
            toast.warn("You cannot reset your own password from this screen.");
            return;
        }
        if (!window.confirm(`Are you sure you want to reset the password for admin "${user.username}"?`)) {
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
                        <Card.Header as="h5"><i className="bi bi-person-plus-fill me-2"></i>Add New Admin</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleAddUser}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control type="text" name="username" value={newUser.username} onChange={handleInputChange} required placeholder="New admin username" />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" name="password" value={newUser.password} onChange={handleInputChange} required placeholder="Temporary password" />
                                </Form.Group>
                                <Button type="submit" variant="primary" className="w-100">Add Admin</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={8}>
                    <Card className="shadow-sm">
                        <Card.Header as="h5"><i className="bi bi-people-fill me-2"></i>Current Administrators</Card.Header>
                        <Card.Body>
                            {loading && <div className="text-center"><Spinner animation="border" /></div>}
                            {error && <Alert variant="danger">{error}</Alert>}
                            {!loading && !error && (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr><th>ID</th><th>Username</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.username}</td>
                                                <td>
                                                    <Button variant="outline-warning" size="sm" className="me-2" onClick={() => handleResetPassword(user)} disabled={user.id === currentAdmin?.id}>Reset Password</Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUser(user.id, user.username)} disabled={user.id === currentAdmin?.id || user.username === 'admin'}>Remove</Button>
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
                    <p>The password for admin <strong>{newPasswordInfo.username}</strong> has been changed.</p>
                    <p>Please copy the new password and provide it to the user:</p>
                    <Alert variant="info" className="text-center"><strong className="fs-5 font-monospace">{newPasswordInfo.password}</strong></Alert>
                </Modal.Body>
                <Modal.Footer><Button variant="primary" onClick={() => setShowPasswordModal(false)}>Close</Button></Modal.Footer>
            </Modal>
        </>
    );
};

export default ManageAdmins;