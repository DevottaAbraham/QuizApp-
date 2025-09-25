import React, { useState } from 'react';
import { Form, Button, Card, ListGroup, Row, Col, FormSelect } from 'react-bootstrap';
import { toast } from 'react-toastify';

const getNotices = () => JSON.parse(localStorage.getItem("quizNotices")) || [];
const saveNotices = (notices) => localStorage.setItem("quizNotices", JSON.stringify(notices));

const ManageNotices = () => {
    const [notices, setNotices] = useState(getNotices());
    const [newNotice, setNewNotice] = useState({ title: '', content: '', recipient: 'global', imageUrl: '' });
    const quizUsers = JSON.parse(localStorage.getItem("quizUsers")) || [];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewNotice({ ...newNotice, [name]: value });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // The result is a Base64 Data URL
                setNewNotice({ ...newNotice, imageUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddNotice = (e) => {
        e.preventDefault();
        if (!newNotice.title || !newNotice.content) {
            toast.warn('Please fill out all fields.');
            return;
        }
        const recipientId = newNotice.recipient === 'global' ? 'global' : parseInt(newNotice.recipient, 10);
        const updatedNotices = [{ id: Date.now(), ...newNotice, recipientId }, ...notices];
        setNotices(updatedNotices);
        saveNotices(updatedNotices);
        toast.success('Notice posted successfully!');
        setNewNotice({ title: '', content: '', recipient: 'global', imageUrl: '' });
    };

    const handleDeleteNotice = (id) => {
        const updatedNotices = notices.filter(n => n.id !== id);
        setNotices(updatedNotices);
        saveNotices(updatedNotices);
        toast.error('Notice deleted.');
    };

    return (
        <Row>
            <Col md={6}>
                <Card className="shadow-sm">
                    <Card.Header as="h5">Post a New Notice</Card.Header>
                    <Card.Body>
                        <Form onSubmit={handleAddNotice}>
                            <Form.Group className="mb-3">
                                <Form.Label>Notice Title</Form.Label>
                                <Form.Control type="text" name="title" value={newNotice.title} onChange={handleInputChange} placeholder="Enter notice title" required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Content</Form.Label>
                                <Form.Control as="textarea" rows={4} name="content" value={newNotice.content} onChange={handleInputChange} placeholder="Enter notice content" required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Upload Image (Optional)</Form.Label>
                                <Form.Control 
                                    type="file" 
                                    name="imageFile" 
                                    accept="image/png, image/jpeg, image/gif" 
                                    onChange={handleImageUpload} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Send To</Form.Label>
                                <FormSelect name="recipient" value={newNotice.recipient} onChange={handleInputChange}>
                                    <option value="global">All Users (Global)</option>
                                    {quizUsers.map(user => (
                                        <option key={user.userId} value={user.userId}>{user.username} ({user.userId})</option>
                                    ))}
                                </FormSelect>
                            </Form.Group>
                            <Button type="submit" variant="primary">Post Notice</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                <Card className="shadow-sm">
                    <Card.Header as="h5">Posted Notices</Card.Header>
                    <ListGroup variant="flush" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {notices.length > 0 ? notices.map(notice => (
                            <ListGroup.Item key={notice.id}>
                                <h5>
                                    {notice.title}
                                    <span className="badge bg-secondary ms-2 small">{notice.recipient === 'global' ? 'Global' : `To: ${quizUsers.find(u => u.userId === notice.recipientId)?.username || 'Unknown'}`}</span>
                                </h5>
                                {notice.imageUrl && <img src={notice.imageUrl} alt="Notice" className="img-fluid rounded mb-2" style={{ maxHeight: '100px' }} />}
                                <p className="mb-1">{notice.content}</p>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteNotice(notice.id)}>
                                    <i className="bi bi-trash-fill"></i> Delete
                                </Button>
                            </ListGroup.Item>
                        )) : (
                            <ListGroup.Item>No notices have been posted.</ListGroup.Item>
                        )}
                    </ListGroup>
                </Card>
            </Col>
        </Row>
    );
};

export default ManageNotices;