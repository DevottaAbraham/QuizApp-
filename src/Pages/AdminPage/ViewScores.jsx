import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
// import * as api from '../services/apiServices.js';

const ViewScores = () => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAllScores = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getAllScores();
            setScores(data);
        } catch (err) {
            setError('Failed to load scores.');
            // Toast is already handled by apiServices
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllScores();
    }, [fetchAllScores]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <Spinner animation="border" />
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <Card>
            <Card.Header>
                <h3>All User Scores</h3>
            </Card.Header>
            <Card.Body>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Score ID</th>
                            <th>Quiz Date</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scores.map((score) => (
                            <tr key={score.id}>
                                <td>{score.id}</td>
                                <td>{new Date(score.quizDate).toLocaleString()}</td>
                                <td>{score.score} / 10</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                {scores.length === 0 && <p className="text-center">No scores have been recorded yet.</p>}
            </Card.Body>
        </Card>
    );
};

export default ViewScores;