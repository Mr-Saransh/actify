
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
        <div className="bg-card border border-border rounded-lg p-3 md:p-4 font-mono text-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3 md:mb-4 text-muted-foreground font-bold uppercase tracking-widest border-b border-border pb-2">
                <Gauge className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">Risk Forecast</span>
            </div>

            <div className="space-y-3 md:space-y-4">
                {/* Status Banner */}
                <div className={`
                    p-3 rounded border text-center uppercase font-bold tracking-widest text-xs
                    ${isDanger ? 'bg-destructive/10 border-destructive text-destructive animate-pulse' :
                        isCaution ? 'bg-yellow-500/10 border-yellow-500 text-yellow-600' :
                            'bg-green-500/10 border-green-500 text-green-600'}
                `}>
                    {isDanger ? 'CRITICAL RISK - FAILURE IMMINENT' :
                        isCaution ? 'CAUTION - BUFFER THIN' :
                            'SYSTEM NOMINAL - ON TRACK'}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 mb-1">
                            <ShieldCheck className="h-3 w-3" /> Buffer
                        </p>
                        <p className={`text-xl font-bold ${metrics.bufferDays < 0 ? 'text-destructive' : 'text-foreground'}`}>
                            {metrics.bufferDays > 0 ? '+' : ''}{metrics.bufferDays} <span className="text-xs font-normal text-muted-foreground">Days</span>
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 mb-1">
                            <TrendingUp className="h-3 w-3" /> 7-Day Rate
                        </p>
                        <p className="text-xl font-bold text-foreground">
                            {metrics.onTimeRate7Days}% <span className="text-xs font-normal text-muted-foreground">On Time</span>
                        </p>
                    </div>
                </div>

                {/* 7 Day Execution Count */}
                <div className="pt-2 border-t border-border">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground uppercase">Recent Activity</span>
                        <span className="text-foreground font-bold">{metrics.daysExecuted7Days} <span className="text-muted-foreground">/ 7 Days</span></span>
                    </div>
                </div>
            </div>

            {/* Analysis Footer */}
            <div className="pt-4 mt-auto border-t border-border">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">System Audit</span>
                <p className={`text-xs italic ${isDanger ? 'text-destructive/80' : isCaution ? 'text-yellow-500/80' : 'text-green-500/80'}`}>
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
