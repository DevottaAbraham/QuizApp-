import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';

const initialQuestionState = {
    text_en: '',
    options_en: ['', '', '', ''],
    correctAnswer_en: '',
    text_ta: '',
    options_ta: ['', '', '', ''],
    correctAnswer_ta: '',
    status: 'draft',
};

const ManageQuestions = () => {
    const [formState, setFormState] = useState(initialQuestionState);
    const [editingId, setEditingId] = useState(null); // null for adding, question.id for editing
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const editIdParam = searchParams.get('edit');
        if (editIdParam) {
            setLoading(true);
            setError('');
            api.getQuestionById(editIdParam)
                .then(questionToEdit => {
                    setFormState(questionToEdit);
                    setEditingId(questionToEdit.id);
                })
                .catch(err => {
                    setError('Failed to load the question for editing.');
                    toast.error('Could not find the specified question.');
                    navigate('/admin/questions');
                })
                .finally(() => setLoading(false));
        }
    }, [searchParams, navigate]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState({ ...formState, [name]: value });
    };

    const handleOptionChange = (lang, index, value) => {
        const optionsKey = `options_${lang}`;
        const updatedOptions = [...formState[optionsKey]];
        updatedOptions[index] = value;
        setFormState(prevState => ({ ...prevState, [optionsKey]: updatedOptions }));
    };

    const handleCorrectAnswerChange = (lang, value) => {
        const correctKey = `correctAnswer_${lang}`;
        setFormState(prevState => ({ ...prevState, [correctKey]: value }));
    };

    const resetForm = () => {
        setFormState(initialQuestionState);
        setEditingId(null);
        navigate('/admin/questions'); // Clear URL query param
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEnglishComplete = formState.text_en && formState.options_en.every(opt => opt) && formState.correctAnswer_en;
        const isTamilComplete = formState.text_ta && formState.options_ta.every(opt => opt) && formState.correctAnswer_ta;

        if (!isEnglishComplete || !isTamilComplete) {
            toast.warn('Please fill out all fields in both English and Tamil, and select a correct answer for each.');
            return;
        }

        setLoading(true);
        try {
            if (editingId) {
                // Update existing question
                await api.updateQuestion(editingId, formState);
                toast.success('Question updated successfully!');
                navigate('/admin/publish'); // Redirect back to the publish queue
            } else {
                // Add new question
                await api.createQuestion(formState);
                toast.success('Question added successfully and is ready to be published!');
                resetForm();
            }
        } catch (err) {
            // Error toast is handled by apiService
            console.error("Failed to save question:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Row>
            <Col md={8} className="mx-auto">
                <Card className="shadow-sm">
                    <Card.Header as="h5">{editingId ? 'Edit Question' : 'Add New Question'}</Card.Header>
                    <Card.Body>
                        {loading && <div className="text-center"><Spinner animation="border" /></div>}
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleSubmit} style={{ display: loading ? 'none' : 'block' }}>
                            {/* English Fields */}
                            <h6 className="text-muted">English Version</h6>
                            <Form.Group className="mb-3">
                                <Form.Label>Question Text</Form.Label>
                                <Form.Control as="textarea" rows={2} name="text_en" value={formState.text_en} onChange={handleInputChange} placeholder="Enter the question" required />
                            </Form.Group>
                            {formState.options_en?.map((option, index) => (
                                <Form.Group key={index} className="mb-3">
                                    <Form.Label>Option {index + 1}</Form.Label>
                                    <InputGroup>
                                        <Form.Control type="text" value={option} onChange={(e) => handleOptionChange('en', index, e.target.value)} placeholder={`Option ${index + 1}`} required />
                                        <InputGroup.Radio
                                            name="correctAnswer_en"
                                            aria-label={`Set Option ${index + 1} as correct`}
                                            onChange={() => handleCorrectAnswerChange('en', option)}
                                            checked={formState.correctAnswer_en === option}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            ))}

                            <hr />

                            {/* Tamil Fields */}
                            <h6 className="text-muted">Tamil Version</h6>
                            <Form.Group className="mb-3">
                                <Form.Label>கேள்வி</Form.Label>
                                <Form.Control as="textarea" rows={2} name="text_ta" value={formState.text_ta} onChange={handleInputChange} placeholder="கேள்வியை உள்ளிடவும்" required />
                            </Form.Group>
                            {formState.options_ta?.map((option, index) => (
                                <Form.Group key={index} className="mb-3">
                                    <Form.Label>விருப்பம் {index + 1}</Form.Label>
                                    <InputGroup>
                                        <Form.Control type="text" value={option} onChange={(e) => handleOptionChange('ta', index, e.target.value)} placeholder={`விருப்பம் ${index + 1}`} required />
                                        <InputGroup.Radio
                                            name="correctAnswer_ta"
                                            aria-label={`விருப்பம் ${index + 1} சரியானது`}
                                            onChange={() => handleCorrectAnswerChange('ta', option)}
                                            checked={formState.correctAnswer_ta === option}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            ))}

                            <hr />

                            <Button type="submit" variant="primary" disabled={loading}>{editingId ? 'Save Changes' : 'Save as Draft'}</Button>
                            {editingId && <Button variant="secondary" className="ms-2" onClick={resetForm}>Cancel Edit</Button>}
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default ManageQuestions;