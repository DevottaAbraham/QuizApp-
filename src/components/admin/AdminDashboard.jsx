import React, { useState, useEffect } from 'react';
import { Card, Container, Spinner, Alert } from 'react-bootstrap';
import { apiFetch } from '../../services/apiServices'; // Import the apiFetch helper

const AdminDashboard = ({ admin }) => {
    const [dashboardMessage, setDashboardMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        /**
         * Fetches data from the protected admin dashboard endpoint.
         */
        const getAdminData = async () => {
            try {
                // Use the centralized apiFetch which handles authentication via JWT token.
                // Note: The backend must return a JSON object, e.g., { message: "Welcome..." }.
                // If it returns plain text, apiFetch will need adjustment. Assuming JSON for now.
                const result = await apiFetch('/admin/dashboard');
                setDashboardMessage(result); // "Welcome to the Admin Dashboard!"
            } catch (err) {
                // The apiFetch helper will show a toast, but we can still set a local error state.
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        // Call the function when the component mounts
        getAdminData();
    }, []); // This only needs to run once on mount.

    return (
        <Container>
            <Card>
                <Card.Header as="h4">Admin Dashboard</Card.Header>
                <Card.Body>
                    {loading && <Spinner animation="border" />}
                    {error && <Alert variant="danger">{error}</Alert>}
                    {dashboardMessage && <Alert variant="success">{dashboardMessage.message || dashboardMessage}</Alert>}
                    <p>This is the protected admin area. More admin features will be added here.</p>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AdminDashboard;