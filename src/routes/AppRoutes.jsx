import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import LoginPage  from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import HomePage   from '../pages/HomePage';

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/home"   element={
                <ProtectedRoute>
                <HomePage />
                </ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}