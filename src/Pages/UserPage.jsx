import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from '../components/user/UserLayout';
import Home from '../components/user/Home';
import UserDashboard from '../components/user/UserDashboard';
import Quiz from '../components/user/Quiz';
import PerformanceHistory from '../components/user/PerformanceHistory';
import ScoreDetail from '../components/user/ScoreDetail';

const UserPage = ({ currentUser, onLogout }) => {
    return (
        <Routes>
            <Route element={<UserLayout currentUser={currentUser} onLogout={onLogout} />}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<Home />} />
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="quiz" element={<Quiz />} />
                <Route path="score" element={<PerformanceHistory />} />
                <Route path="score/:date" element={<ScoreDetail />} />
                <Route path="*" element={<Navigate to="home" replace />} />
            </Route>
        </Routes>
    );
};

export default UserPage;