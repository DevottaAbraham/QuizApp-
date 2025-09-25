import React, { useState, useEffect } from 'react';
import { Card, Col, Row, ListGroup, InputGroup, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const [stats, setStats] = useState({
        activeUsers: [],
        totalUsers: [],
        publishedQuestions: [],
        topRanker: null,
    });

    useEffect(() => {
        const updateStats = (e) => {
            const activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || [];
            const totalUsers = JSON.parse(localStorage.getItem("quizUsers")) || [];
            const allQuestions = JSON.parse(localStorage.getItem("quizQuestions")) || [];
            const publishedQuestions = allQuestions.filter(q => q.status === 'published');

            const allScores = totalUsers.map(user => {
                const history = JSON.parse(localStorage.getItem(`quizHistory_${user.userId}`)) || [];
                if (history.length === 0) return null;
                const bestScore = Math.max(...history.map(h => h.score));
                return { username: user.username, score: bestScore };
            }).filter(Boolean);

            const topRanker = allScores.length > 0
                ? allScores.sort((a, b) => b.score - a.score)[0]
                : null;

            setStats({ activeUsers, totalUsers, publishedQuestions, topRanker });
        };
        updateStats(); // Initial load

        // Listen for custom event that signals a storage change
        window.addEventListener('storageUpdated', updateStats);

        return () => {
            // Cleanup the event listener
            window.removeEventListener('storageUpdated', updateStats);
        };
    }, []);

    const userQuizLink = `${window.location.origin}/user/`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(userQuizLink).then(() => {
            toast.success('Quiz link copied to clipboard!');
        });
    };

    return (
        <div>
            <h2 className="mb-4">Admin Dashboard</h2>

            {/* The User Quiz Link card is now prominently displayed at the top when available. */}
            {stats.publishedQuestions.length > 0 ? (
                <Row className="mb-4">
                    <Col>
                        <Card className="shadow-sm bg-light border-primary">
                            <Card.Header as="h5" className="bg-primary text-white"><i className="bi bi-link-45deg me-2"></i>User Quiz Link</Card.Header>
                            <Card.Body>
                                <p>Share this permanent link with users to access the quiz. It is now active because you have published questions.</p>
                                <InputGroup>
                                    <Form.Control readOnly value={userQuizLink} />
                                    <Button variant="outline-primary" onClick={handleCopyLink}><i className="bi bi-clipboard-check-fill me-1"></i> Copy Link</Button>
                                </InputGroup>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            ) : (
                <Row className="mb-4">
                    <Col>
                        <Card className="shadow-sm bg-light">
                            <Card.Header as="h5" className="text-muted"><i className="bi bi-link-45deg me-2"></i>User Quiz Link</Card.Header>
                            <Card.Body>
                                <p className="text-muted">The permanent link for users to take the quiz will be available here once you publish your first question.</p>
                                <p className="text-muted mb-0">Go to the <Link to="/admin/publish">Publish Queue</Link> to get started.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            <Row>
                <Col md={4}>
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <Card.Title><i className="bi bi-person-check-fill me-2"></i>Active Users</Card.Title>
                            <Card.Text className="fs-1 fw-bold">{stats.activeUsers.length}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center shadow-sm mb-3">
                        <Card.Body>
                            <Card.Title>Total Registered Users</Card.Title>
                            <Card.Text className="fs-1 fw-bold">{stats.totalUsers.length}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <Card.Title><i className="bi bi-patch-question-fill me-2"></i>Published Questions</Card.Title>
                            <Card.Text className="fs-1 fw-bold">{stats.publishedQuestions.length}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col md={8}>
                    <Card className="shadow-sm">
                        <Card.Header as="h5">Active User List</Card.Header>
                        <ListGroup variant="flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {stats.activeUsers.length > 0 ? stats.activeUsers.map(user => (
                                <ListGroup.Item key={user.userId}>{user.username}</ListGroup.Item>
                            )) : (
                                <ListGroup.Item>No users are currently active.</ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center shadow-sm h-100">
                        <Card.Header as="h5"><i className="bi bi-trophy-fill me-2"></i>Leaderboard</Card.Header>
                        <Card.Body className="d-flex flex-column justify-content-center">
                            {stats.topRanker ? (
                                <>
                                    <Card.Title className="fs-4">{stats.topRanker.username}</Card.Title>
                                    <Card.Text>Score: <span className="fs-2 fw-bold">{stats.topRanker.score}</span></Card.Text>
                                </>
                            ) : <p className="text-muted">No scores recorded yet.</p>}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;