import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, ProgressBar, Alert, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

const Quiz = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');
    const [userAnswers, setUserAnswers] = useState([]);
    const [isAnswered, setIsAnswered] = useState(false);
    const [quizFinished, setQuizFinished] = useState(false);
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    // This function will be called to end the quiz, either by completion or timeout.
    const finishQuiz = (isTimeout = false) => {
        setQuizFinished(true);

        if (isTimeout) {
            toast.warn("Time is up! Calculating score for answered questions.");
        } else {
            toast.success("Quiz completed! Navigating to your score...");
        }

        const finalScore = userAnswers.filter(a => a.isCorrect).length;
        const quizResult = {
            score: finalScore,
            total: questions.length,
            answers: userAnswers,
            date: new Date().toISOString(),
        };
        // Save to a history array instead of overwriting
        const history = JSON.parse(localStorage.getItem(`quizHistory_${currentUser.userId}`)) || [];
        history.unshift(quizResult); // Add new result to the beginning of the array
        localStorage.setItem(`quizHistory_${currentUser.userId}`, JSON.stringify(history));
        window.dispatchEvent(new Event('storageUpdated')); // Notify dashboard of new score

        setTimeout(() => navigate('/score'), 2500);
    };

    useEffect(() => {
        // Fetch and filter questions
        const allQuestions = JSON.parse(localStorage.getItem("quizQuestions")) || [];
        const now = new Date();
        const activeQuestions = allQuestions.filter(q => {
            const release = new Date(q.releaseDate);
            const disappear = new Date(q.disappearDate);
            return q.status === 'published' && now >= release && now < disappear;
        });
        setQuestions(activeQuestions);

        // Prevent user from leaving the page
        const handleBeforeUnload = (e) => {
            if (!quizFinished) {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave? Your quiz progress will be lost.';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [quizFinished]); // Rerun if quizFinished changes to remove the listener

    useEffect(() => {
        // Block browser back navigation during the quiz
        const blockBackNavigation = (e) => {
            window.history.pushState(null, '', window.location.href);
            toast.warn("You cannot go back during the quiz. Please complete it first.");
        };

        if (!quizFinished) {
            window.history.pushState(null, '', window.location.href);
            window.addEventListener('popstate', blockBackNavigation);
        }

        return () => {
            window.removeEventListener('popstate', blockBackNavigation);
        };
    }, [quizFinished]); // Rerun if quizFinished changes to remove the listener
    
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
        const isCorrect = selectedOption === currentQuestion.correctAnswer_en;

        const updatedAnswers = [...userAnswers, {
            questionId: currentQuestion.id,
            questionText: currentQuestion.text_en,
            userAnswer: selectedOption,
            correctAnswer: currentQuestion.correctAnswer_en,
            isCorrect: isCorrect,
        }];
        setUserAnswers(updatedAnswers);

        setIsAnswered(true); // Show feedback

        // Automatically move to the next question or finish
        setTimeout(() => {
            setIsAnswered(false);
            setSelectedOption('');

            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            } else {
                finishQuiz(false); // End quiz normally
            }
        }, 2500); // 2.5-second delay to show feedback
    };

    if (questions.length === 0) {
        return <Alert variant="info">There are no active quizzes available at the moment. Please check back later.</Alert>;
    }

    if (quizFinished) {
        // This state is now handled by the final navigation
        return <Alert variant="success">Calculating your results...</Alert>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <Card className="shadow-lg">
            <Card.Header>
                <Card.Title>Today's Quiz</Card.Title>
                <ProgressBar now={progress} label={`${currentQuestionIndex + 1}/${questions.length}`} />
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col md={6}>
                        <h5>{currentQuestion.text_en}</h5>
                        <Form>
                            {currentQuestion.options_en.map((option, index) => {
                                const isCorrectAnswer = option === currentQuestion.correctAnswer_en;
                                let variant = '';
                                if (isAnswered) {
                                    if (isCorrectAnswer) variant = 'success';
                                    else if (option === selectedOption) variant = 'danger';
                                }
                                return (
                                    <Form.Check
                                        key={`en-${index}`}
                                        type="radio"
                                        id={`en-option-${index}`}
                                        label={option}
                                        value={option}
                                        checked={selectedOption === option}
                                        onChange={(e) => setSelectedOption(e.target.value)}
                                        disabled={isAnswered}
                                        className={`p-2 rounded mb-2 border-${variant} bg-${variant}-subtle`}
                                    />
                                );
                            })}
                        </Form>
                    </Col>
                    <Col md={6}>
                        <h5 className="text-muted">{currentQuestion.text_ta}</h5>
                        <div className="mt-4 pt-1" style={{ cursor: isAnswered ? 'default' : 'pointer' }}>
                            {currentQuestion.options_ta.map((option, index) => {
                                const correspondingEnglishOption = currentQuestion.options_en[index];
                                return (
                                    <div key={`ta-${index}`} className={`p-2 mb-2 text-muted rounded ${selectedOption === correspondingEnglishOption ? 'bg-info-subtle' : ''}`} onClick={() => !isAnswered && setSelectedOption(correspondingEnglishOption)}>{option}</div>
                                );
                            })}
                        </div>
                    </Col>
                </Row>
            </Card.Body>
            <Card.Footer className="text-end">
                <Button onClick={handleSubmitAnswer} disabled={isAnswered}>
                    Submit Answer
                </Button>
            </Card.Footer>
        </Card>
    );
};

export default Quiz;