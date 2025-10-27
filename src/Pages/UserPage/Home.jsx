import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import * as api from '../../services/apiServices';
import { Link, useOutletContext } from 'react-router-dom';

const Home = () => {
    const [homeContent, setHomeContent] = useState({ title: 'Loading...', lead: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // This function will run every time the component is loaded
        const fetchContent = async () => {
            try {
                // Fetch the content from the backend API
                const homeContent = await api.getHomePageContent();
                setHomeContent(homeContent);
            } catch (err) {
                console.error('Failed to fetch homepage content:', err);
                setError('Failed to load content.'); // Fallback text
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []); // The empty dependency array ensures this runs once when the component mounts

    if (loading) {
        return <div className="text-center"><Spinner animation="border" /></div>;
    }

    if (error) {
        return <Alert variant="warning">{error}</Alert>;
    }

    return (
        <div>
            <h1>{homeContent.title}</h1>
            <p className="lead">{homeContent.lead}</p>
            {/* ... rest of your homepage content */}
        </div>
    );
};

export default Home;