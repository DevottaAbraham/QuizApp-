import React, { useState, useEffect } from 'react';
import { Card, Container, Spinner, Alert } from 'react-bootstrap';
import { getNotices } from '../../services/apiService'; // Assuming this fetches all relevant notices

const NoticeBoard = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // We'll use the same endpoint. The backend should handle filtering for "global" notices
        // or notices relevant to the logged-in user if a token is present.
        getNotices()
            .then(data => setNotices(data))
            .catch(error => console.error("Failed to fetch notices for board:", error))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Container>
            <h2 className="mb-4 text-center">Notice Board</h2>
            {loading ? (
                <div className="text-center"><Spinner animation="border" /></div>
            ) : notices.length > 0 ? (
                notices.map(notice => (
                    <Card key={notice.id} className="mb-3 shadow-sm">
                        <Card.Header as="h5">{notice.title}</Card.Header>
                        <Card.Body>
                            {notice.imageUrl && <img src={notice.imageUrl} alt={notice.title} className="img-fluid rounded mb-3" />}
                            {notice.content}
                        </Card.Body>
                        <Card.Footer className="text-muted">
                            Posted on: {new Date(notice.date || notice.id).toLocaleString()}
                        </Card.Footer>
                    </Card>
                ))
            ) : (
                <Alert variant="info" className="text-center">There are no new notices at the moment.</Alert>
            )}
        </Container>
    );
};

export default NoticeBoard;