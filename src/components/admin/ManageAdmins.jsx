import React, { useState } from 'react';
import { Table, Button, Card, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

const getAdmins = () => JSON.parse(localStorage.getItem("quizAdmins")) || [];
const saveAdmins = (admins) => localStorage.setItem("quizAdmins", JSON.stringify(admins));

const ManageAdmins = () => {
    const [admins, setAdmins] = useState(getAdmins());
    const [newAdmin, setNewAdmin] = useState({ email: '', password: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAdmin({ ...newAdmin, [name]: value });
    };

    const handleAddAdmin = (e) => {
        e.preventDefault();
        if (!newAdmin.email || !newAdmin.password) {
            toast.warn("Please provide both an email and password.");
            return;
        }
        if (admins.some(a => a.email.toLowerCase() === newAdmin.email.toLowerCase())) {
            toast.error("An admin with this email already exists.");
            return;
        }
        // New admins are always given the 'admin' role
        const updatedAdmins = [...admins, { ...newAdmin, role: 'admin' }];
        setAdmins(updatedAdmins);
        saveAdmins(updatedAdmins);
        toast.success(`Admin '${newAdmin.email}' created successfully.`);
        setNewAdmin({ email: '', password: '' });
    };

    const handleDeleteAdmin = (email) => {
        const adminToDelete = admins.find(a => a.email === email);
        if (adminToDelete.role === 'main') {
            toast.error("The main admin cannot be removed.");
            return;
        }
        const updatedAdmins = admins.filter(a => a.email !== email);
        setAdmins(updatedAdmins);
        saveAdmins(updatedAdmins);
        toast.error("Admin removed.");
    };

    return (
        <Row>
            <Col md={4}>
                <Card className="shadow-sm mb-4">
                    <Card.Header as="h5">Add New Admin</Card.Header>
                    <Card.Body>
                        <Form onSubmit={handleAddAdmin}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" name="email" value={newAdmin.email} onChange={handleInputChange} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" name="password" value={newAdmin.password} onChange={handleInputChange} required />
                            </Form.Group>
                            <Button type="submit" variant="primary">Add Admin</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={8}>
                <h2>Admin Management</h2>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr><th>Email</th><th>Role</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {admins.map(admin => <tr key={admin.email}><td>{admin.email}</td><td>{admin.role}</td><td><Button variant="danger" size="sm" onClick={() => handleDeleteAdmin(admin.email)} disabled={admin.role === 'main'}>Remove</Button></td></tr>)}
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default ManageAdmins;