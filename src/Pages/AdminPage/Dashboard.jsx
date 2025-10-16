import React, { useState, useEffect } from 'react';
import { Card, Col, Row, InputGroup, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getDashboardStats } from '../../services/apiServices';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        publishedQuestions: 0,
        // Add other stats as your backend provides them
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                // The apiService already shows a toast
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const userQuizLink = `${window.location.origin}/user/login`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(userQuizLink).then(() => {
            toast.info('Quiz link copied to clipboard!');
        });
    };

    return (
        <div>
            <h2 className="mb-4">Admin Dashboard</h2>

            {stats.publishedQuestions > 0 ? (
                <Row className="mb-4">
                    <Col>
                        <Card className="shadow-sm bg-body-tertiary border-primary">
                            <Card.Header as="h5" className="bg-primary text-white"><i className="bi bi-link-45deg me-2"></i>User Quiz Link</Card.Header>
                            <Card.Body>
                                <p>Share this permanent link with users to log in and access the quiz. It is now active because you have published questions.</p>
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
                        <Card className="shadow-sm bg-body-tertiary">
                            <Card.Header as="h5" className="text-muted"><i className="bi bi-link-45deg me-2"></i>User Quiz Link</Card.Header>
                            <Card.Body>
                                <p className="text-muted ">The permanent link for users to take the quiz will be available here once you publish your first question.</p>
                                <p className="text-muted mb-0">Go to the <Link to="/admin/publish">Publish Queue</Link> to get started.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            <Row>
                <Col md={4} className="mb-3 mb-md-0">
                    <Card className="text-center shadow-sm mb-3">
                        <Card.Body>
                            <Card.Title>Total Registered Users</Card.Title>
                            <Card.Text className="fs-1 fw-bold">{isLoading ? '...' : stats.totalUsers}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-3 mb-md-0">
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <Card.Title><i className="bi bi-cloud-check-fill me-2"></i>Published Questions</Card.Title>
                            <Card.Text className="fs-1 fw-bold">{isLoading ? '...' : stats.publishedQuestions}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;