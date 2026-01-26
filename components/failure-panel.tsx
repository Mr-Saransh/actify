
import { EnforcementMetrics } from "@/lib/metrics";
import { AlertTriangle, TrendingDown } from "lucide-react";

interface FailurePanelProps {
    metrics: EnforcementMetrics;
}

export function FailurePanel({ metrics }: FailurePanelProps) {
    return (
        <div className="bg-zinc-950/50 border border-red-900/30 rounded-lg p-3 md:p-4 font-mono text-sm relative overflow-hidden h-full flex flex-col">
            {metrics.riskLevel === 'CRITICAL' && (
                <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none" />
            )}

            <div className="flex items-center gap-2 mb-3 md:mb-4 text-red-500 font-bold uppercase tracking-widest border-b border-red-900/30 pb-2">
                <AlertTriangle className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">Failure Impact</span>
            </div>

            <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Missed Yesterday</span>
                    <span className={metrics.missedYesterday ? "text-red-500 font-bold" : "text-zinc-500"}>
                        {metrics.missedYesterday ? "YES" : "NO"}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Failures (Level)</span>
                    <span className="text-zinc-200">{metrics.failuresCount}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Prob. Change</span>
                    <div className="flex items-center text-red-500 font-bold">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        <span>-{100 - Math.round(metrics.probability)}%</span>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Delay Impact</span>
                    <span className="text-red-400">+{metrics.daysBehind} DAYS</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Score Change (Today)</span>
                    <span className={`font-bold ${metrics.scoreChangeToday > 0 ? 'text-green-500' : metrics.scoreChangeToday < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                        {metrics.scoreChangeToday > 0 ? '+' : ''}{metrics.scoreChangeToday}
                    </span>
                </div>

                {metrics.lastFailureReason && (
                    <div className="pt-2 border-t border-red-900/30">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Ego Memory (Last Failure)</span>
                        <p className="text-xs text-red-400 italic">"{metrics.lastFailureReason}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
