import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Form, ProgressBar, Alert, Spinner, ButtonGroup, ListGroup, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';

const Quiz = ({ currentUser }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');
    const [quizFinished, setQuizFinished] = useState(false);
    const [lang, setLang] = useState('en'); // 'en' or 'ta'
    const [loading, setLoading] = useState(true);
    const [userAnswers, setUserAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) return;

        const fetchActiveQuiz = async () => {
            try {
                setLoading(true);
                const activeQuestions = await api.getActiveQuiz();
                setQuestions(activeQuestions);
            } catch (error) {
                console.error("Failed to fetch active quiz:", error);
                toast.error("Could not load the quiz. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchActiveQuiz();
    }, [currentUser]);

    // Prevent navigation and reloads during the quiz
    useEffect(() => {
        if (loading || !questions.length || quizFinished) {
            return; // Don't block if quiz isn't active
        }

        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = 'Are you sure you want to leave? Your quiz progress will be lost.';
            return event.returnValue;
        };

        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'r' || event.key === 'F5') {
                event.preventDefault();
                toast.warn("Reloading is disabled during the quiz.");
            }
        };

        const blockBackNavigation = (event) => {
            window.history.pushState(null, '', window.location.href);
            toast.warn("You cannot go back during the quiz. Please complete it first.");
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('keydown', handleKeyDown);
        window.history.pushState(null, '', window.location.href); // Initial push
        window.addEventListener('popstate', blockBackNavigation);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('popstate', blockBackNavigation);
        };
    }, [loading, questions, quizFinished, navigate]);

    if (loading) {
        return (
            <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p>Checking for active quizzes...</p>
            </div>
        );
    }

    if (!currentUser) {
        return <Alert variant="danger">You must be logged in to take a quiz.</Alert>;
    }

    if (questions.length === 0 && !loading) {
        return <Alert variant="info">There are no active quizzes available at the moment, or you have already completed today's quiz. Please check your <Link to="/user/history">score history</Link>.</Alert>;
    }

    if (quizFinished) {
        return <Alert variant="success">Quiz submitted! Redirecting to your results...</Alert>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    const handleOptionChange = (e) => {
        const { value } = e.target;
        setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    };

    const handleNext = () => {
        if (!userAnswers[currentQuestion.id]) {
            toast.warn("Please select an answer before proceeding.");
            return;
        }
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (Object.keys(userAnswers).length !== questions.length) {
            toast.warn("Please answer all questions before submitting.");
            return;
        }

        const submissionPayload = {
            answeredQuestions: questions.map(q => {
                const userAnswer = userAnswers[q.id];
                const isCorrect = userAnswer === q.correctAnswer_en;
                const taOptionIndex = q.options_en.indexOf(userAnswer);
                const userAnswer_ta = taOptionIndex !== -1 ? q.options_ta[taOptionIndex] : '';

                return {
                    questionId: q.id,
                    questionText_en: q.text_en,
                    questionText_ta: q.text_ta,
                    userAnswer: userAnswer,
                    userAnswer_ta: userAnswer_ta,
                    correctAnswer: q.correctAnswer_en,
                    correctAnswer_ta: q.correctAnswer_ta,
                    isCorrect: isCorrect,
                    options_en: q.options_en,
                    options_ta: q.options_ta,
                };
            })
        };

        try {
            setSubmitting(true);
            const result = await api.submitQuiz(submissionPayload);
            setQuizFinished(true);
            toast.success(`Quiz submitted successfully! Redirecting to your results...`);
            
            // Redirect the user to the detailed score page for the quiz they just took.
            navigate(`/user/score/${result.quizId}`);

        } catch (err) {
            console.error("Failed to submit quiz:", err);
            // The apiService should have already shown a toast message.
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="shadow-lg">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <Card.Title className="mb-0">Today's Quiz</Card.Title>
                <ButtonGroup size="sm">
                    <Button variant={lang === 'en' ? 'primary' : 'outline-primary'} onClick={() => setLang('en')}>EN</Button>
                    <Button variant={lang === 'ta' ? 'primary' : 'outline-primary'} onClick={() => setLang('ta')}>TA</Button>
                </ButtonGroup>
            </Card.Header>
            <Card.Body>
                <ProgressBar now={progress} label={`${currentQuestionIndex + 1}/${questions.length}`} className="mb-4" />
                
                <h5>{lang === 'en' ? currentQuestion.text_en : currentQuestion.text_ta}</h5>
                
                <Form>
                    <ListGroup variant="flush">
                        {(lang === 'en' ? currentQuestion.options_en : currentQuestion.options_ta).map((option, index) => (
                            <ListGroup.Item key={index} as="label" className="p-3 rounded mb-2 border">
                                <Form.Check 
                                    type="radio"
                                    name={currentQuestion.id}
                                    id={`option-${index}`}
                                    value={currentQuestion.options_en[index]} // Always use English value for submission
                                    label={option} // Display the language-specific option
                                    checked={userAnswers[currentQuestion.id] === currentQuestion.options_en[index]}
                                    onChange={handleOptionChange}
                                />
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Form>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-end">
                {currentQuestionIndex === questions.length - 1 ? (
                    <Button onClick={handleSubmitQuiz} variant="success" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Quiz'}</Button>
                ) : (
                    <Button onClick={handleNext} disabled={!userAnswers[currentQuestion.id]}>Next</Button>
                )}
            </Card.Footer>
        </Card>
    );
};

export default Quiz;