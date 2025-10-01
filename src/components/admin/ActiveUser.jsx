import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Alert } from 'react-bootstrap';
import { Toast, ToastContainer } from 'react-bootstrap';

const ActiveUser = () => {
    const [activeUsers, setActiveUsers] = useState([]);

    const updateActiveUsers = () => {
        const users = JSON.parse(localStorage.getItem("activeUsers")) || [];
        setActiveUsers(users);
    };

    useEffect(() => {
        updateActiveUsers(); // Initial load

        // Listen for custom event that signals a storage change
        window.addEventListener('storageUpdated', updateActiveUsers);

        return () => {
            // Cleanup the event listener
            window.removeEventListener('storageUpdated', updateActiveUsers);
        };
    }, []);

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