import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { checkSetupStatus } from '../services/apiServices';
import { useAuth } from '../contexts/AuthContext';

function RootRedirect() {
    const { loading: authLoading, user } = useAuth(); // Get auth loading state and user
    const [isSetupComplete, setIsSetupComplete] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Do not check setup status until the auth context has finished loading.
        if (authLoading) return;

        const checkStatus = async () => {
            try {
                const data = await checkSetupStatus();
                setIsSetupComplete(data.isSetupComplete);
            } catch (err) {
                console.error("Failed to check setup status:", err);
                setError(true);
            }
        };
        checkStatus();
    }, [authLoading]); // Re-run when auth loading state changes.

    if (error) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                <h3 className="text-danger">Failed to check application status.</h3>
                <p>Please ensure the backend server is running. If this is the first time running the app, <Link to="/admin/setup">proceed to setup</Link>.</p>
            </div>
        );
    }

    if (authLoading || isSetupComplete === null) {
        return <div className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" /></div>;
    }

    // If setup is complete, redirect to the user login page. This makes it the
    // default entry point for regular users.
    // If setup is NOT complete, the only available page should be the admin setup.
    if (isSetupComplete) {
        // If setup is done, go to the main user login page.
        return <Navigate to="/user/login" replace />;
    } else {
        // If setup is NOT done, the only place to go is the admin setup page.
        return <Navigate to="/admin/setup" replace />;
    }
}

export default RootRedirect;