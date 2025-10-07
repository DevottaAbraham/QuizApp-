import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';

const ManageAdmins = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'ADMIN' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Get the current admin from localStorage to prevent self-deletion.
    const currentAdminString = localStorage.getItem("currentAdmin");
    const currentAdmin = currentAdminString ? JSON.parse(currentAdminString) : null;

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const fetchedUsers = await api.getUsers();
            setUsers(fetchedUsers);
        } catch (err) {
            setError('Failed to load users. Please try again.');
            // The apiService toast will also be shown.
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
            setUsers([...users, createdUser]);
            toast.success(`User '${newUser.username}' created successfully.`);
            setNewUser({ username: '', password: '', role: 'ADMIN' }); // Reset form
        } catch (err) {
            // Error toast is handled by apiService
            console.error("Failed to create user:", err);
        }
    };

    const handleDeleteUser = async (userId, username) => {
        // Simple confirmation dialog
        if (!window.confirm(`Are you sure you want to delete the user '${username}'?`)) {
            return;
        }

        try {
            await api.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
            toast.success(`User '${username}' was deleted.`);
        } catch (err) {
            // Error toast is handled by apiService
            console.error("Failed to delete user:", err);
        }
    };

    return (
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
                            <Form.Group className="mb-3">
                                <Form.Label>Role</Form.Label>
                                <Form.Select name="role" value={newUser.role} onChange={handleInputChange}>
                                    <option value="ADMIN">Admin</option>
                                    <option value="USER">User</option>
                                </Form.Select>
                            </Form.Group>
                            <Button type="submit" variant="primary">Add User</Button>
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
                        <tr><th>ID</th><th>Username</th><th>Role</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {!loading && users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.role}</td>
                                <td>
                                    <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user.id, user.username)} disabled={user.id === currentAdmin?.id || user.username === 'admin'}>
                                        Remove
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default ManageAdmins;