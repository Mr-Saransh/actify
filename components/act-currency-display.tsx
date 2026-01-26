"use client";

import { EnforcementMetrics } from "@/lib/metrics";

interface ActCurrencyDisplayProps {
    metrics: EnforcementMetrics | null;
    totalScore?: number;
}

export function ActCurrencyDisplay({ metrics, totalScore = 0 }: ActCurrencyDisplayProps) {
    // Provide defaults to prevent hydration mismatch
    const activeScore = metrics?.activeScore ?? 0;
    const scoreChange = metrics?.scoreChangeToday ?? 0;

    return (
        <>
            {/* Desktop View */}
            <div className="hidden md:flex items-center gap-6 font-mono">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Total ACT</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-white">⟁</span>
                        <span className="text-xl font-bold text-white">{totalScore}</span>
                    </div>
                </div>
                <div className="h-8 w-px bg-zinc-800" />
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Active ACT</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-primary">⟁</span>
                        <span className="text-xl font-bold text-primary">{activeScore}</span>
                    </div>
                </div>
            </div>

            {/* Mobile View - Compressed */}
            <div className="md:hidden flex items-center gap-1.5 font-mono text-sm">
                <span className="text-white font-bold">⟁{totalScore}</span>
                <span className="text-zinc-700">|</span>
                <span className={`font-bold ${scoreChange > 0 ? 'text-green-500' : scoreChange < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                    {scoreChange > 0 ? '+' : ''}{scoreChange}
                </span>
            </div>
        </>
    );
}
