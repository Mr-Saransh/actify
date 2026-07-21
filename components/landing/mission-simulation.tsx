"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionReveal, TypingText } from "./animations";
import { Cpu, GitBranch, BarChart3, Clock, Zap } from "lucide-react";

const EXAMPLE_GOAL = "I want to publish a GIS research paper";

const MILESTONES = [
    { title: "Literature Review & Gap Analysis", days: "Days 1–14", difficulty: "Medium" },
    { title: "Research Methodology Design", days: "Days 15–21", difficulty: "Hard" },
    { title: "Data Collection & Processing", days: "Days 22–42", difficulty: "Hard" },
    { title: "Analysis & Results", days: "Days 43–56", difficulty: "Very Hard" },
    { title: "Paper Writing & Peer Review", days: "Days 57–75", difficulty: "Medium" },
    { title: "Journal Submission & Revisions", days: "Days 76–90", difficulty: "Medium" },
];

export function MissionSimulation() {
    const [isActive, setIsActive] = useState(false);
    const [showBlueprint, setShowBlueprint] = useState(false);
    const [visibleMilestones, setVisibleMilestones] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isActive) {
                    setIsActive(true);
                    // After "typing", show blueprint
                    setTimeout(() => setShowBlueprint(true), EXAMPLE_GOAL.length * 50 + 800);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [isActive]);

    useEffect(() => {
        if (!showBlueprint) return;
        const interval = setInterval(() => {
            setVisibleMilestones((prev) => {
                if (prev >= MILESTONES.length) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 400);
        return () => clearInterval(interval);
    }, [showBlueprint]);

    return (
        <section ref={ref} className="relative py-32 md:py-40 overflow-hidden" style={{ background: "#090909" }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,122,0,0.03) 0%, transparent 60%)" }} />

            <div className="max-w-5xl mx-auto px-6">
                <SectionReveal className="text-center mb-16">
                    <p className="text-xs tracking-[0.3em] uppercase text-[#FF7A00] font-medium mb-4">Mission Simulation</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        Watch AI Build Your Blueprint
                    </h2>
                </SectionReveal>

                {/* Terminal */}
                <SectionReveal delay={0.2}>
                    <div className="rounded-2xl border border-[#232323] bg-[#111111] overflow-hidden shadow-2xl shadow-black/50">
                        {/* Chrome */}
                        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1a1a1a]">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#FF4D4F]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#FFB800]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#16C784]" />
                            </div>
                            <p className="text-[11px] text-[#555] font-mono">ACTIFY — Mission Control</p>
                        </div>

                        <div className="p-6 md:p-8">
                            {/* Input */}
                            <div className="mb-6">
                                <p className="text-xs text-[#555] mb-2 font-mono">MISSION_OBJECTIVE</p>
                                <div className="rounded-xl border border-[#232323] bg-[#0d0d0d] px-5 py-4">
                                    <p className="text-white text-base md:text-lg font-medium min-h-[28px]">
                                        {isActive ? (
                                            <TypingText text={EXAMPLE_GOAL} />
                                        ) : (
                                            <span className="text-[#333]">Enter your goal...</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Blueprint */}
                            <AnimatePresence>
                                {showBlueprint && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        transition={{ duration: 0.5 }}
                                        className="space-y-6"
                                    >
                                        {/* Status line */}
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                className="w-2 h-2 rounded-full bg-[#16C784]"
                                                animate={{ scale: [1, 1.3, 1] }}
                                                transition={{ duration: 1, repeat: 3 }}
                                            />
                                            <p className="text-sm text-[#16C784] font-mono">Blueprint Generated</p>
                                        </div>

                                        {/* Stats row */}
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                            {[
                                                { icon: GitBranch, label: "Milestones", value: "6" },
                                                { icon: Clock, label: "Duration", value: "90 days" },
                                                { icon: BarChart3, label: "Difficulty", value: "Hard" },
                                                { icon: Zap, label: "Daily Hours", value: "2–3h" },
                                                { icon: Cpu, label: "Success Rate", value: "78%" },
                                            ].map((stat, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-3"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 + i * 0.1 }}
                                                >
                                                    <stat.icon className="w-3.5 h-3.5 text-[#555] mb-1.5" />
                                                    <p className="text-xs text-[#555]">{stat.label}</p>
                                                    <p className="text-sm font-bold text-white">{stat.value}</p>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Milestones */}
                                        <div className="space-y-2">
                                            <p className="text-xs text-[#555] font-mono mb-3">MILESTONE_SEQUENCE</p>
                                            {MILESTONES.map((m, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="flex items-center gap-4 rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] px-5 py-3"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={i < visibleMilestones ? { opacity: 1, x: 0 } : {}}
                                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                                    style={{ opacity: i < visibleMilestones ? undefined : 0 }}
                                                >
                                                    <div className="w-6 h-6 rounded-full border border-[#232323] flex items-center justify-center text-[10px] font-bold text-[#FF7A00] shrink-0">
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-white truncate">{m.title}</p>
                                                        <p className="text-[11px] text-[#555]">{m.days}</p>
                                                    </div>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                                                        m.difficulty === "Very Hard" ? "bg-[#FF4D4F]/10 text-[#FF4D4F]" :
                                                        m.difficulty === "Hard" ? "bg-[#FFB800]/10 text-[#FFB800]" :
                                                        "bg-[#16C784]/10 text-[#16C784]"
                                                    }`}>
                                                        {m.difficulty}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </SectionReveal>
            </div>
        </section>
    );
}
