import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert, Card } from 'react-bootstrap';
import { getAdmins, createAdmin, deleteAdmin } from '../../services/apiServices';
import { toast } from 'react-toastify';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const data = await getAdmins();
            setAdmins(data);
            setError(null);
        } catch (err) {
            setError('Failed to load admins.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAdmin({ ...newAdmin, [name]: value });
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        if (!newAdmin.username || !newAdmin.password) {
            toast.error('Username and password are required.');
            return;
        }
        try {
            await createAdmin(newAdmin);
            toast.success(`Admin '${newAdmin.username}' created successfully!`);
            setShowModal(false);
            setNewAdmin({ username: '', password: '' });
            fetchAdmins(); // Refresh the list
        } catch (err) {
            toast.error(err.message || 'Failed to create admin.');
        }
    };

    const handleDeleteAdmin = async (adminId, adminUsername) => {
        if (window.confirm(`Are you sure you want to delete admin '${adminUsername}'? This cannot be undone.`)) {
            try {
                await deleteAdmin(adminId);
                toast.success(`Admin '${adminUsername}' deleted successfully.`);
                fetchAdmins(); // Refresh the list
            } catch (err) {
                toast.error(err.message || 'Failed to delete admin.');
            }
        }
    };

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h4>Manage Administrators</h4>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-circle-fill me-2"></i>Add New Admin
                </Button>
            </Card.Header>
            <Card.Body>
                {loading && <div className="text-center"><Spinner animation="border" /></div>}
                {error && <Alert variant="danger">{error}</Alert>}
                {!loading && !error && (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Username</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map((admin, index) => (
                                <tr key={admin.id}>
                                    <td>{index + 1}</td>
                                    <td>{admin.username}</td>
                                    <td>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteAdmin(admin.id, admin.username)}>
                                            <i className="bi bi-trash-fill"></i> Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton><Modal.Title>Add New Admin</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddAdmin}>
                        <Form.Group className="mb-3"><Form.Label>Username</Form.Label><Form.Control type="text" name="username" value={newAdmin.username} onChange={handleInputChange} required /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" name="password" value={newAdmin.password} onChange={handleInputChange} required /></Form.Group>
                        <Button variant="primary" type="submit">Create Admin</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Card>
    );
};

export default ManageAdmins;