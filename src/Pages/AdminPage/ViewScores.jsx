import React, { useState, useEffect } from 'react';
import { Card, Form, Table, Badge, Button, Alert, Modal, Row, Col, InputGroup, Spinner } from 'react-bootstrap';

// Translations for the report generator
const translations = {
    en: {
        correctAnswers: "Correctly Answered",
        wrongAnswers: "Wrongly Answered",
    },
    ta: {
        correctAnswers: "சரியாக பதிலளித்தவை",
        wrongAnswers: "தவறாக பதிலளித்தவை",
    }
};

const ViewScores = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [userHistory, setUserHistory] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);

    useEffect(() => {
        const allUsers = JSON.parse(localStorage.getItem("quizUsers")) || [];
        setUsers(allUsers);
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            const history = JSON.parse(localStorage.getItem(`quizHistory_${selectedUserId}`)) || [];
            setUserHistory(history.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } else {
            setUserHistory([]);
        }
    }, [selectedUserId]);

    const handleViewAnswersClick = (result) => {
        setSelectedResult(result);
        setShowModal(true);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    const generateReportHTML = (result, filterType) => {
        const t = translations['en']; // Admin view defaults to English for report generation
        const isCorrect = filterType === 'correct';
        const title = isCorrect ? t.correctAnswers : t.wrongAnswers;
        const answersToDisplay = result.answers.filter(a => a.isCorrect === isCorrect);

        const answerItems = answersToDisplay.map((answer, i) => {
            const questionHTML = `<p class="question-text"><b>Q${i + 1}:</b> ${answer.questionText_en}</p><p class="question-text tamil">${answer.questionText_ta}</p>`;
            if (isCorrect) {
                return `<div class="card correct"><div class="card-body">${questionHTML}<p class="answer-text correct-text">Answer: ${answer.userAnswer}</p><p class="answer-text correct-text tamil">பதில்: ${answer.userAnswer_ta}</p></div></div>`;
            } else {
                return `<div class="card wrong"><div class="card-body">${questionHTML}<p class="answer-text wrong-text">User's Answer: ${answer.userAnswer}</p><p class="answer-text wrong-text tamil">பயனர் பதில்: ${answer.userAnswer_ta}</p><p class="answer-text info-text">Correct Answer: ${answer.correctAnswer}</p><p class="answer-text info-text tamil">சரியான பதில்: ${answer.correctAnswer_ta}</p></div></div>`;
            }
        }).join('');

        return `<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:sans-serif;padding:20px;background-color:#f8f9fa;color:#212529;transition:background-color .3s,color .3s}.container{max-width:800px;margin:auto;background:#fff;padding:20px;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,0.1);transition:background-color .3s}.card{border:1px solid #ddd;border-radius:5px;margin-bottom:15px;transition:border-color .3s}.card.correct{border-left:5px solid #198754}.card.wrong{border-left:5px solid #dc3545}.card-body{padding:15px}.tamil{font-style:italic;color:#6c757d}.correct-text{color:#198754}.wrong-text{color:#dc3545}.info-text{color:#0dcaf0}@media(prefers-color-scheme:dark){body{background-color:#212529;color:#dee2e6}.container{background-color:#343a40;box-shadow:0 0 10px rgba(255,255,255,0.1)}.card{border-color:#495057}.tamil{color:#adb5bd}}</style></head><body><div class="container"><h1>${title}</h1><h2>Quiz on: ${formatDateTime(result.date)}</h2><hr>${answersToDisplay.length > 0 ? answerItems : `<p>No answers in this category.</p>`}</div></body></html>`;
    };

    const handleViewReport = (filterType) => {
        if (!selectedResult) return;
        const htmlContent = generateReportHTML(selectedResult, filterType);
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.open();
            newWindow.document.write(htmlContent);
            newWindow.document.close();
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const userStats = selectedUserId && userHistory.length > 0 ? {
        quizzesTaken: userHistory.length,
        averageScore: (userHistory.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / userHistory.length * 100).toFixed(1),
    } : null;

    return (
        <>
            <Card className="shadow-sm">
                <Card.Header as="h5">View User Scores</Card.Header>
                <Card.Body>
                    <Row className="align-items-stretch">
                        <Col md={6} className="mb-3 mb-md-0">
                            <Form.Group className="mb-3">
                                <Form.Label>Search and Select a User</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                                    <Form.Control type="text" placeholder="Type to search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </InputGroup>
                            </Form.Group>
                            <Form.Select onChange={(e) => setSelectedUserId(e.target.value)} value={selectedUserId}>
                                <option value="">-- Select a user --</option>
                                {filteredUsers.map(user => (
                                    <option key={user.userId} value={user.userId}>{user.username}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        {userStats && (
                            <Col md={6}>
                                <Card bg="body-tertiary" className="h-100">
                                    <Card.Body className="text-center">
                                        <Card.Title>{users.find(u => u.userId === selectedUserId)?.username}'s Stats</Card.Title>
                                        <Row>
                                            <Col>
                                                <p className="mb-0">Quizzes Taken</p>
                                                <p className="fs-3 fw-bold">{userStats.quizzesTaken}</p>
                                            </Col>
                                            <Col>
                                                <p className="mb-0">Average Score</p>
                                                <p className="fs-3 fw-bold">{userStats.averageScore}%</p>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}
                    </Row>

                    {selectedUserId && (
                        <div className="mt-4">
                            {userHistory.length > 0 ? (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Quiz Date</th>
                                            <th>Score</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userHistory.map((result, index) => (
                                            <tr key={index}>
                                                <td>{formatDateTime(result.date)}</td>
                                                <td><Badge bg="primary">{result.score}</Badge> / <Badge bg="secondary">{result.total}</Badge></td>
                                                <td>
                                                    <Button variant="info" size="sm" onClick={() => handleViewAnswersClick(result)}>
                                                        View Answers
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <Alert variant="info" className="mt-3">This user has not completed any quizzes yet.</Alert>
                            )}
                        </div>
                    )}
                </Card.Body>
            </Card>

            {selectedResult && (
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Answer Review for {users.find(u => u.userId === selectedUserId)?.username}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="bg-body-tertiary">
                        <p>Select a category to view the questions and answers in a new tab.</p>
                        <div className="d-grid gap-2">
                            <Button variant="outline-success" onClick={() => handleViewReport('correct')}>
                                <i className="bi bi-check-circle-fill me-2"></i>
                                View Correctly Answered ({selectedResult.answers.filter(a => a.isCorrect).length})
                            </Button>
                            <Button variant="outline-danger" onClick={() => handleViewReport('wrong')}>
                                <i className="bi bi-x-circle-fill me-2"></i>
                                View Wrongly Answered ({selectedResult.answers.filter(a => !a.isCorrect).length})
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>
            )}
        </>
    );
};

export default ViewScores