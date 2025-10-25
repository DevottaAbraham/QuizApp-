import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import * as api from '../../services/apiServices';
import { Link } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';

const Home = () => {
    const { currentUser } = useOutletContext();
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
                <hr />
                <div className="d-grid gap-2 mt-4">
                    <Button as={Link} to="/user/quiz" variant="primary" size="lg">
                        Today's Questions
                    </Button>
                    <Button as={Link} to="/user/history" variant="outline-secondary">
                        View My Score History
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default Home;