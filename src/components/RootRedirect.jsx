import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import * as api from '../services/apiServices';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

function RootRedirect() {
    const { loading: authLoading } = useAuth(); // Get auth loading state
    const [isSetupComplete, setIsSetupComplete] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        // CRITICAL FIX: Do not check setup status until the auth context is ready.
        if (authLoading) return;

        const checkStatus = async () => {
            try {
                const { isSetupComplete } = await api.checkSetupStatus();
                setIsSetupComplete(isSetupComplete);
            } catch (err) {
                console.error("Failed to check setup status:", err);
                setError(true); // Fallback to admin login on error
            }
        };
        checkStatus();
    }, [authLoading]); // Re-run when auth loading state changes.

    if (error) {
        // If the API call fails, provide a clear error message and a manual link.
        // This prevents confusion and provides a clear next step.
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                <h3 className="text-danger">Failed to check application status.</h3>
                <p>Please ensure the backend server is running. If this is the first time running the app, <a href="/admin/setup">proceed to setup</a>.</p>
            </div>
        );
    }

    // CRITICAL FIX: Wait for both auth loading and setup status check to complete.
    if (authLoading || isSetupComplete === null) {
        return <div className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" /></div>;
    }

    // If setup is complete, redirect to the user login page. This makes it the
    // default entry point for regular users.
    // If setup is NOT complete, the only available page should be the admin setup.
    return isSetupComplete ? <Navigate to="/admin/login" replace /> : <Navigate to="/admin/setup" replace />;
}

export default RootRedirect;