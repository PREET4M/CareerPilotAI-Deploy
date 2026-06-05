import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Compass, CheckCircle2, ShieldCheck, Sparkles, 
    BookOpen, FileText, ArrowRight, TrendingUp 
} from 'lucide-react';

export default function LandingPage({ user }) {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const floatVariants = {
        animate: {
            y: [0, -10, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
            {/* Ambient Background Blur Blobs */}
            <div className="glow-blob w-[400px] h-[400px] bg-brand-primary/10 top-20 -left-20 animate-pulse-slow" />
            <div className="glow-blob w-[500px] h-[500px] bg-brand-secondary/10 bottom-20 -right-20 animate-pulse-slow" />

            <div className="container mx-auto max-w-7xl">
                {/* Hero Section */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center pt-8 sm:pt-16"
                >
                    {/* Hero Text */}
                    <div className="lg:col-span-7 flex flex-col justify-center text-left">
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-4 py-1.5 text-xs font-semibold text-brand-secondary shadow-neon-secondary mb-6 w-fit">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Empowering Tech Careers with Smart Analytics</span>
                        </motion.div>

                        <motion.h1 
                            variants={itemVariants} 
                            className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]"
                        >
                            Navigate Your Path to <br />
                            <span className="bg-gradient-to-r from-brand-secondary via-indigo-400 to-brand-primary bg-clip-text text-transparent">
                                Industry-Ready
                            </span> Success
                        </motion.h1>

                        <motion.p 
                            variants={itemVariants} 
                            className="mt-6 text-base text-slate-400 sm:text-lg max-w-2xl"
                        >
                            Upload your resume, select your target tech role, and receive instant detailed skills gap analyses, curated courses, and personalized roadmaps to make yourself career-ready.
                        </motion.p>

                        <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-4">
                            <Link 
                                to={user ? "/upload" : "/register"}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-3.5 text-base font-bold text-white shadow-neon-primary hover:opacity-90 transition-all duration-200"
                            >
                                {user ? "Analyze Your Resume" : "Create Free Account"}
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link 
                                to="/login" 
                                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-base font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                Learn More
                            </Link>
                        </motion.div>
                    </div>

                    {/* Hero Graphic - Interactive Floating Dashboard Panel */}
                    <motion.div 
                        variants={floatVariants}
                        animate="animate"
                        className="lg:col-span-5 flex justify-center lg:justify-end"
                    >
                        <div className="glass-panel w-full max-w-md rounded-3xl p-6 relative overflow-hidden border border-white/10">
                            {/* Decorative Glow Line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-secondary to-transparent" />
                            
                            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                    <span className="text-xs font-semibold text-slate-400">Analysis Preview</span>
                                </div>
                                <span className="text-xs font-bold text-brand-secondary bg-brand-primary/20 border border-brand-primary/30 px-2.5 py-0.5 rounded-full">
                                    Software Engineer
                                </span>
                            </div>

                            <div className="flex flex-col items-center py-6">
                                <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/5 bg-slate-900/50 shadow-inner">
                                    {/* Visual score dial */}
                                    <svg className="absolute top-0 left-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                                        <circle cx="50" cy="50" r="42" stroke="#4f46e5" strokeWidth="6" fill="transparent" strokeDasharray="263.8" strokeDashoffset="52" strokeLinecap="round" />
                                    </svg>
                                    <div className="flex flex-col items-center">
                                        <span className="text-3xl font-extrabold text-white">80</span>
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500">Readiness</span>
                                    </div>
                                </div>
                                <span className="mt-4 text-sm font-bold text-emerald-400">Job Ready</span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400 font-semibold">Matched Skills (12)</span>
                                        <span className="text-emerald-400 font-bold">80%</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {["Python", "Git", "SQL", "Docker", "REST APIs"].map((s, idx) => (
                                            <span key={idx} className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400 font-semibold">Skill Gaps (3)</span>
                                        <span className="text-rose-400 font-bold">20%</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {["Kubernetes", "CI/CD", "System Design"].map((s, idx) => (
                                            <span key={idx} className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Features Section */}
                <div className="mt-24 sm:mt-32">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                            Tailored Insights for Modern Tech Roles
                        </h2>
                        <p className="mt-4 text-slate-400">
                            We analyze your profile specifically for target demands in high-growth developer, analysis, and cloud environments.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: FileText,
                                title: "Smart Resume Parsing",
                                desc: "Understands layouts, formats, and handles image-only files with optical character extraction fallbacks.",
                                color: "from-blue-500/20 to-blue-500/5"
                            },
                            {
                                icon: TrendingUp,
                                title: "Gap Analysis Score",
                                desc: "Aligns your skills against required keywords, scoring your progress on visual Readiness Levels.",
                                color: "from-emerald-500/20 to-emerald-500/5"
                            },
                            {
                                icon: BookOpen,
                                title: "Curated Curriculums",
                                desc: "Picks specific courses and books matching your missing items, routing you straight to growth resources.",
                                color: "from-indigo-500/20 to-indigo-500/5"
                            },
                            {
                                icon: ShieldCheck,
                                title: "Printable Reports",
                                desc: "Generates custom printable PDF evaluation reports compiled via ReportLab to download and save.",
                                color: "from-cyan-500/20 to-cyan-500/5"
                            }
                        ].map((feat, idx) => {
                            const IconComp = feat.icon;
                            return (
                                <div key={idx} className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden flex flex-col">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 border border-white/5 text-brand-secondary mb-5">
                                        <IconComp className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed flex-1">{feat.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-24 sm:mt-32 mb-16">
                    <div className="glass-panel rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-white/10 text-center max-w-4xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/10 via-transparent to-brand-secondary/5 pointer-events-none" />
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                            Ready to Pilot Your Career Journey?
                        </h2>
                        <p className="mt-4 text-slate-400 max-w-xl mx-auto">
                            Upload your resume, find your gaps, and build your specialized tech skill roadmap today. It takes less than 30 seconds.
                        </p>
                        <div className="mt-8 flex justify-center">
                            <Link 
                                to={user ? "/upload" : "/register"}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-3.5 text-base font-bold text-white shadow-neon-primary hover:opacity-90 transition-opacity"
                            >
                                Get Started Now
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
