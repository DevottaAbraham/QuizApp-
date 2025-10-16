import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Spinner, Alert } from 'react-bootstrap';
import pptxgen from "pptxgenjs";
import * as api from '../../services/apiServices';

const Leaderboard = () => {
    const [sortedScores, setSortedScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                setError('');
                const leaderboardData = await api.getLeaderboard();
                setSortedScores(leaderboardData);
            } catch (err) {
                setError('Failed to load leaderboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const handleDownloadPPT = () => {
        let pptx = new pptxgen();
        let slide = pptx.addSlide();

        slide.addText("Quiz Leaderboard", { x: 1, y: 1, fontSize: 24, bold: true, color: "363636" });

        const tableData = [
            [{ text: "Rank", options: { bold: true } }, { text: "Username", options: { bold: true } }, { text: "Score", options: { bold: true } }],
            ...sortedScores.map((user, index) => [index + 1, user.username, user.score])
        ];

        slide.addTable(tableData, { x: 1, y: 2, w: 8, rowH: 0.5 });

        pptx.writeFile({ fileName: "leaderboard.pptx" });
    };

    return (
        <Card className="shadow-sm">
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                Leaderboard
                <Button variant="warning" size="sm" onClick={handleDownloadPPT} disabled={sortedScores.length === 0}>
                    <i className="bi bi-file-earmark-ppt-fill me-1"></i> Download PPT
                </Button>
            </Card.Header>
            <Card.Body>
                {loading ? (
                    <div className="text-center"><Spinner animation="border" /></div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Username</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedScores.map((user, index) => (
                                <tr key={user.username}><td>{index + 1}</td><td>{user.username}</td><td>{user.score}</td></tr>
                            ))}
                        </tbody>
                    </Table>
                )}
                {!loading && !error && sortedScores.length === 0 && <Alert variant="info">The leaderboard is empty.</Alert>}
            </Card.Body>
        </Card>
    );
};

export default Leaderboard;