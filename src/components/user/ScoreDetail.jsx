import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Table, Spinner, Alert, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices'; // CRITICAL FIX: Import the api service

const ScoreDetail = ({ currentUser }) => {
    const { id } = useParams();
    const [scoreDetail, setScoreDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lang, setLang] = useState('en');

    const fetchScore = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getScoreDetail(id);
            setScoreDetail(data);
        } catch (err) {
            setError('Failed to fetch score detail.');
            // Toast is already handled by apiServices
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchScore();
    }, [fetchScore]);

    const handleDownloadPdf = () => {
        window.open(`${import.meta.env.VITE_API_URL}/scores/history/${id}/download?lang=${lang}`, '_blank');
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <Spinner animation="border" />
            </div>
        );
    }

    if (error || !scoreDetail) {
        return <Alert variant="danger">{error || 'Score details could not be loaded.'}</Alert>;
    }

    const { quizDate, score, answeredQuestions } = scoreDetail;

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h3>Quiz Result</h3>
                <div>
                    <Button variant="secondary" size="sm" onClick={() => setLang(l => l === 'en' ? 'ta' : 'en')} className="me-2">
                        {lang === 'en' ? 'தமிழ்' : 'English'}
                    </Button>
                    <Button variant="danger" size="sm" onClick={handleDownloadPdf}>
                        <i className="bi bi-file-earmark-pdf-fill me-2"></i>Download PDF
                    </Button>
                </div>
            </Card.Header>
            <Card.Body>
                <p><strong>Date:</strong> {new Date(quizDate).toLocaleString()}</p>
                <p><strong>Final Score:</strong> {score} / {answeredQuestions.length}</p>
                <hr />
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Question</th>
                            <th>Your Answer</th>
                            <th>Correct Answer</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {answeredQuestions.map((q, index) => (
                            <tr key={q.questionId}>
                                <td>{index + 1}</td>
                                <td>{lang === 'en' ? q.questionText : q.questionText_ta}</td>
                                <td className={q.isCorrect ? '' : 'text-danger'}>{q.userAnswer}</td>
                                <td>{q.correctAnswer}</td>
                                <td>
                                    {q.isCorrect ? (
                                        <span className="text-success fw-bold">Correct</span>
                                    ) : (
                                        <span className="text-danger fw-bold">Incorrect</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Link to="/user/history" className="btn btn-primary">Back to History</Link>
            </Card.Body>
        </Card>
    );
};

export default ScoreDetail;