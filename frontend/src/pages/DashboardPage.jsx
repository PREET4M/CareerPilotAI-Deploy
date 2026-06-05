import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    UploadCloud, History, FileText, Download, Eye, 
    Award, BarChart3, TrendingUp, AlertCircle 
} from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function DashboardPage({ user }) {
    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await apiFetch('/api/history');
                setHistoryList(data);
            } catch (err) {
                setError('Failed to load analysis history.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Calculate quick stats
    const totalScans = historyList.length;
    const avgScore = totalScans > 0 
        ? Math.round(historyList.reduce((sum, item) => sum + item.score, 0) / totalScans) 
        : 0;
    const maxScore = totalScans > 0 
        ? Math.max(...historyList.map(item => item.score)) 
        : 0;

    const getScoreColor = (score) => {
        if (score <= 40) return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
        if (score <= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        if (score <= 80) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    };

    const getReadinessLevel = (score) => {
        if (score <= 40) return 'Beginner';
        if (score <= 60) return 'Developing';
        if (score <= 80) return 'Job Ready';
        return 'Industry Ready';
    };

    const handleDownloadPdf = (e, analysisId) => {
        e.stopPropagation();
        // Open the PDF download link directly in a new tab or trigger a browser download
        window.open(`/api/analysis/${analysisId}/pdf`, '_blank');
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Welcoming Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
                    <p className="text-slate-400 mt-1">Welcome back, <span className="text-brand-secondary font-semibold">{user.username}</span>. Manage your career path evaluations.</p>
                </div>
                <Link 
                    to="/upload" 
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary px-5 py-3 text-sm font-bold text-white shadow-neon-primary hover:opacity-90 transition-opacity self-start sm:self-center"
                >
                    <UploadCloud className="h-4.5 w-4.5" />
                    <span>New Skill Analysis</span>
                </Link>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
                {[
                    { label: "Total Resumes Analyzed", val: totalScans, icon: History, color: "text-brand-secondary" },
                    { label: "Average Match Score", val: `${avgScore}%`, icon: BarChart3, color: "text-brand-primary" },
                    { label: "Highest Readiness Score", val: `${maxScore}%`, icon: Award, color: "text-brand-success" }
                ].map((stat, idx) => {
                    const IconComp = stat.icon;
                    return (
                        <div key={idx} className="glass-panel rounded-2xl p-6 relative overflow-hidden flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-black text-white mt-2 font-display">{stat.val}</p>
                            </div>
                            <div className={`h-12 w-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center ${stat.color}`}>
                                <IconComp className="h-6 w-6" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* History Table */}
            <div className="glass-panel rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                    <h2 className="text-lg font-bold text-white">Evaluation History</h2>
                    <span className="text-xs font-semibold text-slate-400">Showing {totalScans} entries</span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-brand-primary border-white/10" />
                        <p className="text-sm text-slate-400 mt-4">Fetching reports...</p>
                    </div>
                ) : historyList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-4">
                            <FileText className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-white">No resumes scanned yet</h3>
                        <p className="text-sm text-slate-400 max-w-sm mt-1">Upload a PDF resume and select a tech career path to compute your first portfolio gap score.</p>
                        <Link 
                            to="/upload" 
                            className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold text-brand-secondary hover:bg-white/10 mt-6 transition-colors"
                        >
                            <UploadCloud className="h-4 w-4" />
                            <span>Analyze Now</span>
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-slate-950/20 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">Target Career Role</th>
                                    <th className="px-6 py-4">File Name</th>
                                    <th className="px-6 py-4">Date Analyzed</th>
                                    <th className="px-6 py-4 text-center">Score</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {historyList.map((item) => (
                                    <tr 
                                        key={item.id} 
                                        className="hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/result/${item.id}`)}
                                    >
                                        <td className="px-6 py-4 font-bold text-slate-200">
                                            {item.role}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs max-w-[200px] truncate">
                                            {item.filename}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {new Date(item.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${getScoreColor(item.score)}`}>
                                                    {item.score}%
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-semibold mt-1">
                                                    {getReadinessLevel(item.score)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Link 
                                                    to={`/result/${item.id}`}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-brand-primary/10 border border-brand-primary/20 p-2 text-xs font-semibold text-brand-secondary hover:bg-brand-primary/20 transition-colors"
                                                    title="View Analysis"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="hidden md:inline">View</span>
                                                </Link>
                                                <button 
                                                    onClick={(e) => handleDownloadPdf(e, item.id)}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 p-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
                                                    title="Download PDF Report"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    <span className="hidden md:inline">PDF</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
