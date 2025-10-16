import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, InputGroup } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createQuestion } from '../../services/apiServices';
import { toast } from 'react-toastify';

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
    const [editingId, setEditingId] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const editIdParam = searchParams.get('edit');
        if (editIdParam) {
            const fetchQuestion = async () => {
                try {
                    const questionToEdit = await getQuestionById(editIdParam);
                    if (questionToEdit) {
                        setFormState(questionToEdit);
                        setEditingId(questionToEdit.id);
                    } else {
                        toast.error("Question not found.");
                        navigate('/admin/questions');
                    }
                } catch (error) {
                    navigate('/admin/questions');
                }
            };
            fetchQuestion();
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

// ... inside your component
const handleSubmit = async (formData) => {
  try {
    // Just call the service function. It handles the rest!
    const newQuestion = await createQuestion(formData);
    toast.success('Question created successfully!');
    // ... (logic to refresh your questions list)
  } catch (error) {
    // The apiFetch service already shows a toast on error.
    console.error('Failed to create question:', error);
  }
};

    return (
        <Row>
            <Col md={8} className="mx-auto">
                <Card className="shadow-sm">
                    <Card.Header as="h5">{editingId ? 'Edit Question' : 'Add New Question'}</Card.Header>
                    <Card.Body>
                        <Form onSubmit={handleSubmit}>
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