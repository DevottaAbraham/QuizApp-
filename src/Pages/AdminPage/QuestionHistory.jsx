import React, { useState, useEffect } from 'react';
import { Button, Card, ListGroup, Modal, Spinner, Alert } from 'react-bootstrap';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';

const QuestionHistory = () => {
    const [publishedQuestions, setPublishedQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchPublishedQuestions = async () => {
        try {
            setLoading(true);
            setError('');
            const allQuestions = await api.getQuestions();
            setPublishedQuestions(allQuestions.filter(q => q.status === 'published'));
        } catch (err) {
            setError('Failed to load question history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublishedQuestions();
    }, []);
    
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

    const handleDeleteAllPublished = async () => {
        try {
            await api.deleteAllPublishedQuestions();
            toast.success('All published questions have been deleted.');
            await fetchPublishedQuestions(); // Re-fetch the data to ensure UI consistency
        } catch (err) {
            // API service will show an error toast
            console.error('Failed to delete all published questions:', err);
        } finally {
            setShowDeleteModal(false);
        }
    };

    return (
        <>
            <Card className="shadow-sm">
                <Card.Header as="h5" className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <span className="mb-2 mb-md-0">Question History ({publishedQuestions.length})</span>
                    <div className="d-flex">
                        <Button variant="success" size="sm" onClick={handleDownloadPDF} disabled={publishedQuestions.length === 0} className="me-2">
                            <i className="bi bi-file-earmark-pdf-fill me-1"></i> Download as PDF
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)} disabled={publishedQuestions.length === 0}>
                            <i className="bi bi-trash-fill me-1"></i> Delete All
                        </Button>
                    </div>
                </Card.Header>
                {loading && <Card.Body className="text-center"><Spinner animation="border" /></Card.Body>}
                {error && <Alert variant="danger" className="m-3">{error}</Alert>}
                <ListGroup variant="flush">
                    {!loading && publishedQuestions.length > 0 ? publishedQuestions.map(q => (
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
                    )) : !loading && (
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