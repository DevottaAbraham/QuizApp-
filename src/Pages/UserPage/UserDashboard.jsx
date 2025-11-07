import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed

const UserDashboard = () => {
    const { user } = useAuth();

    return (
        <Container fluid className="p-4">
            <Row>
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Welcome, {user ? user.username : 'User'}!</Card.Title>
                            <Card.Text>This is your dashboard. You can view your scores and take quizzes from here.</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UserDashboard;

