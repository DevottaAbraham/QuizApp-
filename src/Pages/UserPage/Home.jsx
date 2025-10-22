import React, { useState, useEffect, useCallback } from 'react';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import { apiFetch } from '../../services/apiServices';
import { toast } from 'react-toastify';

const Home = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false); // Set to false initially, fetch on mount
    const [error, setError] = useState(null);

    const fetchHomePageContent = useCallback(async () => {
        try {
            setLoading(true);
            setError(null); // Clear previous errors
            // Fetch content from the public API endpoint
            const data = await apiFetch('/content/home', { isPublic: true });
            setContent(data.content);
        } catch (err) {
            setError('Failed to load home page content. Please try again later.');
            console.error(err);
            toast.error('Failed to refresh home page content.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHomePageContent();
    }, [fetchHomePageContent]); // Empty dependency array means this runs once on mount

    const handleRefresh = useCallback(() => {
        fetchHomePageContent();
        toast.success('Home page content refreshed!');
    }, [fetchHomePageContent]);

    return (
        <Card className="shadow-sm">
            <Card.Header as="h4" className="d-flex justify-content-between align-items-center">
                <span>Welcome!</span>
                <Button variant="outline-primary" size="sm" onClick={handleRefresh} disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : <i className="bi bi-arrow-clockwise me-1"></i>} Refresh
                </Button>
            </Card.Header>
            <Card.Body>
                {loading && <div className="text-center"><Spinner animation="border" /> <p>Loading...</p></div>}
                {error && <Alert variant="danger">{error}</Alert>}
                {!loading && !error && (
                    // Use dangerouslySetInnerHTML to render the HTML content from the backend
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                )}
            </Card.Body>
        </Card>
    );
};

export default Home;