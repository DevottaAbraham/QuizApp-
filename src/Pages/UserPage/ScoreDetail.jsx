import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Card, Spinner, Alert, ListGroup, Badge, Button } from 'react-bootstrap';
import { getScoreDetail } from '../../services/apiServices';

const ScoreDetail = () => {
    const { scoreId } = useParams();
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter'); // 'correct' or 'wrong'

    const [scoreData, setScoreData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const data = await getScoreDetail(scoreId);
                setScoreData(data);
                setError(null);
            } catch (err) {
                setError('Failed to load score details. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [scoreId]);

    const handleDownload = (lang) => {
        const downloadUrl = `${import.meta.env.VITE_API_URL}/scores/history/${scoreId}/download?lang=${lang}`;
        window.open(downloadUrl, '_blank');
    };

    const filteredAnswers = scoreData?.answeredQuestions.filter(q => {
        if (filter === 'correct') return q.isCorrect;
        if (filter === 'wrong') return !q.isCorrect;
        return true; // No filter, show all
    });

    if (loading) {
        return <div className="text-center"><Spinner animation="border" /> Loading Score Details...</div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!scoreData) {
        return <Alert variant="info">No score data found.</Alert>;
    }

    const correctCount = scoreData.answeredQuestions.filter(q => q.isCorrect).length;
    const wrongCount = scoreData.answeredQuestions.length - correctCount;

    return (
        <Card>
            <Card.Header>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div className="mb-3 mb-md-0">
                        <h4>Quiz Result from {scoreData.quizDate}</h4>
                        <p className="mb-0">Your Score: {scoreData.score} / {scoreData.totalQuestions}</p>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                        {/* CRITICAL FIX: Links use the current path and only change the query parameter */}
                        <Link to="?filter=correct" className="btn btn-success me-2">Correctly Answered ({correctCount})</Link>
                        <Link to="?filter=wrong" className="btn btn-danger me-2">Wrongly Answered ({wrongCount})</Link>
                        <Link to="?" className="btn btn-secondary">Show All</Link>
                        <Button variant="primary" className="me-2" onClick={() => handleDownload('en')}>Download (English)</Button>
                        <Button variant="info" onClick={() => handleDownload('ta')}>Download (Tamil)</Button>
                    </div>
                </div>
            </Card.Header>
            <Card.Body>
                <ListGroup variant="flush">
                    {filteredAnswers.map((item, index) => (
                        <ListGroup.Item key={item.questionId} className={item.isCorrect ? 'border-success' : 'border-danger'}>
                            <div className="fw-bold mb-2">{index + 1}. {item.questionText_en}</div>
                            <div className="fw-bold mb-2">{item.questionText_ta}</div>
                            {item.isCorrect ? (
                                <p className="text-success">
                                    Your Answer: {item.userAnswer} <Badge bg="success">Correct</Badge>
                                </p>
                            ) : (
                                <>
                                    <p className="text-danger">
                                        Your Answer: {item.userAnswer} <Badge bg="danger">Wrong</Badge>
                                    </p>
                                    <p className="text-success">
                                        Correct Answer: {item.correctAnswer}
                                    </p>
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