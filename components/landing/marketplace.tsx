"use client";

import { motion } from "framer-motion";
import { SectionReveal, GlowCard, StaggerReveal, staggerChild } from "./animations";
import { Star, Clock, BookOpen, Users, ShieldCheck, Download } from "lucide-react";

const JOURNEYS = [
    {
        title: "Learn React",
        creator: "Saransh Gupta",
        days: 34,
        rating: 5,
        reviews: 127,
        tags: ["Verified", "Proof Included"],
        color: "#3B82F6",
    },
    {
        title: "GIS Research Paper",
        creator: "Research Lab",
        days: 90,
        rating: 5,
        reviews: 43,
        tags: ["Verified", "Resources Included", "Timeline Included"],
        color: "#16C784",
    },
    {
        title: "System Design Mastery",
        creator: "Engineering Team",
        days: 60,
        rating: 4,
        reviews: 89,
        tags: ["Verified", "Proof Included"],
        color: "#8B5CF6",
    },
];

export function MarketplaceSection() {
    return (
        <section className="relative py-32 md:py-40 overflow-hidden" style={{ background: "#0d0d0d" }}>
            <div className="max-w-6xl mx-auto px-6">
                <SectionReveal className="text-center mb-16">
                    <p className="text-xs tracking-[0.3em] uppercase text-[#FF7A00] font-medium mb-4">Marketplace</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Verified Learning Journeys
                    </h2>
                    <p className="text-[#8A8A8A] text-base max-w-lg mx-auto">
                        Buy proven execution paths from people who have already completed the mission.
                    </p>
                </SectionReveal>

                <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {JOURNEYS.map((j, i) => (
                        <motion.div key={i} variants={staggerChild}>
                            <GlowCard>
                                <div className="rounded-2xl border border-[#232323] bg-[#111111] p-6 h-full flex flex-col group hover:border-[#333] transition-colors duration-300">
                                    {/* Top badge */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${j.color}15` }}>
                                                <BookOpen className="w-4 h-4" style={{ color: j.color }} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{j.title}</p>
                                                <p className="text-[10px] text-[#555]">by {j.creator}</p>
                                            </div>
                                        </div>
                                        <ShieldCheck className="w-4 h-4 text-[#16C784]" />
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {j.tags.map((tag, ti) => (
                                            <span key={ti} className="text-[9px] px-2 py-0.5 rounded-full border border-[#232323] text-[#8A8A8A]">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 mt-auto pt-4 border-t border-[#1a1a1a]">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-[#555]" />
                                            <span className="text-[11px] text-[#8A8A8A]">{j.days} Days</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-[#FFB800] fill-[#FFB800]" />
                                            <span className="text-[11px] text-[#8A8A8A]">{j.rating}.0 ({j.reviews})</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Download className="w-3 h-3 text-[#555]" />
                                            <span className="text-[11px] text-[#8A8A8A]">{j.reviews}+</span>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <motion.button
                                        className="mt-4 w-full py-2.5 rounded-lg border border-[#232323] bg-[#0d0d0d] text-white text-sm font-medium hover:border-[#FF7A00] hover:text-[#FF7A00] transition-all duration-300"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        View Journey
                                    </motion.button>
                                </div>
                            </GlowCard>
                        </motion.div>
                    ))}
                </StaggerReveal>
            </div>
        </section>
    );
}
