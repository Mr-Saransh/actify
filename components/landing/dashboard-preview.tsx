"use client";

import { motion } from "framer-motion";
import { SectionReveal, Counter, GlowCard, TiltCard } from "./animations";
import { Target, BarChart3, Clock, Trophy, Zap, CheckCircle2 } from "lucide-react";

export function DashboardPreview() {
    return (
        <section className="relative py-32 md:py-40 overflow-hidden" style={{ background: "#090909" }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,122,0,0.02) 0%, transparent 60%)" }} />

            <div className="max-w-6xl mx-auto px-6">
                <SectionReveal className="text-center mb-16">
                    <p className="text-xs tracking-[0.3em] uppercase text-[#FF7A00] font-medium mb-4">Command Center</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Your Execution Dashboard
                    </h2>
                    <p className="text-[#8A8A8A] text-base max-w-lg mx-auto">
                        Everything you need to track, validate, and accelerate your missions — all in one view.
                    </p>
                </SectionReveal>

                <SectionReveal delay={0.2}>
                    <TiltCard>
                        <div className="rounded-2xl border border-[#232323] bg-[#111111] p-1 shadow-2xl shadow-black/60 overflow-hidden">
                            {/* Browser chrome */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF4D4F]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFB800]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#16C784]" />
                                </div>
                                <div className="flex-1 mx-4 h-5 rounded-md bg-[#1a1a1a] max-w-[200px]" />
                            </div>

                            <div className="flex">
                                {/* Sidebar */}
                                <div className="hidden md:flex w-48 border-r border-[#1a1a1a] flex-col p-4 gap-1">
                                    {["Dashboard", "Protocol", "History", "Leaderboard", "Store", "Profile"].map((item, i) => (
                                        <div key={i} className={`px-3 py-2 rounded-lg text-xs ${i === 0 ? "bg-[#FF7A00]/10 text-[#FF7A00] font-medium" : "text-[#555]"}`}>
                                            {item}
                                        </div>
                                    ))}
                                </div>

                                {/* Main content */}
                                <div className="flex-1 p-5 space-y-4">
                                    {/* Hero banner */}
                                    <motion.div
                                        className="rounded-xl bg-gradient-to-r from-[#FF7A00]/15 to-[#FF7A00]/5 border border-[#FF7A00]/10 p-5"
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-[#FF7A00] mb-1">Today's Mission</p>
                                                <p className="text-white font-semibold text-sm">Complete Chapter 5 analysis</p>
                                                <p className="text-[10px] text-[#555] mt-1">Due in 6 hours · Milestone 3/6</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-[#FF7A00] px-3 py-1.5 rounded-lg text-xs font-bold text-black">
                                                <Zap className="w-3 h-3" /> Execute
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { label: "ACT Points", value: 1247, icon: Trophy, color: "#FF7A00" },
                                            { label: "Streak", value: 12, icon: Target, color: "#FFB800", suffix: "d" },
                                            { label: "Tasks Done", value: 89, icon: CheckCircle2, color: "#16C784" },
                                            { label: "Rank", value: 4, icon: BarChart3, color: "#8B5CF6", prefix: "#" },
                                        ].map((stat, i) => (
                                            <motion.div
                                                key={i}
                                                className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-3"
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.4 + i * 0.1 }}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-[10px] text-[#555]">{stat.label}</p>
                                                    <stat.icon className="w-3 h-3" style={{ color: stat.color }} />
                                                </div>
                                                <p className="text-xl font-bold" style={{ color: stat.color }}>
                                                    <Counter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Timeline + Activity */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <motion.div
                                            className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4 space-y-3"
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            <p className="text-xs text-[#555] font-medium">Mission Progress</p>
                                            {[
                                                { label: "Literature Review", pct: 100 },
                                                { label: "Methodology", pct: 100 },
                                                { label: "Data Collection", pct: 67 },
                                                { label: "Analysis", pct: 0 },
                                            ].map((m, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between text-[10px]">
                                                        <span className="text-[#8A8A8A]">{m.label}</span>
                                                        <span className={m.pct === 100 ? "text-[#16C784]" : "text-[#555]"}>{m.pct}%</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="h-full rounded-full"
                                                            style={{ background: m.pct === 100 ? "#16C784" : "#FF7A00" }}
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${m.pct}%` }}
                                                            viewport={{ once: true }}
                                                            transition={{ delay: 0.8 + i * 0.15, duration: 0.8 }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>

                                        <motion.div
                                            className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4 space-y-3"
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.7 }}
                                        >
                                            <p className="text-xs text-[#555] font-medium">Recent Activity</p>
                                            {[
                                                { action: "Proof verified", points: "+15", status: "success" },
                                                { action: "Task completed", points: "+10", status: "success" },
                                                { action: "Milestone reached", points: "+50", status: "success" },
                                                { action: "New task assigned", points: "", status: "neutral" },
                                            ].map((a, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${a.status === "success" ? "bg-[#16C784]" : "bg-[#555]"}`} />
                                                    <p className="text-xs text-[#8A8A8A] flex-1">{a.action}</p>
                                                    {a.points && <span className="text-[10px] font-bold text-[#16C784]">{a.points}</span>}
                                                </div>
                                            ))}
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TiltCard>
                </SectionReveal>
            </div>
        </section>
    );
}
