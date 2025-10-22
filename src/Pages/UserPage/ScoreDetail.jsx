import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, ListGroup, Button, Alert, Badge, Row, Col, Spinner, ButtonGroup, Nav } from 'react-bootstrap';
import jsPDF from 'jspdf';
import * as api from '../../services/apiServices';
import 'jspdf-autotable';
import { NotoSansTamil } from '../../assets/fonts/NotoSansTamil.js';

const ScoreDetail = ({ currentUser }) => {
    const { scoreId: scoreIdParam } = useParams();
    const scoreId = parseInt(scoreIdParam, 10);
    const [scoreDetail, setScoreDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // New state for local error messages
    const [lang, setLang] = useState('en'); // 'en' or 'ta'
    const [filter, setFilter] = useState('all'); // 'all', 'correct', 'incorrect'
    const navigate = useNavigate();

    // Handle invalid ID immediately
    if (isNaN(scoreId)) {
        return <Alert variant="danger">Invalid score ID. Please select a valid score from your history.</Alert>;
    }

    useEffect(() => {
        if (!currentUser) return;

        const fetchScore = async () => {
            setLoading(true);
            try {
                const data = await api.getScoreDetail(scoreId);
                setScoreDetail(data);
            } catch (error) {
                console.error("Failed to fetch score detail:", error);
                setError('Failed to load score details. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchScore();
    }, [scoreId, currentUser]);

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    const handleDownloadPDF = () => {        
        const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8081/api'}/scores/history/${scoreId}/download?lang=${lang}`;
        window.open(downloadUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="text-center">
                <Spinner animation="border" role="status" variant="primary" />
                <p>Loading score details...</p>
            </div>
        );
    }

    if (!currentUser) {
        return <Alert variant="danger">You must be logged in to view score details.</Alert>;
    }

    if (!scoreDetail) {
        return <Alert variant="warning">No score details found. <Link to="/user/history">Go back to score history.</Link></Alert>;
    }

    return (
        <Card className="shadow-sm">
            <Card.Header as="h4" className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                <div className="mb-2 mb-md-0">
                    <ButtonGroup size="sm" className="me-3">
                        <Button variant={lang === 'en' ? 'primary' : 'outline-primary'} onClick={() => setLang('en')}>EN</Button>
                        <Button variant={lang === 'ta' ? 'primary' : 'outline-primary'} onClick={() => setLang('ta')}>TA</Button>
                    </ButtonGroup>
                    <span>Answer Breakdown</span>
                </div>
                <div className="d-flex">
                    <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)} className="me-2 flex-grow-1">
                        <i className="bi bi-arrow-left-circle-fill me-1"></i> Back
                    </Button>
                    <Button variant="success" size="sm" onClick={handleDownloadPDF}><i className="bi bi-file-earmark-pdf-fill me-1"></i> Download PDF</Button>
                </div>
            </Card.Header>
            <Card.Body>
                <Row className="mb-3 text-center">
                    <Col><strong>Date:</strong> {new Date(scoreDetail.quizDate).toLocaleString()}</Col>
                    <Col><strong>Final Score:</strong> <Badge bg="primary">{scoreDetail.score}</Badge> / <Badge bg="secondary">{scoreDetail.totalQuestions}</Badge></Col>
                </Row>
                <Nav variant="pills" activeKey={filter} onSelect={(k) => setFilter(k)} className="justify-content-center mb-3">
                    <Nav.Item>
                        <Nav.Link eventKey="all">All ({scoreDetail.answeredQuestions.length})</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="correct" className="text-success">Correct ({scoreDetail.answeredQuestions.filter(a => a.isCorrect).length})</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="incorrect" className="text-danger">Incorrect ({scoreDetail.answeredQuestions.filter(a => !a.isCorrect).length})</Nav.Link>
                    </Nav.Item>
                </Nav>
                <ListGroup variant="flush">
                    {scoreDetail.answeredQuestions
                        .filter(answer => {
                            if (filter === 'correct') return answer.isCorrect;
                            if (filter === 'incorrect') return !answer.isCorrect;
                            return true; // 'all'
                        }).map((answer, index) => (
                        <ListGroup.Item key={index} className={answer.isCorrect ? 'border-success' : 'border-danger'}>
                            <strong>Q{index + 1}: {answer[`questionText_${lang}`] || answer.questionText_en}</strong>
                            {answer.isCorrect ? (
                                <p className="mb-0 text-success">Your answer: {lang === 'ta' ? answer.userAnswer_ta : answer.userAnswer} <i className="bi bi-check-circle-fill"></i></p>
                            ) : (
                                <>
                                    <p className="mb-0 text-danger">Your answer: {lang === 'ta' ? answer.userAnswer_ta : answer.userAnswer} <i className="bi bi-x-circle-fill"></i></p>
                                    <p className="mb-0 text-info">Correct answer: {answer[`correctAnswer_${lang}`] || answer.correctAnswer_en}</p>
                                </>
                            )}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card.Body>
        </Card>
    );
};

export default ScoreDetail;