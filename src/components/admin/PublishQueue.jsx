import React, { useState, useEffect } from 'react';
import { Card, Button, ListGroup, Spinner, Alert, Modal, Form, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';

const PublishQueue = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishingInfo, setPublishingInfo] = useState({ id: null, isBulk: false });
    const [publishDates, setPublishDates] = useState({ releaseDate: '', disappearDate: '' });

    const fetchQuestions = async () => {
        try {
            setError('');
            setLoading(true);
            const data = await api.getQuestions();
            // Filter for questions that are not published yet
            setQuestions(data.filter(q => q.status === 'draft'));
        } catch (err) {
            setError('Failed to load questions. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handlePublishClick = (id) => {
        setPublishingInfo({ id: id, isBulk: false });
        setShowPublishModal(true);
    };

    const handlePublishAllClick = () => {
        if (questions.length === 0) {
            toast.info("There are no draft questions to publish.");
            return;
        }
        setPublishingInfo({ id: null, isBulk: true });
        setShowPublishModal(true);
    };

    const handleModalClose = () => {
        setShowPublishModal(false);
        setPublishingInfo({ id: null, isBulk: false });
        setPublishDates({ releaseDate: '', disappearDate: '' }); // Reset dates
    };

    const handleDateChange = (e) => {
        setPublishDates({ ...publishDates, [e.target.name]: e.target.value });
    };

    const handleConfirmPublish = async () => {
        if (!publishDates.releaseDate || !publishDates.disappearDate) {
            toast.warn("Please set both a release and disappear time.");
            return;
        }

        const payload = {
            releaseDate: publishDates.releaseDate,
            disappearDate: publishDates.disappearDate,
        };

        try {
            if (publishingInfo.isBulk) {
                const draftIds = questions.map(q => q.id);
                await api.publishQuestion('bulk', { ...payload, questionIds: draftIds });
                toast.success(`${questions.length} questions have been published!`);
            } else {
                await api.publishQuestion(publishingInfo.id, payload);
                toast.success("Question has been published!");
            }
            fetchQuestions(); // Refetch drafts to update the list
        } catch (err) {
            // Error toast is handled by apiService
        } finally {
            handleModalClose();
        }
    };

    const handleDeleteAllPublished = async () => {
        if (!window.confirm('Are you sure you want to delete ALL published questions? This action cannot be undone.')) {
            return;
        }
        try {
            await api.deleteAllPublishedQuestions();
            toast.success('All published questions have been deleted.');
            // Optionally, you might want to re-fetch data if this page also shows published questions
        } catch (err) {
            console.error('Failed to delete all published questions:', err);
            // Error toast is handled by apiService
        }
    };

    const handleDeleteDraft = async (id) => {
        if (!window.confirm('Are you sure you want to delete this draft question?')) {
            return;
        }
        try {
            await api.deleteQuestion(id);
            setQuestions(prev => prev.filter(q => q.id !== id));
            toast.success('Draft question deleted.');
        } catch (err) {
            console.error('Failed to delete draft:', err);
        }
    };

    return (
        <>
            <Card className="shadow-sm">
                <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                    <span>Publish Queue ({questions.length} Drafts)</span>
                    <div>
                        <Button variant="primary" size="sm" onClick={handlePublishAllClick} disabled={questions.length === 0} className="me-2">
                            <i className="bi bi-cloud-upload-fill me-1"></i> Publish All
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={handleDeleteAllPublished}>
                            <i className="bi bi-trash3-fill me-1"></i> Delete All Published
                        </Button>
                    </div>
                </Card.Header>
                <ListGroup variant="flush">
                    {loading && <div className="text-center p-3"><Spinner animation="border" /></div>}
                    {error && <Alert variant="danger" className="m-3">{error}</Alert>}
                    {!loading && !error && (
                        questions.length > 0 ? questions.map(q => (
                            <ListGroup.Item key={q.id} className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                <div className="mb-2 mb-md-0">
                                    <p className="mb-0 fw-bold">{q.text_en}</p>
                                    <small className="text-muted fst-italic">{q.text_ta}</small>
                                </div>
                                <div className="d-flex align-items-center flex-shrink-0">
                                    <Button variant="info" size="sm" className="me-2" onClick={() => handlePublishClick(q.id)}>
                                        <i className="bi bi-upload"></i> Publish
                                    </Button>
                                    <Button as={Link} to={`/admin/questions?edit=${q.id}`} variant="outline-secondary" size="sm" className="me-2">
                                        <i className="bi bi-pencil-fill"></i> Edit
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteDraft(q.id)}>
                                        <i className="bi bi-trash-fill"></i>
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        )) : (
                            <ListGroup.Item>
                                <Alert variant="info" className="text-center mb-0">The publish queue is empty. <Link to="/admin/questions">Add a new question</Link> to get started.</Alert>
                            </ListGroup.Item>
                        )
                    )}
                </ListGroup>
            </Card>

            <Modal show={showPublishModal} onHide={handleModalClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{publishingInfo.isBulk ? 'Set Schedule for All Drafts' : 'Set Publish Schedule'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3"><Form.Label>Release Time</Form.Label><Form.Control type="datetime-local" name="releaseDate" value={publishDates.releaseDate} onChange={handleDateChange} /></Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3"><Form.Label>Disappear Time</Form.Label><Form.Control type="datetime-local" name="disappearDate" value={publishDates.disappearDate} onChange={handleDateChange} /></Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleConfirmPublish}>Confirm & Publish</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default PublishQueue;