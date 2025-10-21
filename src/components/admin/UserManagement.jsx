import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Card, Modal, Alert, InputGroup, FormControl, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';
import { Link } from 'react-router-dom';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getUsers();
            // Ensure we only show users with the 'USER' role
            setUsers(data.filter(u => u.role === 'USER'));
        } catch (err) {
            // Error is already toasted by apiServices
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDeleteUser = async (userId, username) => {
        if (window.confirm(`Are you sure you want to delete the user '${username}'? This action cannot be undone.`)) {
            try {
                await api.deleteUser(userId);
                toast.success(`User '${username}' has been deleted.`);
                fetchUsers(); // Refresh the list
            } catch (error) {
                // Error is already toasted
            }
        }
    };

    const handleShowResetModal = (user) => {
        setSelectedUser(user);
        setShowResetModal(true);
    };

    const handleResetPassword = async () => {
        if (!selectedUser) return;
        try {
            const response = await api.resetUserPassword(selectedUser.id);
            setNewPassword(response.newPassword);
            toast.success(`Password for '${selectedUser.username}' has been reset.`);
        } catch (error) {
            // Error toast is handled by apiService
        }
    };

    const handleCloseModal = () => {
        setShowResetModal(false);
        setSelectedUser(null);
        setNewPassword('');
    };

    return (
        <>
            <Card>
                <Card.Header>
                    <h3>User Management</h3>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <div className="text-center"><Spinner animation="border" /></div>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.username}</td>
                                        <td>
                                            <Button as={Link} to={`/admin/scores?userId=${user.id}`} variant="info" size="sm" className="me-2" title="View Scores">
                                                <i className="bi bi-bar-chart-line-fill"></i> Scores
                                            </Button>
                                            <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowResetModal(user)} title="Reset Password">
                                                <i className="bi bi-key-fill"></i> Reset
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user.id, user.username)} title="Delete User">
                                                <i className="bi bi-trash-fill"></i> Remove
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Password Reset Modal */}
            <Modal show={showResetModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reset Password for {selectedUser?.username}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!newPassword ? (
                        <Button variant="primary" onClick={handleResetPassword} className="w-100">Generate New Password</Button>
                    ) : (
                        <Alert variant="success">
                            <Alert.Heading>New Password Generated!</Alert.Heading>
                            <p>Please copy this password and provide it to the user. This window will not show it again.</p>
                            <hr />
                            <InputGroup>
                                <FormControl readOnly value={newPassword} />
                                <Button variant="outline-secondary" onClick={() => { navigator.clipboard.writeText(newPassword); toast.info("Password copied!"); }}>Copy</Button>
                            </InputGroup>
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default UserManagement;