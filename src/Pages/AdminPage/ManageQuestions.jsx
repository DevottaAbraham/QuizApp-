import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, InputGroup } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const getQuestions = () => JSON.parse(localStorage.getItem("quizQuestions")) || [];
const saveQuestions = (questions) => {
    localStorage.setItem("quizQuestions", JSON.stringify(questions));
    window.dispatchEvent(new Event('storageUpdated')); // Notify other components
};

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
    const [questions, setQuestions] = useState(getQuestions());
    const [formState, setFormState] = useState(initialQuestionState);
    const [editingId, setEditingId] = useState(null); // null for adding, question.id for editing
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const editIdParam = searchParams.get('edit');
        if (editIdParam) {
            const questionToEdit = questions.find(q => q.id === parseInt(editIdParam, 10));
            if (questionToEdit) {
                setFormState(questionToEdit);
                setEditingId(questionToEdit.id);
            }
        }
    }, [searchParams, questions]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState({ ...formState, [name]: value });
    };

    const handleOptionChange = (lang, index, value) => {
        const optionsKey = `options_${lang}`;
        const updatedOptions = [...formState[optionsKey]];
        updatedOptions[index] = value;
        setFormState({ ...formState, [optionsKey]: updatedOptions });
    };

    const handleCorrectAnswerChange = (lang, value) => {
        const correctKey = `correctAnswer_${lang}`;
        setFormState({ ...formState, [correctKey]: value });
    };

    const resetForm = () => {
        setFormState(initialQuestionState);
        setEditingId(null);
        navigate('/admin/questions'); // Clear URL query param
    };

    const handleAddQuestion = (e) => {
        e.preventDefault();
        const isEnglishComplete = formState.text_en && formState.options_en.every(opt => opt) && formState.correctAnswer_en;
        const isTamilComplete = formState.text_ta && formState.options_ta.every(opt => opt) && formState.correctAnswer_ta;

        if (!isEnglishComplete || !isTamilComplete) {
            toast.warn('Please fill out all fields in both English and Tamil, and select a correct answer for each.');
            return;
        }

        let updatedQuestions;
        if (editingId) {
            // Update existing question
            updatedQuestions = questions.map(q => q.id === editingId ? { ...formState, id: editingId } : q);
            toast.success('Question updated successfully!');
            navigate('/admin/publish'); // Redirect back to the publish queue
        } else {
            // Add new question
            const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin"));
            updatedQuestions = [...questions, { ...formState, id: Date.now(), author: currentAdmin.email }];
        }

        setQuestions(updatedQuestions);
        saveQuestions(updatedQuestions);
        if (!editingId) {
            toast.success('Question added successfully!');
            setTimeout(() => resetForm(), 500); // Delay reset to allow toast to be seen
        }
    };

    return (
        <Row>
            <Col md={8} className="mx-auto">
                <Card className="shadow-sm">
                    <Card.Header as="h5">{editingId ? 'Edit Question' : 'Add New Question'}</Card.Header>
                    <Card.Body>
                        <Form onSubmit={handleAddQuestion}>
                            {/* English Fields */}
                            <h6 className="text-muted">English Version</h6>
                            <Form.Group className="mb-3">
                                <Form.Label>Question Text</Form.Label>
                                <Form.Control as="textarea" rows={2} name="text_en" value={formState.text_en} onChange={handleInputChange} placeholder="Enter the question" required />
                            </Form.Group>
                            {formState.options_en.map((option, index) => (
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
                            {formState.options_ta.map((option, index) => (
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

                            <Button type="submit" variant="primary">{editingId ? 'Save Changes' : 'Save as Draft'}</Button>
                            {editingId && <Button variant="secondary" className="ms-2" onClick={resetForm}>Cancel Edit</Button>}
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default ManageQuestions;