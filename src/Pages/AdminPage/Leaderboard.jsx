import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { getLeaderboard } from '../../services/apiServices';
import { toast } from 'react-toastify';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const data = await getLeaderboard();
                setLeaderboard(data);
                setError(null);
            } catch (err) {
                setError('Failed to load leaderboard data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const handleDownloadPPT = () => {
        // This function now simply points the browser to the backend endpoint.
        // The backend is responsible for generating and serving the PPT file.
        const downloadUrl = `${import.meta.env.VITE_API_URL}/scores/leaderboard/ppt`;
        
        // To trigger the download, we can open the URL in a new tab or use a hidden link.
        window.open(downloadUrl, '_blank');
        toast.info("Your download will begin shortly...");
    };

    if (loading) {
        return <div className="text-center"><Spinner animation="border" /> Loading Leaderboard...</div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <Card>
            <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                    <h4>Top 5 Leaderboard</h4>
                    <Button variant="primary" onClick={handleDownloadPPT} disabled={leaderboard.length === 0}>
                        <i className="bi bi-download me-2"></i>Download as PPT
                    </Button>
                </div>
            </Card.Header>
            <Card.Body>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Username</th>
                            <th>Total Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.length > 0 ? (
                            leaderboard.map((user, index) => (
                                <tr key={user.username}>
                                    <td>{index + 1}</td>
                                    <td>{user.username}</td>
                                    <td>{user.totalScore}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="text-center">No scores recorded yet.</td></tr>
                        )}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default Leaderboard;