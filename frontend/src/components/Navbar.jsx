import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, LogOut, LayoutDashboard, UploadCloud, User } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function Navbar({ user, setUser }) {
    const navigate = useNavigate();
    const location = useLocation();
    
    const handleLogout = async () => {
        try {
            await apiFetch('/api/logout', { method: 'POST' });
            setUser(null);
            navigate('/');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/60 backdrop-blur-md">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-neon-primary group-hover:scale-105 transition-transform duration-200">
                        <Compass className="h-5 w-5 animate-spin-slow" />
                    </div>
                    <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                        CareerPilot <span className="text-brand-secondary font-extrabold">AI</span>
                    </span>
                </Link>

                {/* Navigation Links */}
                <nav className="flex items-center gap-4 sm:gap-6">
                    {user ? (
                        <>
                            <Link 
                                to="/dashboard" 
                                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                                    isActive('/dashboard') ? 'text-brand-secondary' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                            
                            <Link 
                                to="/upload" 
                                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                                    isActive('/upload') ? 'text-brand-secondary' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <UploadCloud className="h-4 w-4" />
                                <span className="hidden sm:inline">Analyze Resume</span>
                            </Link>

                            <div className="h-4 w-px bg-white/10" />

                            {/* User Avatar Card */}
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                                <User className="h-3.5 w-3.5 text-brand-secondary" />
                                <span className="text-xs font-semibold text-slate-300 max-w-[100px] truncate">
                                    {user.username}
                                </span>
                            </div>

                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link 
                                to="/login" 
                                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link 
                                to="/register" 
                                className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-2 text-sm font-semibold text-white shadow-neon-primary hover:opacity-90 transition-opacity"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
