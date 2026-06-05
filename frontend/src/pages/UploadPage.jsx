import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    UploadCloud, FileText, ChevronRight, AlertCircle, 
    Compass, Sparkles, Server, CheckCircle2 
} from 'lucide-react';
import { apiFetch } from '../utils/api';

const CAREER_ROLES = [
    "Software Engineer",
    "Data Scientist",
    "Cybersecurity Analyst",
    "UI UX Designer",
    "Cloud Engineer"
];

export default function UploadPage() {
    const [role, setRole] = useState(CAREER_ROLES[0]);
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progressStep, setProgressStep] = useState(0);
    const [error, setError] = useState('');
    
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Multi-step upload status triggers
    const steps = [
        "Uploading resume PDF...",
        "Extracting structure and text content...",
        "Identifying core skill sets and matches...",
        "Drafting customized study roadmap...",
        "Finalizing analysis report..."
    ];

    const runProgressSimulation = () => {
        setProgressStep(0);
        const interval = setInterval(() => {
            setProgressStep((prev) => {
                if (prev >= steps.length - 1) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 1500);
        return interval;
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        setError('');

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        setError('');
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
            setError('Only PDF resumes are supported.');
            setFile(null);
            return;
        }
        
        // Limit file size to 10MB
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size exceeds 10MB limit.');
            setFile(null);
            return;
        }
        
        setFile(selectedFile);
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !role) {
            setError('Please select a career role and upload a PDF resume.');
            return;
        }

        setLoading(true);
        setError('');
        const progressInterval = runProgressSimulation();

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('role', role);

        try {
            const result = await apiFetch('/api/analyze', {
                method: 'POST',
                body: formData
                // Note: apiFetch handles FormData and excludes Content-Type so the browser sets it with boundaries
            });
            clearInterval(progressInterval);
            navigate(`/result/${result.id}`);
        } catch (err) {
            clearInterval(progressInterval);
            setError(err.message || 'An error occurred during evaluation.');
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] px-4 py-12 sm:px-6 lg:px-8">
            {/* Ambient Background Blur Blobs */}
            <div className="glow-blob w-[300px] h-[300px] bg-brand-primary/10 top-10 left-10" />
            <div className="glow-blob w-[400px] h-[400px] bg-brand-secondary/10 bottom-10 right-10" />

            <div className="container mx-auto max-w-3xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-white">Skill Gap Analysis</h1>
                    <p className="text-slate-400 mt-2">Compare your resume against industry demands in standard developer, data, and design roles.</p>
                </div>

                {error && (
                    <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-400">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    /* Loading State Card */
                    <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden text-center">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-secondary to-transparent animate-pulse" />
                        
                        <div className="flex flex-col items-center justify-center py-10">
                            {/* Animated Scanner Radar */}
                            <div className="relative h-24 w-24 mb-8 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-4 border-dashed border-brand-secondary animate-spin-slow opacity-30" />
                                <div className="absolute h-16 w-16 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-secondary shadow-neon-secondary">
                                    <Compass className="h-8 w-8 animate-pulse" />
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-2">Analyzing Resume</h3>
                            <p className="text-brand-secondary font-semibold text-sm mb-6 h-6 animate-fade">
                                {steps[progressStep]}
                            </p>
                            
                            {/* Visual Progress Bar */}
                            <div className="w-full max-w-md bg-slate-900/60 border border-white/5 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-brand-primary to-brand-secondary h-full rounded-full transition-all duration-500 ease-out shadow-neon-primary"
                                    style={{ width: `${((progressStep + 1) / steps.length) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs text-slate-500 font-bold mt-2">
                                Step {progressStep + 1} of {steps.length}
                            </span>
                        </div>
                    </div>
                ) : (
                    /* Upload Input Form */
                    <form onSubmit={handleUpload} className="space-y-6">
                        {/* Target Role Dropdown */}
                        <div className="glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary to-transparent" />
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                                Select Target Career Role
                            </label>
                            <div className="relative">
                                <select 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="glass-input w-full appearance-none pr-10 cursor-pointer font-bold"
                                >
                                    {CAREER_ROLES.map((r, idx) => (
                                        <option key={idx} value={r} className="bg-slate-950 text-slate-100 font-semibold">
                                            {r}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500">
                                    <ChevronRight className="h-4 w-4 rotate-90" />
                                </div>
                            </div>
                        </div>

                        {/* File Upload Dropzone */}
                        <div 
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            onClick={triggerFileInput}
                            className={`glass-panel rounded-3xl p-8 sm:p-12 border-2 border-dashed transition-all duration-200 cursor-pointer text-center relative overflow-hidden group ${
                                dragActive 
                                    ? 'border-brand-secondary bg-brand-secondary/5' 
                                    : 'border-white/10 hover:border-white/20'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            
                            <div className="flex flex-col items-center justify-center">
                                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-secondary mb-4 group-hover:scale-105 transition-transform duration-200 shadow-neon-secondary">
                                    <UploadCloud className="h-8 w-8" />
                                </div>
                                
                                {file ? (
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold text-white max-w-[260px] sm:max-w-md truncate font-mono text-sm">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-brand-success font-semibold flex items-center justify-center gap-1">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            <span>Ready to analyze ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-lg font-bold text-white mb-1">Drag and drop your resume PDF</h3>
                                        <p className="text-sm text-slate-400">or click to browse local files</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-4">Only PDF resumes supported • Max 10MB</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!file}
                            className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary py-4 text-base font-bold text-white shadow-neon-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            <Sparkles className="h-5 w-5" />
                            <span>Run Skills Audit</span>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
