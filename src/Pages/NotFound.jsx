import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => { // Corrected casing
    return (
        <div>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist. <Link to="/">Go to Home</Link></p>
        </div>
    );
};

export default NotFound;