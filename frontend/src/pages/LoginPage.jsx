import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, User, Lock, AlertCircle } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function LoginPage({ setUser }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!username.trim() || !password) {
            setError('Please enter both username and password.');
            return;
        }

        setLoading(true);
        try {
            const data = await apiFetch('/api/login', {
                method: 'POST',
                body: { username, password }
            });
            setUser(data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed. Please verify credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            {/* Ambient Background Glow */}
            <div className="glow-blob w-[350px] h-[350px] bg-brand-primary/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <Link to="/" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-neon-primary mb-4">
                        <Compass className="h-6 w-6 animate-spin-slow" />
                    </Link>
                    <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
                    <p className="mt-2 text-sm text-slate-400">Sign in to your CareerPilot AI workspace</p>
                </div>

                <div className="glass-panel rounded-2xl p-8 border border-white/10 relative overflow-hidden">
                    {/* Decorative Top Glow Bar */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary to-transparent" />

                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-sm text-rose-400">
                            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                                    <User className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="your_username"
                                    className="glass-input w-full pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="glass-input w-full pl-10"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary py-3 text-sm font-bold text-white shadow-neon-primary hover:opacity-90 disabled:opacity-50 transition-opacity mt-6"
                        >
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-white border-white/20" />
                                    <span>Signing In...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-brand-secondary hover:underline">
                        Create one for free
                    </Link>
                </p>
            </div>
        </div>
    );
}
