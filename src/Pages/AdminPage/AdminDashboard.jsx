import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed

const AdminDashboard = () => {
    const { user } = useAuth();

    return (
        <Container fluid className="p-4">
            <Row>
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Welcome, {user ? user.username : 'Admin'}!</Card.Title>
                            <Card.Text>This is your dashboard. You can manage users, quizzes, and content from here.</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminDashboard;