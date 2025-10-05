import React, { useState, useEffect } from 'react';
import { getHomePageContent } from '../../components/user/contentService';

const Home = ({ currentUser }) => {
    const [homeContent, setHomeContent] = useState({ title: 'Loading...', lead: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const content = await getHomePageContent();
                setHomeContent(content);
            } catch (error) {
                console.error('Failed to fetch home page content:', error);
                setHomeContent({ title: 'Error', lead: 'Could not load content.' });
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    if (loading) {
        return <div className="text-center"><p>Loading...</p></div>;
    }
 
    return (
        <div className="text-center">
            <h1 className="display-5">{homeContent.title}</h1>
            <p className="lead">{homeContent.lead}</p>
        </div>
    );
};

export default Home;