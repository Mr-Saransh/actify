
"use client";

import { EnforcementMetrics } from "@/lib/metrics";
import { Gauge, AlertOctagon, TrendingUp, ShieldCheck } from "lucide-react";

interface RiskForecastProps {
    metrics: EnforcementMetrics;
}

export function RiskForecast({ metrics }: RiskForecastProps) {
    const isDanger = metrics.failureMargin === 'DANGER';
    const isCaution = metrics.failureMargin === 'CAUTION';

    return (
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-3 md:p-4 font-mono text-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3 md:mb-4 text-zinc-400 font-bold uppercase tracking-widest border-b border-zinc-800 pb-2">
                <Gauge className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">Risk Forecast</span>
            </div>

            <div className="space-y-3 md:space-y-4">
                {/* Status Banner */}
                <div className={`
                    p-3 rounded border text-center uppercase font-bold tracking-widest text-xs
                    ${isDanger ? 'bg-red-950/30 border-red-900 text-red-500 animate-pulse' :
                        isCaution ? 'bg-yellow-950/30 border-yellow-900 text-yellow-500' :
                            'bg-green-950/30 border-green-900 text-green-500'}
                `}>
                    {isDanger ? 'CRITICAL RISK - FAILURE IMMINENT' :
                        isCaution ? 'CAUTION - BUFFER THIN' :
                            'SYSTEM NOMINAL - ON TRACK'}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] text-zinc-500 uppercase flex items-center gap-1 mb-1">
                            <ShieldCheck className="h-3 w-3" /> Buffer
                        </p>
                        <p className={`text-xl font-bold ${metrics.bufferDays < 0 ? 'text-red-500' : 'text-white'}`}>
                            {metrics.bufferDays > 0 ? '+' : ''}{metrics.bufferDays} <span className="text-xs font-normal text-zinc-600">Days</span>
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] text-zinc-500 uppercase flex items-center gap-1 mb-1">
                            <TrendingUp className="h-3 w-3" /> 7-Day Rate
                        </p>
                        <p className="text-xl font-bold text-white">
                            {metrics.onTimeRate7Days}% <span className="text-xs font-normal text-zinc-600">On Time</span>
                        </p>
                    </div>
                </div>

                {/* 7 Day Execution Count */}
                <div className="pt-2 border-t border-zinc-900">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 uppercase">Recent Activity</span>
                        <span className="text-white font-bold">{metrics.daysExecuted7Days} <span className="text-zinc-600">/ 7 Days</span></span>
                    </div>
                    {/* Visual Dots for last 7 days could go here, but strictly following 'no new complexity' constraint unless requested. sticking to text. */}
                </div>
            </div>

            {/* Analysis Footer */}
            <div className="pt-4 mt-auto border-t border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">System Audit</span>
                <p className={`text-xs italic ${isDanger ? 'text-red-400' : isCaution ? 'text-yellow-400' : 'text-green-400'}`}>
                    "{isDanger
                        ? "Buffer depleted. Probability of failure near certainty without immediate correction."
                        : isCaution
                            ? "Buffer verifying thin. Minor deviation will result in critical path failure."
                            : "Buffer verified. Operational contingencies available."
                    }"
                </p>
            </div>
        </div >
    );
}
