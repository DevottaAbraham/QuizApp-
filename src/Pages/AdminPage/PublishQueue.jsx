import React, { useState, useEffect } from 'react';
import { Button, Card, ListGroup, Modal, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';

const PublishQueue = () => {
    const [draftQuestions, setDraftQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishingInfo, setPublishingInfo] = useState({ id: null, isBulk: false });
    const [publishDates, setPublishDates] = useState({ releaseDate: '', disappearDate: '' });

    const fetchDrafts = async () => {
        try {
            setLoading(true);
            setError('');
            const allQuestions = await api.getQuestions();
            setDraftQuestions(allQuestions.filter(q => q.status === 'DRAFT'));
        } catch (err) {
            setError('Failed to load draft questions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, []);

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

        const payload = {
            releaseDate: publishDates.releaseDate,
            disappearDate: publishDates.disappearDate,
        };

        try {
            if (publishingInfo.isBulk) {
                const draftIds = draftQuestions.map(q => q.id);
                await api.publishQuestion('bulk', { ...payload, questionIds: draftIds });
                toast.info(`${draftQuestions.length} questions have been published!`);
            } else {
                await api.publishQuestion(publishingInfo.id, payload);
                toast.info("Question has been published!");
            }
            // Refetch drafts to update the list
            fetchDrafts();
        } catch (err) {
            // Error toast is handled by apiService
        }
        handleModalClose();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this draft?')) return;
        try {
            await api.deleteQuestion(id);
            toast.success('Draft question deleted.');
            fetchDrafts(); // Refresh the list
        } catch (err) {
            // Error handled by apiService
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
                <ListGroup variant="flush">
                    {loading && <div className="text-center p-3"><Spinner animation="border" /></div>}
                    {error && <Alert variant="danger" className="m-3">{error}</Alert>}
                    {!loading && !error && (
                        draftQuestions.length > 0 ? draftQuestions.map(q => (
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
                        )) : <ListGroup.Item>There are no draft questions to publish.</ListGroup.Item>
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