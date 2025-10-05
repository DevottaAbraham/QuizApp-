import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Alert, Button } from 'react-bootstrap';

const NotFound = () => {
    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Alert variant="danger" className="text-center">
                <Alert.Heading>404 - Page Not Found</Alert.Heading>
                <p>The page you are looking for does not exist.</p>
                <Button as={Link} to="/" variant="primary">Go to Homepage</Button>
            </Alert>
        </Container>
    );
};

export default NotFound;