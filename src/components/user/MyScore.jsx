import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Card, Button, Badge, Alert, Table, Spinner } from 'react-bootstrap';
import { getMyPerformance } from '../../services/apiServices'; // Corrected to use the user-specific function

const MyScore = () => {
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useOutletContext(); // Get user from layout context

    useEffect(() => {
        // Ensure we have a valid user with an ID before fetching
        if (currentUser) { // No ID needed for this endpoint
            getMyPerformance()
                .then(data => {
                    // The API returns data, ensure it's an array before setting state
                    if (Array.isArray(data)) {
                        setPerformanceData(data);
                    } else {
                        console.error("Performance data is not an array:", data);
                        setPerformanceData([]); // Default to empty array on error
                    }
                })
                .catch(error => console.error("Failed to fetch performance data:", error))
                .finally(() => setLoading(false));
        } else {
            // Handle case where currentUser is not yet available
            setLoading(false);
        }
    }, [currentUser]); // Re-run when currentUser is available

    if (loading) {
        return (
            <div className="text-center">
                <Spinner animation="border" />
                <p>Loading score history...</p>
            </div>
        );
    }

    if (performanceData.length === 0 && !loading) {
        return <Alert variant="info">You have not completed any quizzes yet. Go to the "Today's Questions" page to start one!</Alert>;
    }

    return (
        <>
            <Card className="shadow-sm">
                <Card.Header as="h4">
                    Monthly Performance for {currentUser.username}
                </Card.Header>
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Average Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {performanceData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.month}</td>
                                    <td>
                                        <Badge bg="info">{item.averageScore.toFixed(2)}%</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </>
    );
};

export default MyScore;