"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, ChevronDown } from "lucide-react";
import { MouseFollower, GridBackground, Particles, MagneticButton, Counter, TiltCard } from "./animations";

export function HeroSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springMouseX = useSpring(mouseX, { damping: 40, stiffness: 100 });
    const springMouseY = useSpring(mouseY, { damping: 40, stiffness: 100 });

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            mouseX.set((e.clientX / innerWidth - 0.5) * 30);
            mouseY.set((e.clientY / innerHeight - 0.5) * 30);
        };
        window.addEventListener("mousemove", handler);
        return () => window.removeEventListener("mousemove", handler);
    }, [mouseX, mouseY]);

    return (
        <section ref={sectionRef} className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: "#090909" }}>
            <GridBackground />
            <Particles />

            {/* Radial glow behind hero */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(255,122,0,0.06) 0%, transparent 70%)" }} />

            {/* Navigation */}
            <motion.nav
                className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <div className="relative w-32 h-8 md:w-40 md:h-10">
                    <Image src="/brand-logo.png" alt="ACTIFY" fill unoptimized className="object-contain object-left" priority />
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/sign-in" className="hidden sm:inline-flex text-sm text-[#8A8A8A] hover:text-white transition-colors px-4 py-2">
                        Sign In
                    </Link>
                    <MagneticButton href="/sign-up" className="inline-flex items-center gap-2 bg-[#FF7A00] hover:bg-[#FF8C1A] text-black text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,122,0,0.3)]">
                        Begin Mission <ArrowRight className="w-4 h-4" />
                    </MagneticButton>
                </div>
            </motion.nav>

            {/* Hero Content */}
            <motion.div
                className="relative z-10 flex-1 flex items-center px-6 md:px-12"
                style={{ y: heroY, opacity: heroOpacity }}
            >
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left: Text */}
                    <div className="space-y-8">
                        <motion.div
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#232323] text-xs tracking-[0.2em] uppercase text-[#8A8A8A]"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-pulse" />
                            AI Execution Operating System
                        </motion.div>

                        <div className="space-y-2">
                            <motion.h1
                                className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-[-0.03em] leading-[0.95] text-white"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                            >
                                Stop Planning.
                            </motion.h1>
                            <motion.h1
                                className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-[-0.03em] leading-[0.95]"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.65, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                                style={{ color: "#FF7A00" }}
                            >
                                Start Executing.
                            </motion.h1>
                        </div>

                        <motion.p
                            className="text-base md:text-lg text-[#8A8A8A] max-w-lg leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                        >
                            The world's first AI Execution Operating System. Turn any goal into an AI-generated mission with adaptive execution, proof verification, and verified learning journeys.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.95, duration: 0.6 }}
                        >
                            <MagneticButton href="/sign-up" className="inline-flex items-center justify-center gap-2 bg-[#FF7A00] hover:bg-[#FF8C1A] text-black font-bold text-base px-8 py-4 rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,122,0,0.25)]">
                                Begin Mission <ArrowRight className="w-4 h-4" />
                            </MagneticButton>
                            <MagneticButton className="inline-flex items-center justify-center gap-2 border border-[#232323] hover:border-[#444] text-white font-medium text-base px-8 py-4 rounded-full transition-all duration-300 cursor-pointer">
                                <Play className="w-4 h-4" /> Watch Demo
                            </MagneticButton>
                        </motion.div>

                        <motion.p
                            className="text-xs text-[#555] tracking-wide"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.6 }}
                        >
                            Trusted by ambitious students, developers, researchers, and creators.
                        </motion.p>
                    </div>

                    {/* Right: Dashboard Mockup */}
                    <motion.div
                        className="hidden lg:block"
                        initial={{ opacity: 0, x: 60, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: 0.8, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        <TiltCard className="relative">
                            <motion.div
                                style={{ x: springMouseX, y: springMouseY }}
                                className="rounded-2xl border border-[#232323] bg-[#111111] p-1 shadow-2xl shadow-black/50 overflow-hidden"
                            >
                                {/* Mock browser chrome */}
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF4D4F]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#FFB800]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#16C784]" />
                                    </div>
                                    <div className="flex-1 mx-4 h-5 rounded-md bg-[#1a1a1a] max-w-[200px]" />
                                </div>

                                {/* Mock dashboard */}
                                <div className="p-4 space-y-4">
                                    {/* Hero banner */}
                                    <div className="h-20 rounded-xl bg-gradient-to-r from-[#FF7A00]/20 to-[#FF7A00]/5 border border-[#FF7A00]/10 flex items-center px-5">
                                        <div className="space-y-1.5">
                                            <div className="h-3 w-28 bg-white/20 rounded" />
                                            <div className="h-2 w-40 bg-white/10 rounded" />
                                        </div>
                                    </div>

                                    {/* Stat cards */}
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { label: "ACT Points", value: "1,247", color: "#FF7A00" },
                                            { label: "Currency", value: "580", color: "#16C784" },
                                            { label: "Streak", value: "12d", color: "#FFB800" },
                                            { label: "Rank", value: "#4", color: "#8B5CF6" },
                                        ].map((s, i) => (
                                            <motion.div
                                                key={i}
                                                className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-3"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 1.2 + i * 0.15 }}
                                            >
                                                <p className="text-[9px] text-[#555] mb-1">{s.label}</p>
                                                <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Mission progress */}
                                    <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-[#8A8A8A]">Mission: Learn System Design</p>
                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#FF7A00]/15 text-[#FF7A00]">Active</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FF9A40]"
                                                initial={{ width: 0 }}
                                                animate={{ width: "67%" }}
                                                transition={{ delay: 1.5, duration: 1.2, ease: "easeOut" }}
                                            />
                                        </div>
                                        <p className="text-[9px] text-[#555]">67% complete · 12 days remaining</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating notification */}
                            <motion.div
                                className="absolute -top-4 -right-4 bg-[#111111] border border-[#232323] rounded-xl px-4 py-3 shadow-xl shadow-black/40"
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 1.8, duration: 0.5 }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#16C784] animate-pulse" />
                                    <p className="text-[11px] text-white font-medium">Proof Verified</p>
                                </div>
                                <p className="text-[9px] text-[#555] mt-0.5">+15 ACT Points earned</p>
                            </motion.div>

                            {/* Floating streak badge */}
                            <motion.div
                                className="absolute -bottom-3 -left-6 bg-[#111111] border border-[#232323] rounded-xl px-4 py-2.5 shadow-xl shadow-black/40"
                                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 2, duration: 0.5 }}
                                // Gentle floating
                            >
                                <p className="text-[11px] font-semibold text-[#FFB800]">🔥 12-Day Streak</p>
                            </motion.div>
                        </TiltCard>
                    </motion.div>
                </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.6 }}
            >
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <ChevronDown className="w-5 h-5 text-[#555]" />
                </motion.div>
            </motion.div>
        </section>
    );
}
