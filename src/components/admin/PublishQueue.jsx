import React, { useState, useEffect } from 'react';
import { Button, Card, ListGroup, Modal, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
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
            setLoading(true);
            setError('');
            const fetchedQuestions = await api.getQuestions();
            setQuestions(fetchedQuestions);
        } catch (err) {
            setError('Failed to load questions. Please try again.');
            // The apiService toast will also be shown.
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
        // No need to listen for storage events anymore
    }, []);

    const draftQuestions = questions.filter(q => q.status === 'draft');

    const handlePublishClick = (id) => {
        setPublishingInfo({ id: id, isBulk: false });
        setShowPublishModal(true);
    };

    const handlePublishAllClick = () => {
        if (draftQuestions.length === 0) return;
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

        const wasFirstPublish = !questions.some(q => q.status === 'published');

        try {
            if (publishingInfo.isBulk) {
                const updates = draftQuestions.map(q =>
                    api.updateQuestion(q.id, { ...q, status: 'published', ...publishDates })
                );
                await Promise.all(updates);
                toast.info(`${draftQuestions.length} questions have been published!`);
            } else {
                const questionToPublish = questions.find(q => q.id === publishingInfo.id);
                if (questionToPublish) {
                    await api.updateQuestion(publishingInfo.id, { ...questionToPublish, status: 'published', ...publishDates });
                    toast.info("Question has been published!");
                }
            }

            if (wasFirstPublish) {
                setTimeout(() => toast.info(<div>The user quiz link is now available on your <Link to="/admin/dashboard">dashboard</Link>!</div>, { autoClose: 10000 }), 500);
            }

            await fetchQuestions(); // Re-fetch to get the latest state
        } catch (err) {
            console.error("Failed to publish question(s):", err);
        } finally {
            handleModalClose();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this draft question?')) return;
        try {
            await api.deleteQuestion(id);
            setQuestions(questions.filter(q => q.id !== id));
            toast.success('Draft question deleted.');
        } catch (err) {
            console.error("Failed to delete question:", err);
        }
    };

    return (
        <>
            <Card className="shadow-sm">
                <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                    <span>Publish Queue ({draftQuestions.length})</span>
                    <Button variant="primary" size="sm" onClick={handlePublishAllClick} disabled={draftQuestions.length === 0}>
                        <i className="bi bi-cloud-upload-fill me-1"></i> Publish All
                    </Button>
                </Card.Header>
                {loading && <Card.Body className="text-center"><Spinner animation="border" /></Card.Body>}
                {error && <Alert variant="danger" className="m-3">{error}</Alert>}
                <ListGroup variant="flush">
                    {!loading && draftQuestions.length > 0 ? draftQuestions.map(q => (
                        <ListGroup.Item key={q.id} className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                            <div className="mb-2 mb-md-0">
                                <strong>{q.text_en}</strong>
                                <p className="text-muted mb-1 small fst-italic">{q.text_ta}</p>
                            </div>
                            <div className="d-flex align-items-center flex-shrink-0">
                                <Button variant="info" size="sm" className="me-2" onClick={() => handlePublishClick(q.id)}>
                                    <i className="bi bi-upload"></i> Publish
                                </Button>
                                <Button as={Link} to={`/admin/questions?edit=${q.id}`} variant="outline-secondary" size="sm" className="me-2" onClick={() => window.scrollTo(0, 0)}>
                                    <i className="bi bi-pencil-fill"></i> Edit
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(q.id)}>
                                    <i className="bi bi-trash-fill"></i>
                                </Button>
                            </div>
                        </ListGroup.Item>
                    )) : !loading && (
                        <ListGroup.Item>There are no draft questions to publish. <Link to="/admin/questions">Add one now</Link>.</ListGroup.Item>
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
                                <Form.Group className="mb-3">
                                    <Form.Label>Release Time</Form.Label>
                                    <Form.Control type="datetime-local" name="releaseDate" value={publishDates.releaseDate} onChange={handleDateChange} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Disappear Time</Form.Label>
                                    <Form.Control type="datetime-local" name="disappearDate" value={publishDates.disappearDate} onChange={handleDateChange} />
                                </Form.Group>
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