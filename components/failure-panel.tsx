import { EnforcementMetrics } from "@/lib/metrics";
import { AlertTriangle, TrendingDown } from "lucide-react";

interface FailurePanelProps {
    metrics: EnforcementMetrics;
}

export function FailurePanel({ metrics }: FailurePanelProps) {
    const isCritical = metrics.riskLevel === 'CRITICAL';
    
    return (
        <div className="relative overflow-hidden bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-5 md:p-6 font-sans flex flex-col justify-between group hover:border-destructive/50 transition-all duration-500 hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.15)]">
            {isCritical && (
                <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            )}
            
            <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4 relative z-10">
                <div className="flex items-center gap-2 text-destructive">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                        <AlertTriangle className={`w-4 h-4 ${isCritical ? 'animate-pulse' : ''}`} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Failure Impact</span>
                </div>
                {isCritical && (
                    <span className="text-[10px] uppercase tracking-wider bg-destructive/20 text-destructive px-2 py-1 rounded-full font-bold animate-pulse">
                        Critical
                    </span>
                )}
            </div>

            <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-center group/item">
                    <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors duration-300">Missed Yesterday</span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${metrics.missedYesterday ? "bg-destructive/20 text-destructive" : "bg-secondary text-muted-foreground"}`}>
                        {metrics.missedYesterday ? "YES" : "NO"}
                    </span>
                </div>

                <div className="flex justify-between items-center group/item">
                    <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors duration-300">Total Failures</span>
                    <span className="text-xl font-bold font-mono">{metrics.failuresCount}</span>
                </div>

                <div className="flex justify-between items-center group/item">
                    <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors duration-300">Prob. Penalty</span>
                    <div className="flex items-center text-destructive font-bold bg-destructive/10 px-2 py-0.5 rounded-md">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        <span className="font-mono">-{100 - Math.round(metrics.probability)}%</span>
                    </div>
                </div>

                <div className="flex justify-between items-center group/item">
                    <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors duration-300">Delay Impact</span>
                    <span className="text-destructive font-bold font-mono">+{metrics.daysBehind} DAYS</span>
                </div>
            </div>

            {metrics.lastFailureReason && (
                <div className="pt-4 mt-6 border-t border-border/50 relative z-10">
                    <span className="text-[10px] text-muted-foreground/70 uppercase tracking-widest block mb-2 font-bold">Ego Memory Trace</span>
                    <p className="text-xs text-destructive/80 italic font-medium leading-relaxed border-l-2 border-destructive/30 pl-3 py-1">
                        "{metrics.lastFailureReason}"
                    </p>
                </div>
            )}
        </div>
    );
}
