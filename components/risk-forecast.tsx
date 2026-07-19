import { EnforcementMetrics } from "@/lib/metrics";
import { Gauge, TrendingUp, ShieldCheck, ShieldAlert, Activity } from "lucide-react";

interface RiskForecastProps {
    metrics: EnforcementMetrics;
}

export function RiskForecast({ metrics }: RiskForecastProps) {
    const isDanger = metrics.failureMargin === 'DANGER';
    const isCaution = metrics.failureMargin === 'CAUTION';

    return (
        <div className="relative overflow-hidden bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-5 md:p-6 font-sans flex flex-col justify-between group hover:border-blue-500/50 transition-all duration-500 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)]">
            
            <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4 relative z-10">
                <div className="flex items-center gap-2 text-blue-500">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Gauge className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Risk Forecast</span>
                </div>
            </div>

            <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-center">
                {/* Status Banner */}
                <div className={`
                    p-4 rounded-xl border text-center uppercase font-bold tracking-widest text-[10px] sm:text-xs transition-all duration-500 shadow-inner
                    ${isDanger ? 'bg-destructive/10 border-destructive/30 text-destructive shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]' :
                        isCaution ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[inset_0_0_20px_rgba(245,158,11,0.2)]' :
                            'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]'}
                `}>
                    <div className="flex items-center justify-center gap-2">
                        {isDanger && <ShieldAlert className="w-4 h-4 animate-pulse" />}
                        {isCaution && <Activity className="w-4 h-4 animate-pulse" />}
                        {!isDanger && !isCaution && <ShieldCheck className="w-4 h-4" />}
                        <span>
                            {isDanger ? 'CRITICAL RISK - FAILURE IMMINENT' :
                                isCaution ? 'CAUTION - BUFFER THIN' :
                                    'SYSTEM NOMINAL - ON TRACK'}
                        </span>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1 mb-2">
                            <ShieldCheck className="h-3 w-3 text-blue-500" /> Buffer
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-3xl font-bold font-mono ${metrics.bufferDays < 0 ? 'text-destructive' : 'text-foreground'}`}>
                                {metrics.bufferDays > 0 ? '+' : ''}{metrics.bufferDays}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground uppercase">Days</span>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1 mb-2">
                            <TrendingUp className="h-3 w-3 text-blue-500" /> 7-Day Rate
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold font-mono text-foreground">
                                {metrics.onTimeRate7Days}%
                            </span>
                            <span className="text-xs font-mono text-muted-foreground uppercase">On Time</span>
                        </div>
                    </div>
                </div>

                {/* 7 Day Execution Count */}
                <div className="pt-4 border-t border-border/50 group/recent">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest group-hover/recent:text-foreground transition-colors">Recent Activity</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold font-mono text-foreground">{metrics.daysExecuted7Days}</span>
                            <span className="text-xs font-mono text-muted-foreground">/ 7 Days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analysis Footer */}
            <div className="pt-4 mt-6 border-t border-border/50 relative z-10">
                <span className="text-[10px] text-muted-foreground/70 uppercase tracking-widest block mb-2 font-bold">System Audit</span>
                <p className={`text-xs font-medium leading-relaxed italic border-l-2 pl-3 py-1 ${isDanger ? 'text-destructive/80 border-destructive/30' : isCaution ? 'text-amber-500/80 border-amber-500/30' : 'text-emerald-500/80 border-emerald-500/30'}`}>
                    "{isDanger
                        ? "Buffer depleted. Probability of failure near certainty without immediate correction."
                        : isCaution
                            ? "Buffer verifying thin. Minor deviation will result in critical path failure."
                            : "Buffer verified. Operational contingencies available."
                    }"
                </p>
            </div>
        </div>
    );
}
