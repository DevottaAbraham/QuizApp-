import React from 'react';
import { Card, Table, Button } from 'react-bootstrap';
import pptxgen from "pptxgenjs";

const Leaderboard = () => {
    // Fetch all users to get their IDs and usernames
    const allUsers = JSON.parse(localStorage.getItem("quizUsers")) || [];
    const allScores = allUsers.map(user => {
        const result = JSON.parse(localStorage.getItem(`quizResult_${user.userId}`));
        if (result) {
            return {
                userId: user.userId,
                username: user.username,
                score: result.score,
            };
        }
        return null;
    }).filter(Boolean); // Filter out users with no scores
    
    const sortedScores = allScores.sort((a, b) => b.score - a.score);

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