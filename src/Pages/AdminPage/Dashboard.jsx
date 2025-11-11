import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getDashboardStats } from '../../services/apiServices';
import DashboardComponent from '../../components/admin/Dashboard'; // Renamed import

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        publishedQuestions: 0,
        totalQuestions: 0,
        // Add other stats as your backend provides them
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const data = await getDashboardStats();
                setStats(data);
            } catch (err) {
                // The apiService already shows a toast
                console.error("Failed to fetch dashboard stats:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const userQuizLink = `${window.location.origin}/user/login`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(userQuizLink).then(() => {
            toast.info('Quiz link copied to clipboard!');
        });
    };

    // The apiService handles showing toasts for network errors, so we don't need a separate error state here
    // unless we want to render a specific error UI.

    return (
        <DashboardComponent
            isLoading={isLoading}
            stats={stats}
            userQuizLink={userQuizLink}
            onCopyLink={handleCopyLink}
        />
    );
};

export default Dashboard;