import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge } from 'react-bootstrap';
import pptxgen from "pptxgenjs";

const Leaderboard = () => {
    const [sortedScores, setSortedScores] = useState([]);

    useEffect(() => {
        const calculateScores = () => {
            const allUsers = JSON.parse(localStorage.getItem("quizUsers")) || [];
            const allScores = allUsers.map(user => {
                const history = JSON.parse(localStorage.getItem(`quizHistory_${user.userId}`)) || [];
                if (history.length === 0) return null;

                // Find the best score from the user's history
                const scores = history.map(h => h.score).filter(s => typeof s === 'number');
                if (scores.length === 0) return null;

                const bestScore = Math.max(...scores);
                return {
                    userId: user.userId, username: user.username, score: bestScore
                };
            }).filter(Boolean);

            setSortedScores(allScores.sort((a, b) => b.score - a.score));
        };

        calculateScores();

        window.addEventListener('storageUpdated', calculateScores);

        return () => {
            window.removeEventListener('storageUpdated', calculateScores);
        };
    }, []);

    const handleDownloadPPT = () => {
        let pptx = new pptxgen();
        let slide = pptx.addSlide();

        slide.addText("Quiz Leaderboard", { x: 1, y: 1, fontSize: 24, bold: true, color: "363636" });

        const tableData = [
            [{ text: "Rank", options: { bold: true } }, { text: "User ID", options: { bold: true } }, { text: "Username", options: { bold: true } }, { text: "Score", options: { bold: true } }],
            ...sortedScores.map((user, index) => [index + 1, user.userId, user.username, user.score])
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
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>User ID</th>
                            <th>Username</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedScores.map((user, index) => (
                            <tr key={user.userId}><td>{index + 1}</td><td><code>{user.userId}</code></td><td>{user.username}</td><td>{user.score}</td></tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default Leaderboard;