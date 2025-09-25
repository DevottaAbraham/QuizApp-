import React, { useEffect, useState } from 'react';
import { Card, Button, ListGroup, Badge, Alert, Modal, Table } from 'react-bootstrap';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MyScore = () => {
    const [history, setHistory] = useState([]);
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const [selectedResult, setSelectedResult] = useState(null);

    useEffect(() => {
        const savedHistory = JSON.parse(localStorage.getItem(`quizHistory_${currentUser.userId}`)) || [];
        if (savedHistory.length > 0) {
            setHistory(savedHistory);
        }
    }, [currentUser.userId]);

    const handleViewDetails = (result) => {
        setSelectedResult(result);
    };

    const handleCloseModal = () => {
        setSelectedResult(null);
    };

    const handleDownloadPDF = () => {
        if (!selectedResult) return;

        const doc = new jsPDF();
        doc.text(`Quiz Result for ${currentUser.username}`, 14, 20);
        doc.text(`Score: ${selectedResult.score} / ${selectedResult.total}`, 14, 30);
        doc.text(`Date: ${new Date(selectedResult.date).toLocaleString()}`, 14, 40);

        const tableColumn = ["#", "Question", "Your Answer", "Correct Answer", "Result"];
        const tableRows = [];

        selectedResult.answers.forEach((answer, index) => {
            const rowData = [
                index + 1,
                answer.questionText,
                answer.userAnswer,
                answer.correctAnswer,
                answer.isCorrect ? "Correct" : "Wrong",
            ];
            tableRows.push(rowData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50,
        });

        doc.save(`quiz-result-${currentUser.username}.pdf`);
    };

    if (history.length === 0) {
        return <Alert variant="info">You have not completed any quizzes yet. Go to the "Today's Questions" page to start one!</Alert>;
    }

    return (
        <>
            <Card className="shadow-sm">
                <Card.Header as="h4">
                    Score History for {currentUser.username}
                </Card.Header>
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Score</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((result, index) => (
                                <tr key={index}>
                                    <td>{new Date(result.date).toLocaleString()}</td>
                                    <td><Badge bg="primary">{result.score}</Badge> / <Badge bg="secondary">{result.total}</Badge></td>
                                    <td>
                                        <Button variant="primary" size="sm" onClick={() => handleViewDetails(result)}>
                                            View Performance
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={!!selectedResult} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Answer Breakdown</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedResult && (
                        <ListGroup variant="flush">
                            {selectedResult.answers.map((answer, index) => (
                                <ListGroup.Item key={index}>
                                    <strong>Q: {answer.questionText}</strong>
                                    {answer.isCorrect ? (
                                        <p className="mb-0 text-success">Your answer: {answer.userAnswer} <i className="bi bi-check-circle-fill"></i></p>
                                    ) : (
                                        <>
                                            <p className="mb-0 text-danger">Your answer: {answer.userAnswer} <i className="bi bi-x-circle-fill"></i></p>
                                            <p className="mb-0 text-info">Correct answer: {answer.correctAnswer}</p>
                                        </>
                                    )}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleDownloadPDF} disabled={!selectedResult}>
                        <i className="bi bi-file-earmark-pdf-fill me-1"></i> Download PDF
                    </Button>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MyScore;