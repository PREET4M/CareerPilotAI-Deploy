import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { apiFetch } from './utils/api';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ResultPage from './pages/ResultPage';

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await apiFetch('/api/me');
                if (data.logged_in) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("Auth check failed:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-brand-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-brand-primary border-brand-primary/20" />
                    <h2 className="font-display font-medium text-slate-300">Loading CareerPilot AI...</h2>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <div className="flex min-h-screen flex-col bg-brand-dark">
                <Navbar user={user} setUser={setUser} />
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<LandingPage user={user} />} />
                        <Route 
                            path="/login" 
                            element={user ? <Navigate to="/dashboard" replace /> : <LoginPage setUser={setUser} />} 
                        />
                        <Route 
                            path="/register" 
                            element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage setUser={setUser} />} 
                        />
                        <Route 
                            path="/dashboard" 
                            element={user ? <DashboardPage user={user} /> : <Navigate to="/login" replace />} 
                        />
                        <Route 
                            path="/upload" 
                            element={user ? <UploadPage /> : <Navigate to="/login" replace />} 
                        />
                        <Route 
                            path="/result/:id" 
                            element={user ? <ResultPage /> : <Navigate to="/login" replace />} 
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}
