import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getPerformanceForUser, getUserById } from '../../services/apiServices';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserPerformance = () => {
    const { userId } = useParams();
    const [performanceData, setPerformanceData] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("UserPerformance component mounted/updated. userId from useParams:", userId); // Add this line for debugging
        const fetchPerformance = async () => {
            try {
                setLoading(true);
                // Fetch both user details and performance data in parallel
                const [userData, perfData] = await Promise.all([
                    getUserById(userId),
                    getPerformanceForUser(userId)
                ]);
                
                setUser(userData);

                const chartData = {
                    labels: perfData.map(d => d.month),
                    datasets: [
                        {
                            label: `Average Score (%) for ${userData.username}`,
                            data: perfData.map(d => d.averageScore),
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        },
                    ],
                };
                setPerformanceData(chartData);
                setError(null);
            } catch (err) {
                setError(`Failed to load performance data for user ID ${userId}.`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (userId && userId !== 'undefined') { // More robust check for userId
            fetchPerformance();
        }
    }, [userId]);

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: `Monthly Performance Trend for ${user ? user.username : 'User'}` },
        },
        scales: {
            y: { beginAtZero: true, max: 100, title: { display: true, text: 'Average Score (%)' } }
        },
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
            <Card.Header><h4>Performance for: {user?.username}</h4></Card.Header>
            <Card.Body className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                {performanceData && performanceData.labels.length > 0 
                    ? <Bar options={options} data={performanceData} /> 
                    : <p>No performance data available for this user yet.</p>}
            </Card.Body>
        </Card>
    );
};

export default UserPerformance;