"use client";

import { motion } from "framer-motion";
import { SectionReveal, StaggerReveal, staggerChild, GlowCard } from "./animations";
import { Crosshair, Cpu, PenTool, ShieldCheck, Flame, Upload, Brain, Star, Trophy } from "lucide-react";

const STEPS = [
    { icon: Crosshair, title: "Create Mission", desc: "Define your goal and deadline." },
    { icon: Cpu, title: "AI Creates Blueprint", desc: "AI generates milestones, tasks, and timeline." },
    { icon: PenTool, title: "Review & Edit", desc: "Customize the generated plan to your level." },
    { icon: ShieldCheck, title: "Approve Mission", desc: "Lock in. The protocol begins." },
    { icon: Flame, title: "Execute Daily", desc: "Complete AI-assigned tasks every day." },
    { icon: Upload, title: "Submit Proof", desc: "Upload evidence of completed work." },
    { icon: Brain, title: "AI Validates", desc: "AI verifies your proof with precision." },
    { icon: Star, title: "Earn ACT Points", desc: "Build reputation through real execution." },
    { icon: Trophy, title: "Complete Mission", desc: "Finish and publish your Verified Journey." },
];

export function HowItWorks() {
    return (
        <section className="relative py-32 md:py-40 overflow-hidden" style={{ background: "#0d0d0d" }}>
            <div className="max-w-5xl mx-auto px-6">
                <SectionReveal className="text-center mb-20">
                    <p className="text-xs tracking-[0.3em] uppercase text-[#FF7A00] font-medium mb-4">The Protocol</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        How ACTIFY Works
                    </h2>
                </SectionReveal>

                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-[#1a1a1a] md:-translate-x-px" />

                    <StaggerReveal className="space-y-6 md:space-y-0">
                        {STEPS.map((step, i) => {
                            const isLeft = i % 2 === 0;
                            return (
                                <motion.div
                                    key={i}
                                    variants={staggerChild}
                                    className={`relative flex items-start gap-6 md:gap-0 ${
                                        i > 0 ? "md:mt-[-20px]" : ""
                                    }`}
                                >
                                    {/* Desktop: alternating layout */}
                                    <div className={`hidden md:grid md:grid-cols-[1fr_48px_1fr] w-full items-center`}>
                                        {/* Left content */}
                                        <div className={isLeft ? "pr-8" : ""}>
                                            {isLeft && (
                                                <GlowCard>
                                                    <div className="rounded-xl border border-[#232323] bg-[#111111] p-5 text-right">
                                                        <p className="text-xs text-[#FF7A00] font-mono mb-1">STEP {String(i + 1).padStart(2, "0")}</p>
                                                        <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                                                        <p className="text-sm text-[#8A8A8A]">{step.desc}</p>
                                                    </div>
                                                </GlowCard>
                                            )}
                                        </div>

                                        {/* Center dot */}
                                        <div className="flex justify-center">
                                            <div className="w-10 h-10 rounded-full border-2 border-[#232323] bg-[#111111] flex items-center justify-center z-10 relative">
                                                <step.icon className="w-4 h-4 text-[#FF7A00]" />
                                            </div>
                                        </div>

                                        {/* Right content */}
                                        <div className={!isLeft ? "pl-8" : ""}>
                                            {!isLeft && (
                                                <GlowCard>
                                                    <div className="rounded-xl border border-[#232323] bg-[#111111] p-5">
                                                        <p className="text-xs text-[#FF7A00] font-mono mb-1">STEP {String(i + 1).padStart(2, "0")}</p>
                                                        <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                                                        <p className="text-sm text-[#8A8A8A]">{step.desc}</p>
                                                    </div>
                                                </GlowCard>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mobile: linear layout */}
                                    <div className="md:hidden flex items-start gap-4 w-full">
                                        <div className="w-10 h-10 rounded-full border-2 border-[#232323] bg-[#111111] flex items-center justify-center z-10 shrink-0 relative">
                                            <step.icon className="w-4 h-4 text-[#FF7A00]" />
                                        </div>
                                        <div className="flex-1 rounded-xl border border-[#232323] bg-[#111111] p-4">
                                            <p className="text-[10px] text-[#FF7A00] font-mono mb-1">STEP {String(i + 1).padStart(2, "0")}</p>
                                            <h3 className="text-base font-bold text-white mb-0.5">{step.title}</h3>
                                            <p className="text-xs text-[#8A8A8A]">{step.desc}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </StaggerReveal>
                </div>
            </div>
        </section>
    );
}
