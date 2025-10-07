import React, { useState } from 'react';
import { Form, Button, Card, Col, Row, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';
import { useEffect } from 'react';

const AppearanceSettings = () => {
    const [homeContent, setHomeContent] = useState({ title: '', lead: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                const content = await api.getHomePageContent();
                setHomeContent(content);
            } catch (err) {
                setError('Failed to load home page content.');
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setHomeContent({ ...homeContent, [name]: value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.updateHomePageContent(homeContent);
            toast.success('Appearance settings saved successfully!');
        } catch (err) {
            // API service will show an error toast
            console.error('Failed to save appearance settings:', err);
        }
    };

    return (
        <>
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="shadow-sm">
                        <Card.Header as="h5">User Home Page Appearance</Card.Header>
                        {loading ? (
                            <Card.Body className="text-center"><Spinner animation="border" /></Card.Body>
                        ) : error ? (
                            <Alert variant="danger" className="m-3">{error}</Alert>
                        ) : (
                            <Card.Body>
                                <Form onSubmit={handleSave}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Main Title</Form.Label>
                                        <Form.Control type="text" name="title" value={homeContent.title} onChange={handleInputChange} required />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Lead Text / Subtitle</Form.Label>
                                        <Form.Control as="textarea" rows={3} name="lead" value={homeContent.lead} onChange={handleInputChange} required />
                                    </Form.Group>
                                    <Button type="submit" variant="primary">Save Changes</Button>
                                </Form>
                            </Card.Body>
                        )}
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default AppearanceSettings;