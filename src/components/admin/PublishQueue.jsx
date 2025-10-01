import React, { useState } from 'react';
import { Button, Card, ListGroup, Modal, Form, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const getQuestions = () => JSON.parse(localStorage.getItem("quizQuestions")) || [];
const saveQuestions = (questions) => {
    localStorage.setItem("quizQuestions", JSON.stringify(questions));
    window.dispatchEvent(new Event('storageUpdated')); // Notify other components
};

const PublishQueue = () => {
    const [questions, setQuestions] = useState(getQuestions());
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishingInfo, setPublishingInfo] = useState({ id: null, isBulk: false });
    const [publishDates, setPublishDates] = useState({ releaseDate: '', disappearDate: '' });

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

    const handleConfirmPublish = () => {
        if (!publishDates.releaseDate || !publishDates.disappearDate) {
            toast.warn("Please set both a release and disappear time.");
            return;
        }

        // Check if this is the very first time any question is being published.
        const wasFirstPublish = questions.every(q => q.status !== 'published');
        let updatedQuestions;
        if (publishingInfo.isBulk) {
            const draftIds = draftQuestions.map(q => q.id);
            updatedQuestions = questions.map(q =>
                draftIds.includes(q.id)
                    ? { ...q, status: 'published', ...publishDates }
                    : q
            );
            toast.info(`${draftIds.length} questions have been published!`);
        } else {
            updatedQuestions = questions.map(q =>
                q.id === publishingInfo.id
                    ? { ...q, status: 'published', ...publishDates }
                    : q
            );
            toast.info("Question has been published!");
        }
        setQuestions(updatedQuestions);
        saveQuestions(updatedQuestions);
        handleModalClose();

        // If it was the first publish, show the special alert.
        if (wasFirstPublish) {
            // Use a longer autoClose time to ensure the admin sees it.
            toast.info(<div>The user quiz link is now available on your <Link to="/admin/dashboard">dashboard</Link>!</div>, { autoClose: 10000 });
        }
    };

    const handleDelete = (id) => {
        const updatedQuestions = questions.filter(q => q.id !== id);
        setQuestions(updatedQuestions);
        saveQuestions(updatedQuestions);
        toast.error('Draft question deleted.');
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
                    {draftQuestions.length > 0 ? draftQuestions.map(q => (
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
                    )) : (
                        <ListGroup.Item>There are no draft questions to publish.</ListGroup.Item>
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