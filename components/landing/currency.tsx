"use client";

import { motion } from "framer-motion";
import { SectionReveal, GlowCard, Counter } from "./animations";
import { Zap, ShoppingBag, Gift, ArrowRight } from "lucide-react";
import Image from "next/image";

export function CurrencySection() {
    return (
        <section className="relative py-32 md:py-40 overflow-hidden" style={{ background: "#090909" }}>
            {/* Orange glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,122,0,0.05) 0%, transparent 60%)" }} />

            <div className="max-w-5xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left: visual */}
                    <SectionReveal>
                        <div className="relative flex items-center justify-center">
                            {/* Currency visual */}
                            <motion.div
                                className="relative w-72 h-40 md:w-[420px] md:h-52 rounded-2xl border border-[#232323] bg-[#0d0d0d] overflow-hidden shadow-2xl"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Image
                                    src="/act-currency.jpg"
                                    alt="ACT Currency"
                                    fill
                                    unoptimized
                                    className="object-contain p-3"
                                />
                            </motion.div>
                            {/* Floating badge */}
                            <motion.div
                                className="absolute -bottom-4 -right-2 md:-right-8 bg-[#111111] border border-[#232323] rounded-xl px-4 py-3 shadow-xl"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 }}
                            >
                                <p className="text-xs text-[#555]">Total Earned</p>
                                <p className="text-lg font-bold text-[#FF7A00]">
                                    <Counter target={12480} />
                                </p>
                            </motion.div>
                        </div>
                    </SectionReveal>

                    {/* Right: text */}
                    <SectionReveal delay={0.2}>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs tracking-[0.3em] uppercase text-[#FF7A00] font-medium mb-4">ACT Currency</p>
                                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                                    Earned Through Execution
                                </h2>
                                <p className="text-[#8A8A8A] text-base leading-relaxed">
                                    ACT Currency is the reward for real work. Complete tasks, verify proofs, and build your balance. No shortcuts.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { icon: Zap, label: "Complete verified tasks to earn", value: "+10–50 per task" },
                                    { icon: ShoppingBag, label: "Spend in the ACT Store", value: "Power-ups & merch" },
                                    { icon: Gift, label: "Unlock Verified Journeys", value: "Learn from the best" },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex items-center gap-4 rounded-xl border border-[#232323] bg-[#111111] p-4 hover:border-[#333] transition-colors duration-300"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-[#FF7A00]/10 flex items-center justify-center shrink-0">
                                            <item.icon className="w-4 h-4 text-[#FF7A00]" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-white font-medium">{item.label}</p>
                                            <p className="text-xs text-[#555]">{item.value}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </SectionReveal>
                </div>
            </div>
        </section>
    );
}
