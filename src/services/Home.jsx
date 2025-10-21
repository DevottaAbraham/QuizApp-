import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import * as api from '../../services/apiServices';

const Home = ({ currentUser }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const homeContent = await api.getHomePageContent();
                setContent(homeContent.content);
            } catch (err) {
                setError('Failed to load home page content.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    if (loading) {
        return <div className="text-center"><Spinner animation="border" /></div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <Card className="shadow-sm">
            <Card.Body className="p-4">
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </Card.Body>
        </Card>
    );
};

export default Home;