import React, { useState } from 'react';
import { Form, Button, Card, Col, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';

const AppearanceSettings = () => {
    const defaultContent = { title: "Welcome to the Bible Quiz!", lead: "Test your knowledge and grow in faith." };
    const [homeContent, setHomeContent] = useState(
        JSON.parse(localStorage.getItem("userHomePageContent")) || defaultContent
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setHomeContent({ ...homeContent, [name]: value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem("userHomePageContent", JSON.stringify(homeContent));
        toast.success('Appearance settings saved successfully!');
    };

    return (
        <>
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="shadow-sm">
                        <Card.Header as="h5">User Home Page Appearance</Card.Header>
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
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default AppearanceSettings;