import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Form, Badge, ListGroup, Alert, ButtonGroup, DropdownButton, Dropdown, Modal, Table } from 'react-bootstrap';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { NotoSansTamil } from './NotoSansTamil'; // Corrected font import path


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
        detailedPdfHeaders: ["#", "Question", "Your Answer", "Correct Answer", "Result"],
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
        detailedPdfHeaders: ["#", "கேள்வி", "உங்கள் பதில்", "சரியான பதில்", "முடிவு"],
    }
};

const PerformanceHistory = () => {
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const [answerFilter, setAnswerFilter] = useState('all'); // 'all', 'correct', 'wrong'
    const [pdfForViewer, setPdfForViewer] = useState(null);
    const [lang, setLang] = useState('en');
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const t = translations[lang];

    useEffect(() => {
        const userHistory = JSON.parse(localStorage.getItem(`quizHistory_${currentUser.userId}`)) || [];
        setHistory(userHistory);
        setFilteredHistory(userHistory); // Initially, show all history
    }, [currentUser.userId]);

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

    const generateDetailedPDF = (outputType = 'save') => {
        if (!selectedResult) return;

        const doc = new jsPDF();
        doc.addFileToVFS("NotoSansTamil-Regular.ttf", NotoSansTamil);
        doc.addFont("NotoSansTamil-Regular.ttf", "NotoSansTamil", "normal");
        doc.setFont("NotoSansTamil", "normal");

        const title = lang === 'ta' ? `வினாடி வினா முடிவு - ${currentUser.username}` : `Quiz Result for ${currentUser.username}`;
        const scoreText = lang === 'ta' ? `மதிப்பெண்: ${selectedResult.score} / ${selectedResult.total}` : `Score: ${selectedResult.score} / ${selectedResult.total}`;
        const dateText = lang === 'ta' ? `தேதி: ${formatDateTime(selectedResult.date)}` : `Date: ${formatDateTime(selectedResult.date)}`;

        doc.text([title, scoreText, dateText], 14, 20);

        const tableRows = selectedResult.answers.map((answer, index) => [
            index + 1,
            answer.questionText,
            answer.userAnswer,
            answer.correctAnswer,
            answer.isCorrect ? (lang === 'ta' ? 'சரி' : 'Correct') : (lang === 'ta' ? 'தவறு' : 'Wrong'),
        ]);

        doc.autoTable({
            head: [t.detailedPdfHeaders],
            body: tableRows,
            startY: 50,
            styles: { font: "NotoSansTamil", fontStyle: 'normal' },
            headStyles: { fontStyle: 'bold' }
        });

        if (outputType === 'blob') {
            return doc.output('blob');
        }

        doc.save(`quiz-result-${currentUser.username}-${new Date(selectedResult.date).toISOString().split('T')[0]}.pdf`);
    };

    const handleViewDetails = (result) => {
        setSelectedResult(result);
        // We will generate the PDF for the viewer when the modal opens
        setShowDetailsModal(true);
    };

    const handleCloseModal = () => {
        setShowDetailsModal(false);
        setSelectedResult(null);
        setPdfForViewer(null); // Clear the generated PDF
        setAnswerFilter('all'); // Reset filter on close
    };

    return (
        <Card className="shadow-sm">
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                {t.title}
                <div>
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
                <Form as={Row} className="mb-4 align-items-end">
                    <Col md={5}>
                        <Form.Group controlId="startDate">
                            <Form.Label>{t.fromDate}</Form.Label>
                            <Form.Control type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </Form.Group>
                    </Col>
                    <Col md={5}>
                        <Form.Group controlId="endDate">
                            <Form.Label>{t.toDate}</Form.Label>
                            <Form.Control type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </Form.Group>
                    </Col>
                    <Col md={2} className="d-grid">
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
                                    <td>
                                        <Button variant="info" size="sm" onClick={() => handleViewDetails(result)}>
                                            <i className="bi bi-eye-fill me-1"></i> View Details
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

            <Modal show={showDetailsModal} onHide={handleCloseModal} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Performance Report</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: '80vh' }}>
                    <DocViewer
                        documents={selectedResult ? [{ uri: URL.createObjectURL(generateDetailedPDF('blob')) }] : []}
                        pluginRenderers={DocViewerRenderers}
                        config={{
                            header: {
                                disableHeader: true, // Hides the default header from the viewer
                            },
                        }}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={() => generateDetailedPDF('save')} disabled={!selectedResult}>
                        <i className="bi bi-download me-1"></i> Download Details
                    </Button>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default PerformanceHistory;