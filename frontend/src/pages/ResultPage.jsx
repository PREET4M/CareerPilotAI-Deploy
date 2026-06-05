import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    Download, LayoutDashboard, Award, Sparkles, BookOpen, 
    Calendar, CheckCircle2, HelpCircle, AlertTriangle, ArrowLeft,
    ChevronDown, ChevronUp 
} from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function ResultPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedPhase, setExpandedPhase] = useState(0); // Accordion state for roadmap

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const result = await apiFetch(`/api/analysis/${id}`);
                setData(result);
            } catch (err) {
                setError(err.message || 'Failed to load analysis results.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-brand-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-brand-secondary border-brand-secondary/20" />
                    <h2 className="font-display font-medium text-slate-300">Retrieving audit results...</h2>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
                <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-6">
                    <AlertTriangle className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-2">Analysis Not Found</h2>
                <p className="text-slate-400 mb-8">{error || "The requested audit report could not be found or access was denied."}</p>
                <Link 
                    to="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Dashboard</span>
                </Link>
            </div>
        );
    }

    const { score, readiness_level, role, filename, matched_skills, missing_skills, learning_resources, roadmap, engine } = data;

    // Determine colors and advice depending on readiness levels
    const getLevelConfig = (lvl) => {
        switch (lvl) {
            case 'Beginner':
                return {
                    color: 'text-rose-400',
                    ring: 'stroke-rose-500',
                    bg: 'bg-rose-500/10 border-rose-500/20',
                    advice: "You are starting your journey! Focus on acquiring foundational skills and core concepts for this path. Set aside dedicated time daily for practice."
                };
            case 'Developing':
                return {
                    color: 'text-amber-400',
                    ring: 'stroke-amber-500',
                    bg: 'bg-amber-500/10 border-amber-500/20',
                    advice: "You have built several key core skills. Work on integrating these techniques in full-stack or mock pipelines, and study architectural systems."
                };
            case 'Job Ready':
                return {
                    color: 'text-cyan-400',
                    ring: 'stroke-cyan-500',
                    bg: 'bg-cyan-500/10 border-cyan-500/20',
                    advice: "You are well-prepared for junior or entry-level roles! Build a solid, comprehensive capstone project showing integration across your matched skill set."
                };
            case 'Industry Ready':
                return {
                    color: 'text-emerald-400',
                    ring: 'stroke-emerald-500',
                    bg: 'bg-emerald-500/10 border-emerald-500/20',
                    advice: "Outstanding! Your profile covers the core modern requirements. Focus on polishing your portfolio projects, contributing to open-source, and mock interview practice."
                };
            default:
                return {
                    color: 'text-slate-400',
                    ring: 'stroke-slate-500',
                    bg: 'bg-slate-500/10 border-slate-500/20',
                    advice: "Keep scanning resumes to monitor your development over time!"
                };
        }
    };

    const lvlConfig = getLevelConfig(readiness_level);
    
    // Circle SVG math
    const radius = 60;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const handleDownloadPdf = () => {
        window.open(`/api/analysis/${id}/pdf`, '_blank');
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-6 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link to="/dashboard" className="text-slate-500 hover:text-white transition-colors">
                            <LayoutDashboard className="h-4 w-4" />
                        </Link>
                        <span className="text-slate-600 font-bold">/</span>
                        <span className="text-xs font-semibold text-brand-secondary bg-brand-primary/20 px-2.5 py-0.5 rounded-full border border-brand-primary/20">
                            Report #{id}
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white">Skills Audit Result</h1>
                    <p className="text-slate-400 text-sm mt-1">Target: <span className="text-slate-200 font-semibold">{role}</span> • Source: <span className="font-mono text-xs text-slate-500">{filename}</span></p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleDownloadPdf}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary px-5 py-3 text-sm font-bold text-white shadow-neon-primary hover:opacity-90 transition-opacity"
                    >
                        <Download className="h-4.5 w-4.5" />
                        <span>Download PDF Report</span>
                    </button>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <LayoutDashboard className="h-4.5 w-4.5" />
                        <span>Dashboard</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
                
                {/* Left Side: Score & Skills Grid (Col-Span 7) */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* Score Summary Banner */}
                    <div className="glass-panel rounded-3xl p-6 border border-white/10 relative overflow-hidden grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary to-transparent" />
                        
                        {/* Circular progress display */}
                        <div className="sm:col-span-4 flex justify-center">
                            <div className="relative h-40 w-40 flex items-center justify-center rounded-full bg-slate-950/40 border border-white/5 shadow-inner">
                                <svg className="absolute top-0 left-0 h-full w-full -rotate-90" viewBox="0 0 150 150">
                                    <circle 
                                        cx="75" cy="75" r={radius} 
                                        stroke="rgba(255,255,255,0.02)" strokeWidth={strokeWidth} 
                                        fill="transparent" 
                                    />
                                    <circle 
                                        cx="75" cy="75" r={radius} 
                                        stroke={readiness_level === 'Beginner' ? '#ef4444' : readiness_level === 'Developing' ? '#f59e0b' : readiness_level === 'Job Ready' ? '#06b6d4' : '#10b981'}
                                        strokeWidth={strokeWidth} 
                                        fill="transparent" 
                                        strokeDasharray={circumference} 
                                        strokeDashoffset={strokeDashoffset} 
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="flex flex-col items-center">
                                    <span className="text-4xl font-black text-white font-display leading-none">{score}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-1">Audit Score</span>
                                </div>
                            </div>
                        </div>

                        {/* Text summary and advice */}
                        <div className="sm:col-span-8 space-y-3 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Readiness Index</h3>
                                <span className={`inline-flex px-3 py-0.5 rounded-full text-xs font-extrabold border w-fit mx-auto sm:mx-0 ${lvlConfig.bg} ${lvlConfig.color}`}>
                                    {readiness_level}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-200">
                                {score >= 80 ? "Superb Core Coverage!" : score >= 60 ? "Ready for Entry-Level Applications" : "Step-by-Step Expansion Required"}
                            </h2>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {lvlConfig.advice}
                            </p>
                        </div>
                    </div>

                    {/* Side-by-Side Skills lists */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Matched Skills */}
                        <div className="glass-panel rounded-2xl p-5 border border-white/10 relative overflow-hidden flex flex-col min-h-[250px]">
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500/20" />
                            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                                    <span>Matched Skills ({matched_skills.length})</span>
                                </h3>
                                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                    {matched_skills.length > 0 ? Math.round((matched_skills.length / (matched_skills.length + missing_skills.length)) * 100) : 0}%
                                </span>
                            </div>
                            {matched_skills.length === 0 ? (
                                <p className="text-xs text-slate-500 my-auto text-center">No matching skills detected in your profile.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2 content-start flex-1">
                                    {matched_skills.map((skill, idx) => (
                                        <span key={idx} className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl shadow-inner">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Missing Skills */}
                        <div className="glass-panel rounded-2xl p-5 border border-white/10 relative overflow-hidden flex flex-col min-h-[250px]">
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-rose-500/20" />
                            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <AlertTriangle className="h-4.5 w-4.5 text-rose-400" />
                                    <span>Missing Skills ({missing_skills.length})</span>
                                </h3>
                                <span className="text-xs font-extrabold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                                    {missing_skills.length > 0 ? Math.round((missing_skills.length / (matched_skills.length + missing_skills.length)) * 100) : 0}%
                                </span>
                            </div>
                            {missing_skills.length === 0 ? (
                                <p className="text-xs text-slate-500 my-auto text-center">Congratulations! You've matched all required skills for this role.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2 content-start flex-1">
                                    {missing_skills.map((skill, idx) => (
                                        <span key={idx} className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-xl shadow-inner">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resources section */}
                    <div className="glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-secondary to-transparent" />
                        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                            <BookOpen className="h-5 w-5 text-brand-secondary" />
                            <span>Recommended Learning Pathways</span>
                        </h3>
                        {learning_resources.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-6">No specific learning resources required.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {learning_resources.map((res, idx) => (
                                    <div key={idx} className="bg-slate-950/40 border border-white/5 p-4 rounded-xl flex flex-col justify-between hover:border-white/10 transition-colors">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                                                    {res.type}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-200 mb-1 leading-snug">{res.name}</h4>
                                            <p className="text-xs text-slate-400 leading-relaxed mb-4">{res.desc}</p>
                                        </div>
                                        <a 
                                            href={res.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-brand-secondary hover:text-white flex items-center gap-1 mt-auto w-fit"
                                        >
                                            <span>Start Learning</span>
                                            <span>→</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Collapsible Roadmap Phases (Col-Span 5) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-panel rounded-3xl p-6 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary to-transparent" />
                        
                        <div className="border-b border-white/5 pb-4 mb-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-brand-primary animate-pulse" />
                                <span>Personalized 12-Week Roadmap</span>
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Step-by-step career path acceleration plan</p>
                        </div>

                        {roadmap.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-6">No roadmap generated.</p>
                        ) : (
                            <div className="space-y-3">
                                {roadmap.map((phase, idx) => {
                                    const isExpanded = expandedPhase === idx;
                                    return (
                                        <div 
                                            key={idx}
                                            className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                                                isExpanded 
                                                    ? 'border-brand-primary/40 bg-brand-primary/5 shadow-neon-primary' 
                                                    : 'border-white/5 bg-slate-900/10 hover:border-white/10'
                                            }`}
                                        >
                                            {/* Phase Accordion Header */}
                                            <button
                                                onClick={() => setExpandedPhase(isExpanded ? null : idx)}
                                                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                                            >
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-secondary">
                                                        {phase.duration || `Phase ${idx+1}`}
                                                    </span>
                                                    <h4 className="text-sm font-bold text-slate-200 leading-snug">
                                                        {phase.phase}
                                                    </h4>
                                                </div>
                                                <div className="text-slate-500 hover:text-white transition-colors">
                                                    {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                                                </div>
                                            </button>

                                            {/* Phase Accordion Body */}
                                            {isExpanded && (
                                                <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
                                                    <p className="text-xs text-slate-400 leading-relaxed">
                                                        {phase.description}
                                                    </p>
                                                    
                                                    <div>
                                                        <h5 className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest mb-1.5">Action Items</h5>
                                                        <ul className="space-y-1.5">
                                                            {phase.topics.map((topic, tIdx) => (
                                                                <li key={tIdx} className="flex items-start gap-2 text-xs text-slate-300 leading-normal">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-brand-secondary mt-1.5 shrink-0" />
                                                                    <span>{topic}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Metadata summary */}
                    <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex justify-between items-center text-xs text-slate-500">
                        <span>Analysis Engine:</span>
                        <span className="font-semibold text-slate-400">{engine}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
