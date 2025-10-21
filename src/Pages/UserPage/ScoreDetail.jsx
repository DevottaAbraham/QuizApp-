import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, ListGroup, Button, Alert, Badge, Row, Col, Spinner, ButtonGroup } from 'react-bootstrap';
import jsPDF from 'jspdf';
// import * as api from '../../services/apiServices';
import 'jspdf-autotable';

const ScoreDetail = ({ currentUser }) => {
    const { id } = useParams(); // Correctly get 'id' from the route '/user/score/:id'
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lang, setLang] = useState('en'); // 'en' or 'ta'
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) return;

        const fetchScore = async () => {
            setLoading(true);
            try {
                const scoreData = await api.getScoreDetail(id);
                setResult(scoreData);
            } catch (error) {
                console.error("Failed to fetch score detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchScore();
    }, [id, currentUser]);

    const handleDownloadPDF = () => {
        if (!result) return;

        const doc = new jsPDF();
        doc.text(`Quiz Result for ${currentUser.username}`, 14, 20);
        doc.text(`Score: ${result.score} / ${result.totalQuestions}`, 14, 30);
        doc.text(`Date: ${new Date(result.quizTimestamp).toLocaleString()}`, 14, 40);

        const tableColumn = ["#", "Question", "Your Answer", "Correct Answer", "Result"];
        const tableRows = [];

        result.answers.forEach((answer, index) => {
            const rowData = [
                index + 1,
                answer.questionText_en, // Default to English for PDF
                answer.userAnswer,      // Default to English for PDF
                answer.correctAnswer,   // Default to English for PDF
                answer.isCorrect ? "Correct" : "Wrong",
            ];
            tableRows.push(rowData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50,
        });

        doc.save(`quiz-result-${currentUser.username}-${id}.pdf`);
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

    if (!result) {
        return <Alert variant="warning">Could not find the specified quiz result. <Link to="/user/score">Go back to score history.</Link></Alert>;
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
                    <Col><strong>Date:</strong> {new Date(result.quizTimestamp).toLocaleString()}</Col>
                    <Col><strong>Final Score:</strong> <Badge bg="primary">{result.score}</Badge> / <Badge bg="secondary">{result.totalQuestions}</Badge></Col>
                </Row>
                <ListGroup variant="flush">
                    {result.answers.map((answer, index) => (
                        <ListGroup.Item key={index} className={answer.isCorrect ? 'border-success' : 'border-danger'}>
                            <strong>Q{index + 1}: {answer[`questionText_${lang}`] || answer.questionText_en}</strong>
                            {answer.isCorrect ? (
                                <p className="mb-0 text-success">Your answer: {lang === 'ta' ? answer.userAnswer_ta : answer.userAnswer} <i className="bi bi-check-circle-fill"></i></p>
                            ) : (
                                <>
                                    <p className="mb-0 text-danger">Your answer: {lang === 'ta' ? answer.userAnswer_ta : answer.userAnswer} <i className="bi bi-x-circle-fill"></i></p>
                                    <p className="mb-0 text-info">Correct answer: {answer[`correctAnswer_${lang}`] || answer.correctAnswer}</p>
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