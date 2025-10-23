import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Spinner, Alert, Row, Col, Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
// import * as api from '../services/apiServices.js';
import * as api from '../../services/apiServices.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ViewScores = () => {
    const [scores, setScores] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userPerformanceData, setUserPerformanceData] = useState([]);
    const [loadingModal, setLoadingModal] = useState(false);

    const fetchAllScores = useCallback(async () => {
        try {
            setLoading(true);
            const [scoresData, performanceChartData] = await Promise.all([
                api.getAllScores(),
                api.getMonthlyPerformance()
            ]);
            setScores(scoresData);

            // Calculate month-over-month change
            const chartDataWithChange = performanceChartData.map((current, index, arr) => {
                if (index === 0) return { ...current, change: 0 };
                const previous = arr[index - 1];
                const change = ((current.averageScore - previous.averageScore) / previous.averageScore) * 100;
                return { ...current, change: change.toFixed(2) };
            });

            setPerformanceData(chartDataWithChange);
        } catch (err) {
            setError('Failed to load scores or performance data.');
            // Toast is already handled by apiServices
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllScores();
    }, [fetchAllScores]);

    const handleViewPerformance = async (user) => {
        setSelectedUser(user);
        setShowModal(true);
        setLoadingModal(true);
        try {
            const data = await api.getPerformanceForUser(user.userId);
            setUserPerformanceData(data);
        } catch (err) {
            toast.error(`Failed to load performance for ${user.username}`);
            setShowModal(false);
        } finally {
            setLoadingModal(false);
        }
    };

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
        <>
            <Card className="mb-4">
                <Card.Header>
                    <h3>Monthly Performance Trend (Average Score)</h3>
                </Card.Header>
                <Card.Body>
                    {performanceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={performanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value, name) => {                                    
                                    const numericValue = typeof value === 'number' ? value : 0;
                                    if (name === 'MoM Change') {
                                        return [`${numericValue.toFixed(2)}%`, 'Month-over-Month Change'];
                                    }
                                    // For 'Average Score'
                                    return [numericValue.toFixed(2), name];
                                }} />
                                <Legend />
                                <Line type="monotone" dataKey="averageScore" stroke="#8884d8" activeDot={{ r: 8 }} name="Average Score" />
                                <Line type="monotone" dataKey="change" stroke="#82ca9d" name="MoM Change" unit="%" yAxisId={0} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center">Not enough data to display performance trends.</p>
                    )}
                </Card.Body>
            </Card>

            <Card>
                <Card.Header>
                    <h3>All User Scores</h3>
                </Card.Header>
                <Card.Body>
                    <Table striped bordered hover responsive="sm">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Username</th>
                                <th>Quiz Date</th>
                                <th>Score</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scores.length > 0 && scores.map((score) => (
                                <tr key={score.quizId}>
                                    <td>{score.userId}</td>
                                    <td>{score.username}</td>
                                    <td>{new Date(score.quizDate).toLocaleString()}</td>
                                    <td>{score.score}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => handleViewPerformance(score)}
                                        >
                                            View Performance
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {scores.length === 0 && <p className="text-center">No scores have been recorded yet.</p>}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Performance for {selectedUser?.username}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loadingModal ? (
                        <div className="text-center"><Spinner animation="border" /></div>
                    ) : userPerformanceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={userPerformanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value, name) => {
                                    const numericValue = typeof value === 'number' ? value : 0;
                                    return [numericValue.toFixed(2), 'Average Score'];
                                }} />
                                <Legend />
                                <Line type="monotone" dataKey="averageScore" stroke="#8884d8" name="Average Score" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <Alert variant="info">No performance data available for this user.</Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ViewScores;