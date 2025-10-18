import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Card, ListGroup, Row, Col, FormSelect, Spinner, Alert, Image, ButtonGroup, ToggleButton } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';


const ManageNotices = () => {
    const [notices, setNotices] = useState([]);
    const [newNotice, setNewNotice] = useState({ title: '', content: '', recipient: 'global', imageUrl: ''
});
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [imageSource, setImageSource] = useState('upload'); // 'upload' or 'url'
    const fileInputRef = useRef(null);
    const [imageFile, setImageFile] = useState(null); // Store the selected file

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [noticesData, usersData] = await Promise.all([
                    api.getAdminNotices(),
                    api.getUsers()
                ]);
                setNotices(noticesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
                setUsers(usersData);
                setError(null);
            } catch (err) {
                setError('Failed to load data. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewNotice(prev => ({ ...prev, [name]: value }));
    };

    const handleImageSourceChange = (source) => {
        setImageSource(source);
        setNewNotice(prev => ({ ...prev, imageUrl: '' })); // Clear image URL
        setImageFile(null); // Clear selected file
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

   const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
        setIsUploading(true);
        try {
            // For single request, we don't upload immediately.
            // We'll just store the file and show a preview.
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setNewNotice(prev => ({ ...prev, imageUrl: previewUrl }));
            toast.info('Image selected. It will be uploaded with the notice.');
        } catch (uploadError) {
            toast.error("Could not create image preview.");
            console.error('Image selection error:', uploadError);
        } finally {
            setIsUploading(false);
        }
    }
};



    const handleAddNotice = async (e) => {
    e.preventDefault();
    setIsUploading(true); // Show a loading state on the button
    try {
        const formData = new FormData();

        // The backend expects the JSON part to be named "notice"
        formData.append('notice', new Blob([JSON.stringify({
            title: newNotice.title,
            content: newNotice.content,
            recipient: newNotice.recipient,
            // Only include imageUrl if it's from a URL source and not empty
            imageUrl: imageSource === 'url' ? newNotice.imageUrl : null,
        })], { type: 'application/json' }));

        // The backend expects the file part to be named "image"
        if (imageFile && imageSource === 'upload') {
            formData.append('image', imageFile);
        }

        const newCreatedNotice = await api.createNotice(formData);
        setNotices(prev => [newCreatedNotice, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        toast.success('Notice posted successfully!');
        handleImageSourceChange('upload'); // Fully reset the form
        setNewNotice({ title: '', content: '', recipient: 'global', imageUrl: '' });
    } catch (err) { 
        // Error toast is already shown by apiService
        console.error("Failed to create notice:", err);
    } finally {
        setIsUploading(false);
    }
};


    const handleDeleteNotice = async (id) => {
        try {
            await api.deleteNotice(id);
            setNotices(prev => prev.filter(n => n.id !== id));
            toast.error('Notice deleted.');
        } catch (err) {
            console.error("Failed to delete notice:", err);
        }
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
                                <Form.Label>Image (Optional)</Form.Label>
                                <ButtonGroup className="d-block mb-2">
                                    <ToggleButton
                                        type="radio"
                                        variant={imageSource === 'upload' ? 'primary' : 'outline-secondary'}
                                        name="imageSource"
                                        value="upload"
                                        checked={imageSource === 'upload'}
                                        onClick={() => handleImageSourceChange('upload')}
                                    >
                                        Upload File
                                    </ToggleButton>
                                    <ToggleButton
                                        type="radio"
                                        variant={imageSource === 'url' ? 'primary' : 'outline-secondary'}
                                        name="imageSource"
                                        value="url"
                                        checked={imageSource === 'url'}
                                        onClick={() => handleImageSourceChange('url')}
                                    >
                                        From URL
                                    </ToggleButton>
                                </ButtonGroup>

                                {imageSource === 'upload' ? (
                                    <Form.Control type="file" name="imageFile" ref={fileInputRef} accept="image/png, image/jpeg, image/gif" onChange={handleImageUpload} />
                                ) : (
                                    <Form.Control type="text" name="imageUrl" value={newNotice.imageUrl} onChange={handleInputChange} placeholder="https://example.com/image.png" />
                                )}

                                {isUploading && <div className="mt-2"><Spinner animation="border" size="sm" /> Uploading...</div>}
                                {newNotice.imageUrl && !isUploading && (
                                    <div className="mt-2 text-center">
                                        <Image src={newNotice.imageUrl} thumbnail width="150" />
                                    </div>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Send To</Form.Label>
                                <FormSelect name="recipient" value={newNotice.recipient} onChange={handleInputChange}>
                                    <option value="global">All Users (Global)</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.username}</option>
                                    ))}
                                </FormSelect>
                            </Form.Group>
                            <Button type="submit" variant="primary" disabled={isUploading}>
                                {isUploading ? (
                                    <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Posting...</>
                                ) : 'Post Notice'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                <Card className="shadow-sm">
                    <Card.Header as="h5">Posted Notices</Card.Header>
                    <ListGroup variant="flush" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {loading ? (
                            <ListGroup.Item className="text-center"><Spinner animation="border" size="sm" /> Loading...</ListGroup.Item>
                        ) : error ? (
                            <ListGroup.Item><Alert variant="danger">{error}</Alert></ListGroup.Item>
                        ) : notices.length > 0 ? notices.map(notice => (
                            <ListGroup.Item key={notice.id}>
                                <h5>
                                    {notice.title}
                                    <span className="badge bg-secondary ms-2 small">
                                        {notice.recipient === 'global' 
                                            ? 'Global' 
                                            : `To: ${users.find(u => u.id === notice.recipientId)?.username || 'Unknown User'}`
                                        }
                                    </span>
                                </h5>
                                {notice.imageUrl && <img src={notice.imageUrl} alt="Notice" className="img-fluid rounded mb-2" style={{ maxHeight: '150px' }} />}
                                <p className="mb-1">{notice.content}</p>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteNotice(notice.id)}>
                                    <i className="bi bi-trash-fill"></i> Delete
                                </Button>
                            </ListGroup.Item>
                        )) : (
                            <ListGroup.Item className="text-center text-muted">No notices have been posted.</ListGroup.Item>
                        )}
                    </ListGroup>
                </Card>
            </Col>
        </Row>
    );
};

export default ManageNotices;