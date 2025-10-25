import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Spinner, Alert } from 'react-bootstrap';
import pptxgen from "pptxgenjs";
import { getLeaderboard } from '../../services/apiServices';

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getLeaderboard()
            .then(data => {
                setLeaderboardData(data);
            })
            .catch(err => {
                setError('Failed to load leaderboard data.');
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleDownloadPPT = () => {
        let pptx = new pptxgen();
        let slide = pptx.addSlide();

        // Updated title text and color as per user request
        slide.addText("Top 5 Scores in Todays Quiz", { x: 1, y: 1, fontSize: 32, bold: true, color: "FFD700" });
        
        // Updated table structure to Rank, Name, and Score with better column spacing.
        // Every cell is an object with a `text` property to avoid TypeErrors.
        const tableData = [
            [
                { text: "Rank", options: { bold: true, align: 'center' } }, 
                { text: "Name", options: { bold: true } }, 
                { text: "Score", options: { bold: true, align: 'center' } }
            ],
            ...leaderboardData.map((entry, index) => [
                { text: index + 1, options: { align: 'center' } },
                { text: entry.username },
                { text: entry.totalScore, options: { align: 'center' } }
            ])
        ];

        // Added colW for better spacing and adjusted table position.
        slide.addTable(tableData, { x: 1, y: 2, w: 8, rowH: 0.5, colW: [1, 5, 2] });

        pptx.writeFile({ fileName: "leaderboard.pptx" });
    };

    if (loading) {
        return <div className="text-center"><Spinner animation="border" /></div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <Card className="shadow-sm">
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                Leaderboard
                <Button variant="warning" size="sm" onClick={handleDownloadPPT} disabled={leaderboardData.length === 0}>
                    <i className="bi bi-file-earmark-ppt-fill me-1"></i> Download PPT
                </Button>
            </Card.Header>
            <Card.Body>
                {leaderboardData.length > 0 ? (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th className="text-center">Rank</th>
                                <th>Name</th>
                                <th className="text-center">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboardData.map((entry, index) => ( <tr key={entry.username}><td className="text-center">{index + 1}</td><td>{entry.username}</td><td className="text-center">{entry.totalScore}</td></tr>))}
                        </tbody>
                    </Table>
                ) : (
                    <p className="text-center text-muted">No scores available for the leaderboard yet.</p>
                )}
            </Card.Body>
        </Card>
    );
};

export default Leaderboard;