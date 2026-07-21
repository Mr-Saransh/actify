import { EnforcementMetrics } from "@/lib/metrics";
import { Activity, Gauge } from "lucide-react";

interface EnforcementStatsProps {
    metrics: EnforcementMetrics;
}

export function EnforcementStats({ metrics }: EnforcementStatsProps) {
    const isBehind = metrics.executionSpeed < metrics.requiredSpeed;
    const probColor = metrics.probability < 50 ? 'bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
        : metrics.probability < 80 ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
        : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';

    const textProbColor = metrics.probability < 50 ? 'text-destructive' 
        : metrics.probability < 80 ? 'text-amber-500' 
        : 'text-emerald-500';

    return (
        <div className="relative overflow-hidden bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-5 md:p-6 font-sans flex flex-col justify-between group hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_-5px_rgba(147,51,234,0.15)]">
            <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4 relative z-10">
                <div className="flex items-center gap-2 text-primary">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Activity className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Enforcement Data</span>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${isBehind ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                    {isBehind ? "Behind Schedule" : "On Track"}
                </div>
            </div>

            <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-center">
                {/* Speed Comparison */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 text-center flex flex-col items-center justify-center group/speed transition-colors hover:bg-secondary/60">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Current Speed</span>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-3xl font-bold font-mono transition-colors ${isBehind ? 'text-destructive group-hover/speed:text-destructive' : 'text-emerald-500 group-hover/speed:text-emerald-400'}`}>
                                {metrics.executionSpeed}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">/d</span>
                        </div>
                    </div>
                    <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 text-center flex flex-col items-center justify-center group/req transition-colors hover:bg-secondary/60">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Required</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold font-mono text-foreground group-hover/req:text-white transition-colors">
                                {metrics.requiredSpeed}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">/d</span>
                        </div>
                    </div>
                </div>

                {/* Probability Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">Success Probability</span>
                        <span className={`text-2xl font-bold font-mono ${textProbColor}`}>
                            {metrics.probability.toFixed(0)}%
                        </span>
                    </div>
                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden border border-border/50 relative">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${probColor}`}
                            style={{ width: `${Math.max(5, metrics.probability)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Analysis Footer */}
            <div className="pt-4 mt-6 border-t border-border/50 relative z-10">
                <span className="text-[10px] text-muted-foreground/70 uppercase tracking-widest block mb-2 font-bold">Efficiency Analysis</span>
                <p className={`text-xs font-medium leading-relaxed italic border-l-2 pl-3 py-1 ${isBehind ? 'text-destructive/80 border-destructive/30' : 'text-emerald-500/80 border-emerald-500/30'}`}>
                    "{isBehind
                        ? "You are falling behind your required pace. Please complete more tasks to catch up."
                        : "You are doing great! Keep up this pace to successfully hit your goal on time."
                    }"
                </p>
            </div>
        </div>
    );
}
