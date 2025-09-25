import React from 'react';

const Home = () => {
    const defaultContent = { title: 'Welcome to the Bible Quiz!', lead: 'Test your knowledge and grow in faith.' };
    let homeContent = defaultContent;
 
    try {
        const savedContent = localStorage.getItem('userHomePageContent');
        if (savedContent) homeContent = JSON.parse(savedContent);
    } catch (error) {
        console.error('Could not parse userHomePageContent from localStorage:', error);
    }
 
    return (
        <div className="text-center">
            <h1 className="display-5">{homeContent.title}</h1>
            <p className="lead">{homeContent.lead}</p>
        </div>
    );
};

export default Home;