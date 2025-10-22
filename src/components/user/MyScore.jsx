import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Alert, Table, Spinner } from 'react-bootstrap';
import { getScoreHistory } from '../../services/apiService';

const MyScore = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    useEffect(() => {
        getScoreHistory()
            .then(data => {
                // The API should return history sorted by date descending
                setHistory(data);
            })
            .catch(error => console.error("Failed to fetch score history:", error))
            .finally(() => setLoading(false));
    }, []); // Run once on component mount

    if (loading) {
        return (
            <div className="text-center">
                <Spinner animation="border" />
                <p>Loading score history...</p>
            </div>
        );
    }

    if (history.length === 0 && !loading) {
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
                                <tr key={result.id || index}>
                                    <td>{new Date(result.date).toLocaleString()}</td>
                                    <td><Badge bg="primary">{result.score}</Badge> / <Badge bg="secondary">{result.total}</Badge></td>
                                    <td>
                                        <Button as={Link} to={`/user/score/${result.id}`} variant="primary" size="sm">
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