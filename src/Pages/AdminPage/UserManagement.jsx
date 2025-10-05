import React, { useState } from 'react';
import { Table, Button, Card, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

const getUsers = () => JSON.parse(localStorage.getItem("quizUsers")) || [];
const saveUsers = (users) => {
    localStorage.setItem("quizUsers", JSON.stringify(users));
    window.dispatchEvent(new Event('storageUpdated')); // Notify dashboard
};

const UserManagement = () => {
    const [users, setUsers] = useState(getUsers());
    const [newUsername, setNewUsername] = useState('');

    const handleInputChange = (e) => {
        setNewUsername(e.target.value);
    };

    const handleAddUser = (e) => {
        e.preventDefault();
        if (!newUsername) {
            toast.warn("Please provide a username.");
            return;
        }
        if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase())) {
            toast.error("Username already exists.");
            return;
        }
        const userIdPrefix = newUsername.substring(0, 4).toLowerCase().replace(/\s+/g, '');
        const generatedPassword = Math.random().toString(36).slice(-8);
        const userToAdd = { userId: `${userIdPrefix}_${Date.now()}`, username: newUsername, password: generatedPassword };
        const updatedUsers = [...users, userToAdd];
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        toast.success(<div>User '{newUsername}' created! <br /> Password: <strong>{generatedPassword}</strong></div>);
        setNewUsername('');
    };

    const handleDeleteUser = (userId) => {
        const updatedUsers = users.filter(u => u.userId !== userId);
        setUsers(updatedUsers);

        // Also remove from active users if they are there
        const activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || [];
        const updatedActiveUsers = activeUsers.filter(u => u.userId !== userId);
        localStorage.setItem("activeUsers", JSON.stringify(updatedActiveUsers));

        saveUsers(updatedUsers);
        toast.error("User removed.");
    };

    return (
        <div>
            <Row>
                <Col md={4}>
                    <Card className="shadow-sm mb-4">
                        <Card.Header as="h5">Add New User</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleAddUser}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control type="text" name="username" value={newUsername} onChange={handleInputChange} required />
                                </Form.Group>
                                <Button type="submit" variant="primary" className="w-100">Add User & Generate Password</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={8}>
                    <h2 className="d-none d-md-block">User Management</h2>
                    <p>Below is the list of registered users and their credentials.</p>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr><th>User ID</th><th>Username</th><th>Password</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {users.map(user => <tr key={user.userId}><td><code>{user.userId}</code></td><td>{user.username}</td><td>{user.password}</td><td><Button variant="danger" size="sm" onClick={() => handleDeleteUser(user.userId)}>Remove</Button></td></tr>)}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </div>
    );
};

export default UserManagement;