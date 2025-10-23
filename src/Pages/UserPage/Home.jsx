import React, { useState, useEffect } from 'react';
import * as api from '../../services/apiServices'; // Assuming this path

const Home = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                const data = await api.getHomePageContent();
                setContent(data.content); // Assuming the API returns { content: "..." }
            } catch (err) {
                console.error("Failed to fetch homepage content:", err);
                setError("Failed to load homepage content.");
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []); // Empty dependency array means it runs once on mount

    if (loading) return <p>Loading homepage content...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div>
            <h1>Welcome!</h1>
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
};

export default Home;