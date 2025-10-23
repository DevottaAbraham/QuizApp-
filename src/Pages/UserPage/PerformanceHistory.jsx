import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Row, Col, Form, Badge, Alert, ButtonGroup, Table, Modal, Nav } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';


const translations = {
    en: {
        title: "My Performance History",
        download: "Download PDF",
        fromDate: "From Date",
        toDate: "To Date",
        reset: "Reset",
        quizOn: "Quiz on:",
        score: "Score:",
        noQuizzes: "You have not taken any quizzes yet.",
        noResults: "No results found for the selected date range.",
        pdfTitle: (username) => `Quiz Performance History for ${username}`,
        correctAnswers: "Correctly Answered",
        wrongAnswers: "Wrongly Answered",
        viewDetails: "View Details",
        downloadPDF: "Download PDF",
        english: "English",
        tamil: "Tamil",
    },
    ta: {
        title: "எனது செயல்திறன் வரலாறு",
        download: "PDF பதிவிறக்கம்",
        fromDate: "தொடக்க தேதி",
        toDate: "இறுதி தேதி",
        reset: "மீட்டமை",
        quizOn: "தேர்வு:",
        score: "மதிப்பெண்:",
        noQuizzes: "நீங்கள் இன்னும் எந்த வினாடி வினாவையும் எடுக்கவில்லை.",
        noResults: "தேர்ந்தெடுக்கப்பட்ட தேதி வரம்பிற்கு முடிவுகள் எதுவும் கிடைக்கவில்லை.",
        pdfTitle: (username) => `${username}க்கான வினாடி வினா செயல்திறன் வரலாறு`,
        correctAnswers: "சரியாக பதிலளித்தவை",
        wrongAnswers: "தவறாக பதிலளித்தவை",
        viewDetails: "விவரங்களைக் காண்க",
        downloadPDF: "PDF பதிவிறக்கம்",
        english: "ஆங்கிலம்",
        tamil: "தமிழ்",
    }
};

const PerformanceHistory = ({ currentUser }) => {
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [lang, setLang] = useState('en');
    const [showModal, setShowModal] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);

    const t = translations[lang];

    useEffect(() => {
        if (!currentUser) return;
        const loadHistory = async () => {
            try {
                const userHistory = await api.getScoreHistory();
                // Sort by date descending to show the latest first
                const sortedHistory = userHistory.sort((a, b) => new Date(b.quizDate) - new Date(a.quizDate));
                setHistory(sortedHistory);
            } catch (error) {
                console.error("Failed to fetch performance history:", error);
                toast.error("Could not load your score history.");
            }
        };

        loadHistory(); // Initial load
        
        // Listen for the custom event dispatched when a quiz is finished
        window.addEventListener('storageUpdated', loadHistory);

        return () => window.removeEventListener('storageUpdated', loadHistory);
    }, [currentUser]);

    useEffect(() => {
        let result = history;
        if (startDate) {
            result = result.filter(item => new Date(item.quizDate) >= new Date(startDate));
        }
        if (endDate) {
            // Add 1 day to endDate to include the whole day
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            result = result.filter(item => new Date(item.quizDate) < end);
        }
        setFilteredHistory(result);
    }, [startDate, endDate, history]);

    const handleViewAnswersClick = async (result) => {
        setSelectedResult(result);
        setShowModal(true);
        // If the result doesn't have detailed answers, fetch them.
        if (!result.answeredQuestions) {
            setLoadingModal(true);
            try {
                const detailedResult = await api.getScoreDetail(result.quizId);
                // Update the state for the modal
                setSelectedResult(detailedResult);
                // Also update the main history array so we don't fetch it again
                setHistory(prev => prev.map(h => h.quizId === result.quizId ? detailedResult : h));
            } catch (error) {
                toast.error("Failed to load answer details.");
                setShowModal(false);
            } finally {
                setLoadingModal(false);
            }
        }
    };

    const handleDownloadPDF = (pdfLang) => {
        if (!selectedResult) return;
        const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8081/api'}/scores/history/${selectedResult.quizId}/download?lang=${pdfLang}`;
        window.open(downloadUrl, '_blank');
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const locale = lang === 'ta' ? 'ta-IN' : 'en-US';
        return new Date(dateString).toLocaleString(locale, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    if (!currentUser) {
        return <Alert variant="danger">You must be logged in to view your performance history.</Alert>;
    }

    return (
        <Card className="shadow-sm">
            <Card.Header as="h5" className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                <span className="mb-2 mb-md-0">{t.title}</span>
                <div className="d-flex">
                    <ButtonGroup size="sm" className="me-2">
                        <Button variant={lang === 'en' ? 'primary' : 'outline-primary'} onClick={() => setLang('en')}>EN</Button>
                        <Button variant={lang === 'ta' ? 'primary' : 'outline-primary'} onClick={() => setLang('ta')}>TA</Button>
                    </ButtonGroup>
                </div>
            </Card.Header>
            <Card.Body>
                <Form as={Row} className="mb-4 align-items-end g-2">
                    <Col md={5} sm={6}>
                        <Form.Group controlId="startDate">
                            <Form.Label>{t.fromDate}</Form.Label>
                            <Form.Control type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </Form.Group>
                    </Col>
                    <Col md={5} sm={6}>
                        <Form.Group controlId="endDate">
                            <Form.Label>{t.toDate}</Form.Label>
                            <Form.Control type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </Form.Group>
                    </Col>
                    <Col md={2} sm={12} className="d-grid">
                         <Button variant="outline-secondary" onClick={() => { setStartDate(''); setEndDate(''); }}>{t.reset}</Button>
                    </Col>
                </Form>

                {filteredHistory.length > 0 ? (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>{t.quizOn}</th>
                                <th>{t.score}</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.map((result, index) => (
                                <tr key={index}>
                                    <td>{formatDateTime(result.quizDate)}</td>
                                    <td><Badge bg="primary">{result.score}</Badge> / <Badge bg="secondary">{result.totalQuestions}</Badge></td>
                                    <td className="text-center">
                                        <Button onClick={() => handleViewAnswersClick(result)} variant="info" size="sm">
                                            <i className="bi bi-search me-1"></i> {t.viewDetails}
                                        </Button>
                                    </td> 
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <Alert variant="info" className="text-center">
                        {history.length === 0 ? t.noQuizzes : t.noResults}
                    </Alert>
                )}
            </Card.Body>

            {selectedResult && (
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" fullscreen="md-down" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{t.viewDetails}: {formatDateTime(selectedResult.quizDate)}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {loadingModal ? (
                            <div className="text-center">Loading details...</div>
                        ) : (
                            <>
                                <Nav variant="pills" className="justify-content-center mb-3">
                                    <Nav.Item>
                                        <Nav.Link as={Link} to={`/user/score/${selectedResult.quizId}?filter=correct`} target="_blank" rel="noopener noreferrer" className="text-success">
                                            {t.correctAnswers} ({selectedResult.score})
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link as={Link} to={`/user/score/${selectedResult.quizId}?filter=incorrect`} target="_blank" rel="noopener noreferrer" className="text-danger">
                                            {t.wrongAnswers} ({selectedResult.totalQuestions - selectedResult.score})
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                                <hr />
                                <h5 className="text-center mb-3">{t.downloadPDF}</h5>
                                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                                    <Button variant="outline-success" onClick={() => handleDownloadPDF('en')}>
                                        <i className="bi bi-file-earmark-pdf me-1"></i> {t.english}
                                    </Button>
                                    <Button variant="outline-success" onClick={() => handleDownloadPDF('ta')}>
                                        <i className="bi bi-file-earmark-pdf me-1"></i> {t.tamil}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Modal.Body>
                </Modal>
            )}
        </Card>
    );
};

export default PerformanceHistory;