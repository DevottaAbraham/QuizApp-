import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, Alert, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import * as api from '../../services/apiServices';

const UserDashboard = ({ currentUser }) => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        setLoading(true);
        api.getNotices()
            .then(data => {
                // Assuming the API returns notices sorted by date
                setNotices(data);
            })
            .catch(error => console.error("Failed to fetch notices:", error))
            .finally(() => setLoading(false));
    }, [currentUser.userId]);

    const handleDismiss = (noticeId) => {
        // Optimistically remove the notice from the UI
        setNotices(prevNotices => prevNotices.filter(n => n.id !== noticeId));
        // Call the API to mark the notice as dismissed
        api.dismissNotice(noticeId).catch(error => {
            // If the API call fails, we might want to add the notice back or show an error
            console.error(`Failed to dismiss notice ${noticeId}:`, error);
            // For simplicity, we're not adding it back here, but the API service will show a toast.
        });
    };

    const handleDismissAll = () => {
        // Optimistically clear notices from the UI
        setNotices([]);
        // Call the API to dismiss all notices
        api.dismissAllNotices().catch(error => {
            console.error("Failed to dismiss all notices:", error);
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    if (!currentUser) {
        return <Alert variant="danger">You must be logged in to view the dashboard.</Alert>;
    }

    return (
        <div>
            <Card className="shadow-sm mb-4">
                <Card.Header as="h5" className="bg-primary-subtle">
                    <i className="bi bi-house-door-fill me-2"></i>
                    Welcome, {currentUser.username}!
                </Card.Header>
                <Card.Body>
                    <p>Ready to test your knowledge? Click the button below to start a new quiz.</p>
                    <Button as={Link} to="/user/quiz" variant="primary">Start Quiz</Button>
                </Card.Body>
            </Card>

            <Card className="shadow-sm">
                <Card.Header as="h5" className="bg-body-tertiary d-flex justify-content-between align-items-center">
                    <span>
                        <i className="bi bi-bell-fill me-2"></i>
                        Notices
                    </span>
                    {notices.length > 0 && (
                        <Button variant="outline-danger" size="sm" onClick={handleDismissAll}>Dismiss All</Button>
                    )}
                </Card.Header>
                <ListGroup variant="flush" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                    {loading ? (
                        <ListGroup.Item className="text-center">
                            <Spinner animation="border" size="sm" /> Loading notices...
                        </ListGroup.Item>
                    ) : notices.length > 0 ? (
                        notices.map(notice => (
                            <ListGroup.Item key={notice.id} className={`py-3 ${notice.isNew ? 'bg-primary-subtle' : ''}`}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <h6 className="mb-1">{notice.title}</h6>
                                    <div>
                                        {notice.isNew && <Badge bg="primary" pill className="me-2">New</Badge>}
                                        <Button variant="outline-secondary" size="sm" className="border-0 p-0" onClick={() => handleDismiss(notice.id)} title="Dismiss notice">
                                            <i className="bi bi-x-lg"></i>
                                        </Button>
                                    </div>
                                </div>
                                {notice.imageUrl && <img src={notice.imageUrl} alt="Notice" className="img-fluid rounded my-2" style={{ maxHeight: '150px' }} />}
                                <p className="mb-1">{notice.content}</p>
                                <small className="text-muted">Posted on: {formatDateTime(notice.date || notice.id)}</small>
                            </ListGroup.Item>
                        ))
                    ) : (
                        <ListGroup.Item>
                            <Alert variant="secondary" className="text-center m-0">
                                No notices at the moment.
                            </Alert>
                        </ListGroup.Item>
                    )}
                </ListGroup>
            </Card>
        </div>
    );
};

export default UserDashboard;