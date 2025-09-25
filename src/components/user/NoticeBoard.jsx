import React from 'react';
import { Card, Container } from 'react-bootstrap';

const NoticeBoard = () => {
    const allNotices = JSON.parse(localStorage.getItem("quizNotices")) || [];
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const visibleNotices = allNotices.filter(notice => 
        notice.recipient === 'global' || (currentUser && notice.recipientId === currentUser.userId)
    );

    return (
        <Container>
            <h2 className="mb-4 text-center">Notice Board</h2>
            {visibleNotices.length > 0 ? (
                visibleNotices.map(notice => (
                    <Card key={notice.id} className="mb-3 shadow-sm">
                        <Card.Header as="h5">{notice.title}</Card.Header>
                        <Card.Body>
                            {notice.imageUrl && <img src={notice.imageUrl} alt={notice.title} className="img-fluid rounded mb-3" />}
                            {notice.content}
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <p className="text-center text-muted">There are no new notices for you at the moment.</p>
            )}
        </Container>
    );
};

export default NoticeBoard;