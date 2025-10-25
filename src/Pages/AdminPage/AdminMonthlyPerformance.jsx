import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getMonthlyPerformance } from '../../services/apiServices';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminMonthlyPerformance = () => {
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                setLoading(true);
                const data = await getMonthlyPerformance(); // Fetches overall data

                const chartData = {
                    labels: data.map(d => d.month),
                    datasets: [
                        {
                            label: 'Overall Average Score (%)',
                            data: data.map(d => d.averageScore),
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        },
                    ],
                };
                setPerformanceData(chartData);
                setError(null);
            } catch (err) {
                setError('Failed to load overall monthly performance data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPerformance();
    }, []);

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Overall Monthly Quiz Performance' },
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

    if (loading) {
        return <div className="text-center"><Spinner animation="border" /> Loading Performance...</div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <Card>
            <Card.Header><h4>Overall Monthly Performance</h4></Card.Header>
            <Card.Body className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                {performanceData ? <Bar options={options} data={performanceData} /> : <p>No performance data available yet.</p>}
            </Card.Body>
        </Card>
    );
};

export default AdminMonthlyPerformance;