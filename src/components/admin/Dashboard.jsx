import React from 'react';
import { Card, Col, Row, InputGroup, Button, Form, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * A presentational component that displays dashboard statistics and the user quiz link.
 * It receives all data and handlers as props.
 * @param {object} props
 * @param {boolean} props.isLoading - Whether the data is currently loading.
 * @param {object} props.stats - The dashboard statistics object.
 * @param {string} props.userQuizLink - The URL for the user quiz.
 * @param {function} props.onCopyLink - The function to call when the copy link button is clicked.
 */
const Dashboard = ({ isLoading, stats, userQuizLink, onCopyLink }) => {
    const userQuizLink = `${window.location.origin}/user/login`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(userQuizLink).then(() => {
            toast.info('Quiz link copied to clipboard!');
        });
    };

    if (isLoading) {
        return (
            <div className="text-center p-5">
                <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>
            </div>
        );
    }
    return (
        <div>
            <h2 className="mb-4">Admin Dashboard</h2>

            {/* The User Quiz Link card is now prominently displayed at the top when available. */}
            {stats && stats.publishedQuestions > 0 ? (
                <Row className="mb-4">
                    <Col>
                        <Card className="shadow-sm bg-body-tertiary border-primary">
                            <Card.Header as="h5" className="bg-primary text-white"><i className="bi bi-link-45deg me-2"></i>User Quiz Link</Card.Header>
                            <Card.Body>
                                <p>Share this permanent link with users to log in and access the quiz. It is now active because you have published questions.</p>
                                <InputGroup>
                                    <Form.Control readOnly value={userQuizLink} onCopy={onCopyLink} />
                                    <Button variant="primary" onClick={onCopyLink}><i className="bi bi-clipboard-check-fill me-1"></i> Copy Link</Button>
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
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <Card.Title>Total Registered Users</Card.Title>
                            <Card.Text className="fs-1 fw-bold">{stats.totalUsers}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-3 mb-md-0">
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <Card.Title><i className="bi bi-journal-check me-2"></i>Total Questions</Card.Title>
                            <Card.Text className="fs-1 fw-bold">{stats.totalQuestions}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-3 mb-md-0">
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <Card.Title><i className="bi bi-cloud-check-fill me-2"></i>Published Questions</Card.Title>
                            <Card.Text className="fs-1 fw-bold">{stats.publishedQuestions}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;