import React, { useState, useEffect } from 'react';
import { Form, Button, Card, ListGroup, Row, Col, FormSelect, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';

const ManageNotices = () => {
    const [notices, setNotices] = useState([]);
    const [users, setUsers] = useState([]);
    const [newNotice, setNewNotice] = useState({ message: '', is_active: true });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [fetchedNotices, fetchedUsers] = await Promise.all([
                api.getNotices(),
                api.getUsers()
            ]);
            setNotices(fetchedNotices);
            setUsers(fetchedUsers.filter(u => u.role === 'USER')); // Only show regular users as recipients
        } catch (err) {
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewNotice({ ...newNotice, [name]: value });
    };

    const handleAddNotice = async (e) => {
        e.preventDefault();
        if (!newNotice.message) {
            toast.warn('Please fill out the notice content.');
            return;
        }
        try {
            const createdNotice = await api.createNotice(newNotice);
            setNotices([createdNotice, ...notices]);
            toast.success('Notice posted successfully!');
            setNewNotice({ message: '', is_active: true }); // Reset form
        } catch (err) {
            // API service will show a toast
            console.error("Failed to create notice:", err);
        }
    };

    const handleDeleteNotice = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notice?')) {
            return;
        }
        try {
            await api.deleteNotice(id);
            setNotices(notices.filter(n => n.id !== id));
            toast.success('Notice deleted.');
        } catch (err) {
            console.error("Failed to delete notice:", err);
        }
    };

    return (
        <Row>
            <Col md={6}>
                <Card className="shadow-sm mb-4">
                    <Card.Header as="h5">Post a New Notice</Card.Header>
                    <Card.Body>
                        <Form onSubmit={handleAddNotice}>
                            <Form.Group className="mb-3">
                                <Form.Label>Notice Message</Form.Label>
                                <Form.Control as="textarea" rows={4} name="message" value={newNotice.message} onChange={handleInputChange} placeholder="Enter notice content" required />
                            </Form.Group>
                            <Button type="submit" variant="primary">Post Notice</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                <Card className="shadow-sm mb-4">
                    <Card.Header as="h5">Posted Notices</Card.Header>
                    {loading && <Card.Body className="text-center"><Spinner animation="border" /></Card.Body>}
                    {error && <Alert variant="danger" className="m-3">{error}</Alert>}
                    <ListGroup variant="flush" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {!loading && notices.length > 0 ? notices.map(notice => (
                            <ListGroup.Item key={notice.id}>
                                <p className="mb-1">{notice.message}</p>
                                <small className="text-muted">
                                    Status: <span className={notice.is_active ? 'text-success' : 'text-danger'}>{notice.is_active ? 'Active' : 'Inactive'}</span>
                                    {' | '} Created: {new Date(notice.created_at).toLocaleString()}
                                </small>
                                <Button variant="outline-danger" size="sm" className="float-end" onClick={() => handleDeleteNotice(notice.id)}>
                                    <i className="bi bi-trash-fill"></i> Delete
                                </Button>
                            </ListGroup.Item>
                        )) : (
                            !loading && <ListGroup.Item>No notices have been posted.</ListGroup.Item>
                        )}
                    </ListGroup>
                </Card>
            </Col>
        </Row>
    );
};

export default ManageNotices;