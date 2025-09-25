import React, { useState } from 'react';
import { Button, Card, ListGroup, Badge, Modal } from 'react-bootstrap';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';

const getQuestions = () => JSON.parse(localStorage.getItem("quizQuestions")) || [];
const saveQuestions = (questions) => {
    localStorage.setItem("quizQuestions", JSON.stringify(questions));
    window.dispatchEvent(new Event('storageUpdated')); // Notify other components
};

const QuestionHistory = () => {
    const [questions, setQuestions] = useState(getQuestions());
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const publishedQuestions = questions.filter(q => q.status === 'published');

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Published Quiz Questions", 14, 16);
        doc.autoTable({
            startY: 20,
            head: [['#', 'Question (English)', 'Correct Answer', 'Released', 'Disappears']],
            body: publishedQuestions.map((q, i) => [
                i + 1, 
                q.text_en, 
                q.correctAnswer_en,
                formatDateTime(q.releaseDate),
                formatDateTime(q.disappearDate),
            ]),
        });
        doc.save('published-questions.pdf');
    };

    const handleDeleteAllPublished = () => {
        // Filter out all published questions, keeping only drafts
        const remainingQuestions = questions.filter(q => q.status !== 'published');
        setQuestions(remainingQuestions);
        saveQuestions(remainingQuestions);
        toast.error('All published questions have been deleted.');
        setShowDeleteModal(false);
    };

    return (
        <>
            <Card className="shadow-sm">
                <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                    Question History ({publishedQuestions.length})
                    <div>
                        <Button variant="success" size="sm" onClick={handleDownloadPDF} disabled={publishedQuestions.length === 0} className="me-2">
                            <i className="bi bi-file-earmark-pdf-fill me-1"></i> Download as PDF
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)} disabled={publishedQuestions.length === 0}>
                            <i className="bi bi-trash-fill me-1"></i> Delete All
                        </Button>
                    </div>
                </Card.Header>
                <ListGroup variant="flush">
                    {publishedQuestions.length > 0 ? publishedQuestions.map(q => (
                        <ListGroup.Item key={q.id}>
                            <strong>{q.text_en}</strong>
                            <p className="text-muted mb-1 small">
                                Published on: {formatDateTime(q.releaseDate)}
                            </p>
                            <ul className="list-unstyled mt-1 mb-0 small">
                                {q.options_en.map((opt, i) => (
                                    <li key={i} className={opt === q.correctAnswer_en ? 'text-success fw-bold' : ''}>
                                        {opt} {opt === q.correctAnswer_en && <i className="bi bi-check-circle-fill ms-1"></i>}
                                    </li>
                                ))}
                            </ul>
                        </ListGroup.Item>
                    )) : (
                        <ListGroup.Item>No questions have been published yet.</ListGroup.Item>
                    )}
                </ListGroup>
            </Card>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete all {publishedQuestions.length} published questions? This action cannot be undone.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteAllPublished}>Yes, Delete All</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default QuestionHistory;