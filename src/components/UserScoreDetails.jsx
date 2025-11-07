import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Table, Spinner, Alert, Breadcrumb } from 'react-bootstrap';
import alertService from '../services/alertService';
import * as api from '../services/apiServices';

const UserScoreDetails = () => {
    const { userId } = useParams();
    const [scores, setScores] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUserDetails = useCallback(async () => {
        try {
            const [userData, scoresData] = await Promise.all([
                api.getUserById(userId),
                api.getScoresForUser(userId)
            ]);
            setUser(userData);
            setScores(scoresData);
        } catch (err) {
            setError('Failed to load user score details. The user may not exist.');
            alertService.error('Error', 'Failed to load user score details.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUserDetails();
    }, [fetchUserDetails]);

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

    const overallPercentage = scores.length > 0
        ? (scores.reduce((acc, score) => acc + score.score, 0) / (scores.length * 10)) * 100 // Assuming each quiz has 10 questions
        : 0;

    return (
        <>
            <Breadcrumb>
                <Breadcrumb.Item as={Link} to="/admin/users">User Management</Breadcrumb.Item>
                <Breadcrumb.Item active>Score Details</Breadcrumb.Item>
            </Breadcrumb>
            <Card>
                <Card.Header>
                    <h3>Score History for {user?.username}</h3>
                </Card.Header>
                <Card.Body>
                    <Alert variant="info">
                        <strong>Overall Performance:</strong> {overallPercentage.toFixed(2)}%
                    </Alert>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Quiz Date</th>
                                <th>Score</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scores.map((score, index) => (
                                <tr key={score.id}>
                                    <td>{index + 1}</td>
                                    <td>{new Date(score.quizDate).toLocaleString()}</td>
                                    <td>{score.score} / 10</td>
                                    <td>{(score.score / 10 * 100).toFixed(0)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {scores.length === 0 && <p className="text-center">This user has not taken any quizzes yet.</p>}
                </Card.Body>
            </Card>
        </>
    );
};

export default UserScoreDetails;