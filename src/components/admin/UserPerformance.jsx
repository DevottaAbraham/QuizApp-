import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import * as api from '../../services/apiServices';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserPerformance = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                setLoading(true);
                const [userData, performanceChartData] = await Promise.all([
                    api.getUserById(userId),
                    api.getPerformanceForUser(userId)
                ]);
                setUser(userData);

                const chartData = {
                    labels: performanceChartData.map(d => d.month),
                    datasets: [
                        {
                            label: 'Average Score (%)',
                            data: performanceChartData.map(d => d.averageScore),
                            backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        },
                    ],
                };
                setPerformanceData(chartData);
                setError(null);
            } catch (err) {
                setError(`Failed to load performance data for user ID: ${userId}.`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPerformance();
    }, [userId]);

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: `Monthly Performance for ${user?.username || ''}` },
        },
        scales: { y: { beginAtZero: true, max: 100 } },
        animation: { duration: 1000, easing: 'easeInOutQuad' }
    };

    if (loading) {
        return <div className="text-center"><Spinner animation="border" /> Loading Performance...</div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h4>Performance for {user?.username}</h4>
                <Button as={Link} to="/admin/manage-users" variant="secondary" size="sm">Back to Users</Button>
            </Card.Header>
            <Card.Body>
                {performanceData && performanceData.datasets[0].data.length > 0 ? <Bar options={options} data={performanceData} /> : <p>No performance data available for this user.</p>}
            </Card.Body>
        </Card>
    );
};

export default UserPerformance;