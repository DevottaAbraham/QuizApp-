import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';

const ManageAdmins = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'ADMIN' });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentAdmin } = useOutletContext();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const fetchedUsers = await api.getUsers();
            // Filter to only show admin users
            setUsers(fetchedUsers.filter(u => u.roles?.some(role => role === 'ADMIN' || role === 'ROLE_ADMIN')));
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
            const createdUser = await api.adminRegister(newUser.username, newUser.password);
            setUsers([...users, createdUser]); // Add to local state
            toast.success(`Admin '${newUser.username}' created successfully.`);
            setNewUser({ username: '', password: '', role: 'ADMIN' }); // Reset form
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

    return (
        <Row>
            <Col md={4}>
                <Card className="shadow-sm mb-4">
                    <Card.Header as="h5">Add New Admin User</Card.Header>
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
                            <Button type="submit" variant="primary">Add Admin</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={8}>
                <h2>Admin Management</h2>
                {loading && <Spinner animation="border" />}
                {error && <Alert variant="danger">{error}</Alert>}
                <Table striped bordered hover responsive>
                    <thead>
                        <tr><th>ID</th><th>Username</th><th>Roles</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {!loading && users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.roles.join(', ')}</td>
                                <td>
                                    <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user.id, user.username)} disabled={user.id === currentAdmin?.id || user.username === 'admin'}>Remove</Button>
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