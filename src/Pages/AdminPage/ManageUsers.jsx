import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { getUsers, createUser, deleteUser, resetUserPassword } from '../../services/apiServices';
import { toast } from 'react-toastify';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '' });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError('Failed to load users.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await createUser(newUser);
            toast.success(`User '${newUser.username}' created successfully!`);
            setShowModal(false);
            setNewUser({ username: '', password: '' });
            fetchUsers();
        } catch (err) {
            toast.error(err.message || 'Failed to create user.');
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (window.confirm(`Are you sure you want to delete user '${username}'?`)) {
            try {
                await deleteUser(userId);
                toast.success(`User '${username}' deleted.`);
                fetchUsers();
            } catch (err) {
                toast.error(err.message || 'Failed to delete user.');
            }
        }
    };

    const handleResetPassword = async (userId, username) => {
        if (window.confirm(`Are you sure you want to reset the password for '${username}'?`)) {
            try {
                const { newPassword } = await resetUserPassword(userId);
                toast.success(`Password for ${username} has been reset to: ${newPassword}`);
            } catch (err) {
                toast.error(err.message || 'Failed to reset password.');
            }
        }
    };

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h4>Manage Users</h4>
                <Button variant="primary" onClick={() => setShowModal(true)}><i className="bi bi-plus-circle-fill me-2"></i>Add New User</Button>
            </Card.Header>
            <Card.Body>
                {loading && <div className="text-center"><Spinner animation="border" /></div>}
                {error && <Alert variant="danger">{error}</Alert>}
                {!loading && !error && (
                    <Table striped bordered hover responsive>
                        <thead><tr><th>#</th><th>Username</th><th>Actions</th></tr></thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={user.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {user.username}
                                    </td>
                                    <td>
                                        <Button variant="warning" size="sm" className="me-2" onClick={() => handleResetPassword(user.id, user.username)}><i className="bi bi-key-fill"></i> Reset Pass</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user.id, user.username)}><i className="bi bi-trash-fill"></i> Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
            <Modal show={showModal} onHide={() => setShowModal(false)}><Modal.Header closeButton><Modal.Title>Add New User</Modal.Title></Modal.Header><Modal.Body><Form onSubmit={handleAddUser}><Form.Group className="mb-3"><Form.Label>Username</Form.Label><Form.Control type="text" name="username" value={newUser.username} onChange={handleInputChange} required /></Form.Group><Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" name="password" value={newUser.password} onChange={handleInputChange} required /></Form.Group><Button variant="primary" type="submit">Create User</Button></Form></Modal.Body></Modal>
        </Card>
    );
};

export default ManageUsers;