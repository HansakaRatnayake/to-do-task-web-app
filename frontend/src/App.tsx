import React from 'react';
import {Routes, Route, Navigate, HashRouter} from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import VerificationPage from './pages/VerificationPage.tsx';
import Dashboard from './pages/Dashboard.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider } from './utils/toast/toastService.tsx';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return user ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return user ? <Navigate to="/dashboard" /> : <>{children}</>;
}

function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <HashRouter>
                    <div className="App">
                        <Routes>
                            <Route path="/" element={<Navigate to="/home" replace />} />
                            <Route path="/home" element={<HomePage />} />
                            <Route path="/login" element={
                                <PublicRoute>
                                    <LoginPage />
                                </PublicRoute>
                            } />
                            <Route path="/signup" element={
                                <PublicRoute>
                                    <SignupPage />
                                </PublicRoute>
                            } />
                            <Route path="/verify" element={<VerificationPage />} />
                            <Route path="/dashboard" element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </div>
                </HashRouter>
            </AuthProvider>
        </ToastProvider>

    );
}

export default App;