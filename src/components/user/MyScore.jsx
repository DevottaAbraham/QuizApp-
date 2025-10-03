import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Alert, Table } from 'react-bootstrap';

const MyScore = () => {
    const [history, setHistory] = useState([]);
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    useEffect(() => {
        const savedHistory = JSON.parse(localStorage.getItem(`quizHistory_${currentUser.userId}`)) || [];
        // Sort by date descending to show the latest first and update state
        savedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistory(savedHistory);
    }, [currentUser.userId]); // This effect should only re-run if the user changes

    if (history.length === 0) {
        return <Alert variant="info">You have not completed any quizzes yet. Go to the "Today's Questions" page to start one!</Alert>;
    }

    return (
        <>
            <Card className="shadow-sm">
                <Card.Header as="h4">
                    Score History for {currentUser.username}
                </Card.Header>
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Score</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((result, index) => (
                                <tr key={index}>
                                    <td>{new Date(result.date).toLocaleString()}</td>
                                    <td><Badge bg="primary">{result.score}</Badge> / <Badge bg="secondary">{result.total}</Badge></td>
                                    <td>
                                        <Button as={Link} to={`/user/score/${new Date(result.date).getTime()}`} variant="primary" size="sm">
                                            <i className="bi bi-eye-fill me-1"></i> View Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </>
    );
};

export default MyScore;