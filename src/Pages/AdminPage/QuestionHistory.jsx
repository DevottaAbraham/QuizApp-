import React, { useState, useEffect } from 'react';
import { Card, Table, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getQuestions } from '../../services/apiServices';

const QuestionHistory = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const data = await getQuestions();
                // Sort by last modified date to show the most recent first
                const sortedData = data.sort((a, b) => new Date(b.lastModifiedDate) - new Date(a.lastModifiedDate));
                setQuestions(sortedData);
            } catch (err) {
                setError('Failed to load question history.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    if (loading) {
        return <div className="text-center"><Spinner animation="border" /> Loading question history...</div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <Card>
            <Card.Header as="h5">Question History</Card.Header>
            <Card.Body>
                {questions.length > 0 ? (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Question (English)</th>
                                <th>Status</th>
                                <th>Last Modified</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.map(q => (
                                <tr key={q.id}>
                                    <td>{q.text_en}</td>
                                    <td><Badge bg={q.status === 'published' ? 'success' : 'secondary'}>{q.status}</Badge></td>
                                    <td>{new Date(q.lastModifiedDate).toLocaleString()}</td>
                                    <td><Link to={`/admin/questions?edit=${q.id}`} className="btn btn-sm btn-outline-primary">Edit</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : <Alert variant="info">No questions have been created yet.</Alert>}
            </Card.Body>
        </Card>
    );
};

export default QuestionHistory;