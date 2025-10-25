import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Spinner, Alert, Row, Col, Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import * as api from '../../services/apiServices.js';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ViewScores = () => {
    const [scores, setScores] = useState([]);
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate hook

    const fetchAllScores = useCallback(async () => {
        try {
            setLoading(true);
            const [scoresData, performanceChartData] = await Promise.all([
                api.getAllScores(),
                api.getMonthlyPerformance()
            ]);
            setScores(scoresData);

            // Prepare data for Chart.js
            const chartData = {
                labels: performanceChartData.map(d => d.month),
                datasets: [{
                    label: 'Overall Average Score (%)',
                    data: performanceChartData.map(d => d.averageScore),
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgb(255, 99, 132)',
                }]
            };
            setPerformanceData(chartData);
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

    // CRITICAL FIX: Navigate to the dedicated user performance page
    const handleViewPerformance = (userId) => {
        navigate(`/admin/users/${userId}/performance`);
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

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Overall Monthly Performance Trend' },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: { display: true, text: 'Average Score (%)' }
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuad',
        }
    };

    return (
        <>
            <Card className="mb-4">
                <Card.Header>
                    <h3>Monthly Performance Trend (Average Score)</h3>
                </Card.Header>
                <Card.Body>
                    {performanceData && performanceData.labels && performanceData.labels.length > 0 ? (
                        <div style={{ height: '300px' }}>
                            <Bar options={chartOptions} data={performanceData} />
                        </div>
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
                                <th>Username</th>
                                <th>Quiz Date</th>
                                <th>Score</th>
                                <th>Total Questions</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scores.length > 0 && scores.map((score) => (
                                <tr key={score.id}>
                                    <td>{score.username}</td>
                                    <td>{new Date(score.quizDate).toLocaleString()}</td>
                                    <td>{score.score} / {score.totalQuestions}</td>
                                    <td>{score.totalQuestions}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => handleViewPerformance(score.userId)} // Ensure score.userId is always a valid number
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

        </>
    );
};

export default ViewScores;