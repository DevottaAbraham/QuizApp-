import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Alert, Spinner } from 'react-bootstrap';

const ActiveUser = ({ activeUsers: initialActiveUsers = [] }) => {
    const [activeUsers, setActiveUsers] = useState([]);

    useEffect(() => {
        // In the future, you would fetch this data from your backend API.
        // For now, we'll just use the prop passed in.
        // Example: fetch('/api/active-users').then(res => res.json()).then(setActiveUsers);
        setActiveUsers(initialActiveUsers);
    }, [initialActiveUsers]);

    return (
        <Card className="shadow-sm">
            <Card.Header as="h5"><i className="bi bi-person-check-fill me-2"></i>Active Users</Card.Header>
            <ListGroup variant="flush">
                {activeUsers.length > 0 ? activeUsers.map(user => (
                    <ListGroup.Item key={user.userId}>{user.username} (<code>{user.userId}</code>)</ListGroup.Item>
                )) : (
                    <ListGroup.Item><Alert variant="info" className="mb-0">No users are currently active.</Alert></ListGroup.Item>
                )}
            </ListGroup>
        </Card>
    );
};

export default ActiveUser;