import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Card, Button, Form, ProgressBar, Alert, ButtonGroup, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';

const Quiz = ({ currentUser }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');
    const [userAnswers, setUserAnswers] = useState([]);
    const [isAnswered, setIsAnswered] = useState(false);
    const [quizFinished, setQuizFinished] = useState(false);
    const [lang, setLang] = useState('en'); // 'en' or 'ta'
    const [loading, setLoading] = useState(true);
    const [completedQuizInfo, setCompletedQuizInfo] = useState(null);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const navigate = useNavigate();

    // This function will be called to end the quiz, either by completion or timeout.
    const finishQuiz = (finalAnswers, isTimeout = false) => {
        setQuizFinished(true);
        if (isTimeout) {
            toast.warn("Time is up! Calculating score for answered questions.");
        } else {
            toast.success("Quiz completed! Navigating to your score...");
        }
        
        const quizResult = {
            score: finalAnswers.filter(a => a.isCorrect).length,
            totalQuestions: questions.length,
            answers: finalAnswers,
            quizTimestamp: new Date().toISOString(),
        };

        // API call to save the quiz result
        api.submitQuiz(quizResult)
            .then(savedResult => {
                window.dispatchEvent(new Event('storageUpdated')); // Notify other components of new score
                // Navigate to the score detail page for the quiz just taken.
                navigate(`/user/score/${savedResult.id}`);
            })
            .catch(error => {
                console.error("Failed to submit quiz:", error);
                navigate('/user/score'); // Navigate to history even if save fails
            });
    };

    useEffect(() => {
        if (!currentUser) return;

        const fetchQuiz = async () => {
            try {
                const activeQuestions = await api.getActiveQuiz();
                if (activeQuestions && activeQuestions.length > 0) {
                    // In a real app, you'd also check if the user has already taken this quizId
                    setQuestions(activeQuestions);
                }
            } catch (error) {
                console.error("Failed to fetch active quiz:", error);
                toast.error("Could not load the quiz. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();

        // Prevent user from leaving the page
        const handleBeforeUnload = (e) => {
            // Check if there's an active quiz in progress
            if (questions.length > 0 && !quizFinished) {
                e.preventDefault();
                // Standard for most modern browsers
                return (e.returnValue = 'Are you sure you want to leave? Your quiz progress will be lost.');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [currentUser, quizFinished, questions.length]);

    // This effect checks if the current question has already been answered upon load or navigation
    useEffect(() => {
        if (questions.length > 0 && currentQuestionIndex < questions.length && !quizFinished) {
            const currentQuestionId = questions[currentQuestionIndex].id;
            const existingAnswer = userAnswers.find(a => a.questionId === currentQuestionId);

            if (existingAnswer) {
                // If an answer exists, lock the question and show the previous answer
                setSelectedOption(existingAnswer.userAnswer);
                setIsAnswered(true);
            } else {
                // Otherwise, ensure the question is ready for a new answer
                setIsAnswered(false);
            }
        }
    }, [currentQuestionIndex, questions, userAnswers, quizFinished]);

    useEffect(() => {
        if (!quizFinished) {
            // Push a "blocker" state into the history. When the user tries to go back,
            // this is the state they will pop.
            window.history.pushState(null, '', window.location.href);
            const blockBackNavigation = () => {
                // Push it again to "trap" the user on the current page
                window.history.pushState(null, '', window.location.href);
                toast.warn("You cannot go back during the quiz. Please complete it first.");
            };
            window.addEventListener('popstate', blockBackNavigation);
            return () => window.removeEventListener('popstate', blockBackNavigation);
        };
    }, [quizFinished]);
    
    useEffect(() => {
        if (questions.length === 0 || quizFinished) return;

        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion.disappearDate) return; // No timeout if disappear date isn't set

        const disappearTime = new Date(currentQuestion.disappearDate).getTime();
        const interval = setInterval(() => {
            if (new Date().getTime() >= disappearTime) {
                finishQuiz(true); // End quiz due to timeout
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [questions, currentQuestionIndex, quizFinished]);

    const handleSubmitAnswer = () => {
        if (!selectedOption) {
            toast.warn("Please select an answer.");
            return;
        }

        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = !!(selectedOption && selectedOption === currentQuestion.correctAnswer_en);

        const updatedAnswers = [...userAnswers, {
            questionId: currentQuestion.id,
            questionText_en: currentQuestion.text_en,
            questionText_ta: currentQuestion.text_ta,
            userAnswer: selectedOption,
            userAnswer_ta: currentQuestion.options_ta[currentQuestion.options_en.indexOf(selectedOption)],
            correctAnswer: currentQuestion.correctAnswer_en,
            correctAnswer_ta: currentQuestion.correctAnswer_ta,
            // Storing all options for context in review
            options_en: currentQuestion.options_en,
            options_ta: currentQuestion.options_ta,
            isCorrect: isCorrect,
        }];
        setUserAnswers(updatedAnswers);

        setIsAnswered(true); // Show feedback

        if (currentQuestionIndex < questions.length - 1) {
            // Move to the next question after a delay
            setTimeout(() => {
            setIsAnswered(false);
            setSelectedOption(''); // This will be reset by the effect above if needed
                setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            }, 2000); // 2-second delay
        } else {
            // This is the last question, finish the quiz
            setFeedbackMessage("Quiz Finished! Calculating your score...");
            setTimeout(() => finishQuiz(updatedAnswers, false), 2000);
        }
    };

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

    if (completedQuizInfo) {
        return (
            <Alert variant="warning">
                You have already completed this quiz. <Link to={`/user/score/${new Date(completedQuizInfo.date).getTime()}`}>View your score.</Link>
            </Alert>
        );
    }

    if (questions.length === 0 && !loading) {
        return <Alert variant="info">There are no active quizzes available at the moment. Please check back later.</Alert>;
    }

    if (quizFinished) {
        return <Alert Alert variant="success">{feedbackMessage || 'Calculating your results...'}</Alert>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

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
                
                <h5 style={{ wordBreak: 'break-word' }}>{currentQuestion[`text_${lang}`]}</h5>
                
                <Form>
                    {currentQuestion[`options_${lang}`].map((option, index) => {
                        const englishOption = currentQuestion.options_en[index];
                        const isCorrectAnswer = englishOption === currentQuestion.correctAnswer_en;
                        let variant = '';
                        if (isAnswered) {
                            if (isCorrectAnswer) variant = 'success';
                            else if (selectedOption === englishOption) variant = 'danger';
                        }
                        return (
                            <Form.Check
                                key={`${lang}-${index}`}
                                type="radio"
                                id={`option-${index}`}
                                label={option}
                                value={englishOption}
                                checked={selectedOption === englishOption}
                                onChange={(e) => setSelectedOption(e.target.value)}
                                disabled={isAnswered}
                                className={`p-3 rounded mb-2 border ${variant ? `border-${variant} bg-${variant}-subtle` : 'border-light'}`}
                                labelClassName={variant ? `text-${variant}-emphasis` : ''}
                            />
                        );
                    })}
                </Form>
            </Card.Body>
            <Card.Footer className="text-end">
                <Button onClick={handleSubmitAnswer} disabled={isAnswered || !selectedOption}>
                    Submit Answer
                </Button>
            </Card.Footer>
        </Card>
    );
};

export default Quiz;