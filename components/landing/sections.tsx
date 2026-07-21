"use client";

import { motion } from "framer-motion";
import { SectionReveal, Counter, GlowCard, StaggerReveal, staggerChild, Marquee } from "./animations";
import { Flame, Trophy, Star, Users, MessageSquare, UserPlus, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ─── Leaderboard ────────────────────────────────────────────────
const LEADERS = [
    { name: "Saransh Gupta", points: 2847, streak: 34, rank: 1 },
    { name: "Raghav Gupta", points: 2103, streak: 28, rank: 2 },
    { name: "Ishan", points: 1876, streak: 21, rank: 3 },
    { name: "Khushi Garg", points: 1654, streak: 19, rank: 4 },
    { name: "Muskan Lohani", points: 1432, streak: 16, rank: 5 },
];

export function LeaderboardSection() {
    return (
        <section className="relative py-32 md:py-40 overflow-hidden" style={{ background: "#090909" }}>
            <div className="max-w-4xl mx-auto px-6">
                <SectionReveal className="text-center mb-16">
                    <p className="text-xs tracking-[0.3em] uppercase text-[#FF7A00] font-medium mb-4">Leaderboard</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Top Executors
                    </h2>
                    <p className="text-[#8A8A8A] text-base max-w-md mx-auto">
                        Ranked by verified execution. No fake points. Only real results.
                    </p>
                </SectionReveal>

                <SectionReveal delay={0.2}>
                    <div className="rounded-2xl border border-[#232323] bg-[#111111] overflow-hidden">
                        {/* Header */}
                        <div className="grid grid-cols-[40px_1fr_80px_80px_80px] md:grid-cols-[60px_1fr_100px_100px_100px] px-5 py-3 border-b border-[#1a1a1a] text-[10px] text-[#555] uppercase tracking-wider font-medium">
                            <span>Rank</span>
                            <span>User</span>
                            <span className="text-right">Points</span>
                            <span className="text-right hidden md:block">Streak</span>
                            <span className="text-right">Score</span>
                        </div>

                        {/* Rows */}
                        {LEADERS.map((leader, i) => (
                            <motion.div
                                key={i}
                                className="grid grid-cols-[40px_1fr_80px_80px_80px] md:grid-cols-[60px_1fr_100px_100px_100px] px-5 py-4 border-b border-[#0d0d0d] hover:bg-[#0d0d0d] transition-colors items-center"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 + i * 0.1 }}
                            >
                                <span className={`text-sm font-bold ${i === 0 ? "text-[#FFB800]" : i === 1 ? "text-[#C0C0C0]" : i === 2 ? "text-[#CD7F32]" : "text-[#555]"}`}>
                                    #{leader.rank}
                                </span>
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-[#FF7A00]">
                                        {leader.name.charAt(0)}
                                    </div>
                                    <span className="text-sm text-white font-medium truncate">{leader.name}</span>
                                </div>
                                <span className="text-sm text-[#FF7A00] font-bold text-right tabular-nums">
                                    <Counter target={leader.points} />
                                </span>
                                <span className="text-sm text-[#8A8A8A] text-right hidden md:block">{leader.streak}d 🔥</span>
                                <span className="text-sm text-[#16C784] text-right font-medium">
                                    {(leader.points / 30).toFixed(0)}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </SectionReveal>
            </div>
        </section>
    );
}

// ─── Community ──────────────────────────────────────────────────
export function CommunitySection() {
    return (
        <section className="relative py-32 md:py-40 overflow-hidden" style={{ background: "#0d0d0d" }}>
            <div className="max-w-5xl mx-auto px-6">
                <SectionReveal className="text-center mb-16">
                    <p className="text-xs tracking-[0.3em] uppercase text-[#FF7A00] font-medium mb-4">Community</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Execute Together
                    </h2>
                    <p className="text-[#8A8A8A] text-base max-w-md mx-auto">
                        Connect with like-minded executors. Share missions. Hold each other accountable.
                    </p>
                </SectionReveal>

                <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        { icon: Users, title: "Network", desc: "Build your execution circle with like-minded people." },
                        { icon: MessageSquare, title: "Mission Chat", desc: "Real-time collaboration on shared missions and goals." },
                        { icon: UserPlus, title: "Teams", desc: "Form mission teams and compete on the leaderboard together." },
                    ].map((item, i) => (
                        <motion.div key={i} variants={staggerChild}>
                            <GlowCard>
                                <div className="rounded-2xl border border-[#232323] bg-[#111111] p-6 h-full hover:border-[#333] transition-colors duration-300">
                                    <div className="w-10 h-10 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center mb-4">
                                        <item.icon className="w-5 h-5 text-[#FF7A00]" />
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-sm text-[#8A8A8A] leading-relaxed">{item.desc}</p>
                                </div>
                            </GlowCard>
                        </motion.div>
                    ))}
                </StaggerReveal>
            </div>
        </section>
    );
}

// ─── Testimonials ───────────────────────────────────────────────
const TESTIMONIALS = [
    { name: "Arjun S.", role: "CS Student", text: "ACTIFY forced me to stop procrastinating and actually ship my project. The streak system is addictive." },
    { name: "Priya M.", role: "Researcher", text: "Published my first paper using ACTIFY's mission system. The AI blueprint saved me weeks of planning." },
    { name: "Dev R.", role: "Developer", text: "The proof verification system is genius. No more lying to yourself about progress." },
    { name: "Neha K.", role: "Designer", text: "Earned 2,000 ACT Points in my first month. The leaderboard keeps me pushing harder." },
    { name: "Ravi P.", role: "Entrepreneur", text: "ACTIFY replaced 4 different apps for me. Everything I need for execution in one place." },
    { name: "Ananya T.", role: "Student", text: "The Verified Journeys saved me from wasting time on bad learning paths. Worth every ACT coin." },
];

export function TestimonialsSection() {
    return (
        <section className="relative py-32 md:py-40 overflow-hidden" style={{ background: "#090909" }}>
            <div className="max-w-6xl mx-auto px-6 mb-12">
                <SectionReveal className="text-center">
                    <p className="text-xs tracking-[0.3em] uppercase text-[#FF7A00] font-medium mb-4">Testimonials</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        What Executors Say
                    </h2>
                </SectionReveal>
            </div>

            <Marquee speed={40}>
                {TESTIMONIALS.map((t, i) => (
                    <div key={i} className="w-[320px] shrink-0 rounded-2xl border border-[#232323] bg-[#111111] p-6">
                        <p className="text-sm text-[#8A8A8A] leading-relaxed mb-4">"{t.text}"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-[#FF7A00]">
                                {t.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm text-white font-medium">{t.name}</p>
                                <p className="text-[10px] text-[#555]">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </Marquee>
        </section>
    );
}

// ─── Final CTA ──────────────────────────────────────────────────
export function FinalCTA() {
    return (
        <section className="relative py-32 md:py-48 overflow-hidden" style={{ background: "#090909" }}>
            {/* Orange glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,122,0,0.08) 0%, transparent 50%)" }} />

            <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
                <SectionReveal>
                    <motion.div
                        className="inline-block mb-6"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Flame className="w-10 h-10 text-[#FF7A00]" />
                    </motion.div>

                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.05]">
                        Execution<br />
                        <span className="text-[#FF7A00]">Begins Here.</span>
                    </h2>

                    <p className="text-[#8A8A8A] text-base md:text-lg max-w-lg mx-auto mb-10">
                        Stop dreaming about your goals. Start executing them with AI-powered precision and absolute accountability.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/sign-up"
                            className="inline-flex items-center gap-2 bg-[#FF7A00] hover:bg-[#FF8C1A] text-black font-bold text-base px-10 py-4 rounded-full transition-all duration-300 hover:shadow-[0_0_60px_rgba(255,122,0,0.3)]"
                        >
                            Begin Your First Mission <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </SectionReveal>
            </div>
        </section>
    );
}

// ─── Footer ─────────────────────────────────────────────────────
export function Footer() {
    return (
        <footer className="border-t border-[#1a1a1a] py-8 px-6" style={{ background: "#090909" }}>
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative w-24 h-6">
                        <Image src="/brand-logo.png" alt="ACTIFY" fill unoptimized className="object-contain object-left opacity-50" />
                    </div>
                </div>
                <p className="text-xs text-[#555]">
                    © {new Date().getFullYear()} ACTIFY Execution OS. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                    <a href="#" className="text-xs text-[#555] hover:text-[#8A8A8A] transition-colors">Privacy</a>
                    <a href="#" className="text-xs text-[#555] hover:text-[#8A8A8A] transition-colors">Terms</a>
                    <a href="#" className="text-xs text-[#555] hover:text-[#8A8A8A] transition-colors">Support</a>
                </div>
            </div>
        </footer>
    );
}
