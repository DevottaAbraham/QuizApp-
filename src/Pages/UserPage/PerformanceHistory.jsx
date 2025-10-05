import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Row, Col, Form, Badge, Alert, ButtonGroup, Table, Modal } from 'react-bootstrap';
import jsPDF from 'jspdf'; 
import 'jspdf-autotable';
import { NotoSansTamil } from '../../assets/fonts/NotoSansTamil.js';


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
        pdfHeaders: ['#', 'Date', 'Score'],
        correctAnswers: "Correctly Answered",
        wrongAnswers: "Wrongly Answered",
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
        pdfHeaders: ['#', 'தேதி', 'மதிப்பெண்'],
        correctAnswers: "சரியாக பதிலளித்தவை",
        wrongAnswers: "தவறாக பதிலளித்தவை",
    }
};

const PerformanceHistory = ({ currentUser }) => {
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [lang, setLang] = useState('en');
    const [showModal, setShowModal] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);

    const t = translations[lang];

    useEffect(() => {
        if (!currentUser) return;
        const loadHistory = () => {
            const userHistory = []; // TODO: Replace with an API call to fetch history
            // Sort by date descending to show the latest first
            const sortedHistory = userHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
            setHistory(sortedHistory);
        };

        loadHistory(); // Initial load

        // Listen for the custom event dispatched when a quiz is finished
        window.addEventListener('storageUpdated', loadHistory);

        return () => window.removeEventListener('storageUpdated', loadHistory);
    }, [currentUser]);

    useEffect(() => {
        let result = history;
        if (startDate) {
            result = result.filter(item => new Date(item.date) >= new Date(startDate));
        }
        if (endDate) {
            // Add 1 day to endDate to include the whole day
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            result = result.filter(item => new Date(item.date) < end);
        }
        setFilteredHistory(result);
    }, [startDate, endDate, history]);

    const handleViewAnswersClick = (result) => {
        setSelectedResult(result);
        setShowModal(true);
    };

    const generateReportHTML = (result, filterType) => {
        const isCorrect = filterType === 'correct';
        const title = isCorrect ? t.correctAnswers : t.wrongAnswers;
        const answersToDisplay = result.answers.filter(a => a.isCorrect === isCorrect);

        const answerItems = answersToDisplay.map((answer, i) => {
            const questionHTML = `
                <p class="question-text"><b>Q${i + 1}:</b> ${answer.questionText_en}</p>
                <p class="question-text tamil">${answer.questionText_ta}</p>
            `;

            if (isCorrect) {
                return `
                    <div class="card correct">
                        <div class="card-body">
                            ${questionHTML}
                            <p class="answer-text correct-text">Your Answer: ${answer.userAnswer}</p>
                            <p class="answer-text correct-text tamil">உங்கள் பதில்: ${answer.userAnswer_ta}</p>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="card wrong">
                        <div class="card-body">
                            ${questionHTML}
                            <p class="answer-text wrong-text">Your Answer: ${answer.userAnswer}</p>
                            <p class="answer-text wrong-text tamil">உங்கள் பதில்: ${answer.userAnswer_ta}</p>
                            <p class="answer-text info-text">Correct Answer: ${answer.correctAnswer}</p>
                            <p class="answer-text info-text tamil">சரியான பதில்: ${answer.correctAnswer_ta}</p>
                        </div>
                    </div>
                `;
            }
        }).join('');

        return `
            <!DOCTYPE html>
            <html lang="${lang}">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title} - Quiz Review</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f8f9fa; }
                    .container { max-width: 800px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                    h1, h2 { color: #333; }
                    .card { border: 1px solid #ddd; border-radius: 5px; margin-bottom: 15px; }
                    .card.correct { border-left: 5px solid #198754; }
                    .card.wrong { border-left: 5px solid #dc3545; }
                    .card-body { padding: 15px; }
                    .tamil { font-style: italic; color: #555; }
                    .question-text { font-size: 1.1em; margin-bottom: 10px; }
                    .answer-text { margin: 5px 0; }
                    .correct-text { color: #198754; }
                    .wrong-text { color: #dc3545; }
                    .info-text { color: #0dcaf0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>${title}</h1>
                    <h2>Quiz on: ${formatDateTime(result.date)}</h2>
                    <hr>
                    ${answersToDisplay.length > 0 ? answerItems : `<p>No answers in this category.</p>`}
                </div>
            </body>
            </html>
        `;
    };

    const handleViewReport = (filterType) => {
        if (!selectedResult) return;

        const htmlContent = generateReportHTML(selectedResult, filterType);
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.open();
            newWindow.document.write(htmlContent);
            newWindow.document.close();
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const locale = lang === 'ta' ? 'ta-IN' : 'en-US';
        return new Date(dateString).toLocaleString(locale, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    const generateSummaryPDF = () => {
        const doc = new jsPDF();

        // Add the Tamil font to jsPDF's virtual file system
        doc.addFileToVFS("NotoSansTamil-Regular.ttf", NotoSansTamil);
        doc.addFont("NotoSansTamil-Regular.ttf", "NotoSansTamil", "normal");

        doc.setFont("NotoSansTamil", "normal");
        doc.text(t.pdfTitle(currentUser.username), 14, 16); // Title in selected language

        doc.autoTable({
            startY: 20,
            head: [t.pdfHeaders],
            body: filteredHistory.map((item, i) => [
                i + 1,
                formatDateTime(item.date),
                `${item.score} / ${item.total}`
            ]),
            styles: {
                font: "NotoSansTamil", // Use the font for the table content
                fontStyle: 'normal',
            },
            headStyles: {
                fontStyle: 'bold',
            }
        });

        doc.save(`${currentUser.username}-performance-summary.pdf`);
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
                    <Button variant="success" size="sm" onClick={generateSummaryPDF} disabled={filteredHistory.length === 0}>
                        <i className="bi bi-download me-1"></i> {t.download}
                    </Button>
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
                                    <td>{formatDateTime(result.date)}</td>
                                    <td><Badge bg="primary">{result.score}</Badge> / <Badge bg="secondary">{result.total}</Badge></td>
                                    <td className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center">
                                        <Button onClick={() => handleViewAnswersClick(result)} variant="info" size="sm" className="mb-2 mb-sm-0 me-sm-2 w-100 w-sm-auto">
                                            <i className="bi bi-search me-1"></i> View Answers
                                        </Button>
                                        <Button as={Link} to={`/user/score/${new Date(result.date).getTime()}`} variant="outline-info" size="sm" title="View in new page" className="w-100 w-sm-auto">
                                            <i className="bi bi-box-arrow-up-right"></i>
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
                        <Modal.Title>Answer Review: {formatDateTime(selectedResult.date)}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="bg-body-tertiary">
                        <p>Select a category to view the questions and answers in a new tab.</p>
                        <div className="d-grid gap-2">
                            <Button variant="outline-success" onClick={() => handleViewReport('correct')}>
                                <i className="bi bi-check-circle-fill me-2"></i>
                                View {t.correctAnswers} ({selectedResult.answers.filter(a => a.isCorrect).length})
                            </Button>
                            <Button variant="outline-danger" onClick={() => handleViewReport('wrong')}>
                                <i className="bi bi-x-circle-fill me-2"></i>
                                View {t.wrongAnswers} ({selectedResult.answers.filter(a => !a.isCorrect).length})
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>
            )}
        </Card>
    );
};

export default PerformanceHistory;