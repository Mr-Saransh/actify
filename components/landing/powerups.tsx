"use client";

import { motion } from "framer-motion";
import { SectionReveal, GlowCard, StaggerReveal, staggerChild } from "./animations";
import { Snowflake, Zap, Lock, Sparkles } from "lucide-react";
import Image from "next/image";

const POWERUPS = [
    {
        id: "freeze",
        name: "Liquid Freeze",
        desc: "Pause the punishment clock once. Life happens — this protects your streak.",
        icon: "/liquid-freeze.png",
        cost: 15,
        available: true,
    },
    {
        id: "beyond",
        name: "Beyond ACT",
        desc: "Bypass the daily task limit. Complete additional tasks and earn bonus points.",
        icon: "/beyond-act.png",
        cost: 10,
        available: true,
    },
    {
        id: "future1",
        name: "Time Warp",
        desc: "Reschedule a milestone deadline without penalty. Strategic flexibility.",
        icon: null,
        cost: null,
        available: false,
    },
    {
        id: "future2",
        name: "Double XP",
        desc: "Earn 2x ACT Points for 24 hours. Maximize high-performance days.",
        icon: null,
        cost: null,
        available: false,
    },
];

export function PowerUpsSection() {
    return (
        <section className="relative py-32 md:py-40 overflow-hidden" style={{ background: "#0d0d0d" }}>
            <div className="max-w-5xl mx-auto px-6">
                <SectionReveal className="text-center mb-16">
                    <p className="text-xs tracking-[0.3em] uppercase text-[#FF7A00] font-medium mb-4">Power-Ups</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Strategic Advantages
                    </h2>
                    <p className="text-[#8A8A8A] text-base max-w-lg mx-auto">
                        Spend your earned currency on tactical power-ups that give you an edge.
                    </p>
                </SectionReveal>

                <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {POWERUPS.map((p, i) => (
                        <motion.div key={i} variants={staggerChild}>
                            <GlowCard>
                                <motion.div
                                    className={`rounded-2xl border border-[#232323] bg-[#111111] p-6 h-full flex flex-col relative overflow-hidden group ${
                                        !p.available ? "opacity-50" : ""
                                    }`}
                                    whileHover={p.available ? { y: -4 } : {}}
                                    transition={{ duration: 0.2 }}
                                >
                                    {!p.available && (
                                        <div className="absolute inset-0 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                            <div className="flex items-center gap-1.5 bg-[#111111]/80 px-3 py-1.5 rounded-full border border-[#232323]">
                                                <Lock className="w-3 h-3 text-[#555]" />
                                                <span className="text-[10px] text-[#555] font-medium">Coming Soon</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        {p.icon ? (
                                            <div className="relative w-12 h-12">
                                                <Image src={p.icon} alt={p.name} fill unoptimized className="object-contain" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
                                                <Sparkles className="w-5 h-5 text-[#333]" />
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-base font-bold text-white mb-1">{p.name}</h3>
                                    <p className="text-xs text-[#8A8A8A] leading-relaxed flex-1">{p.desc}</p>

                                    {p.cost && (
                                        <div className="mt-4 pt-3 border-t border-[#1a1a1a] flex items-center justify-between">
                                            <span className="text-xs text-[#FF7A00] font-bold">{p.cost} ACT</span>
                                            <span className="text-[10px] text-[#16C784]">Available</span>
                                        </div>
                                    )}
                                </motion.div>
                            </GlowCard>
                        </motion.div>
                    ))}
                </StaggerReveal>
            </div>
        </section>
    );
}
