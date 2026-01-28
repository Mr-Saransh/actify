
import { EnforcementMetrics } from "@/lib/metrics";
import { Gauge, Activity } from "lucide-react";

interface EnforcementStatsProps {
    metrics: EnforcementMetrics;
}

export function EnforcementStats({ metrics }: EnforcementStatsProps) {
    const isBehind = metrics.executionSpeed < metrics.requiredSpeed;

    return (
        <div className="bg-card border border-border rounded-lg p-3 md:p-4 font-mono text-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3 md:mb-4 text-primary font-bold uppercase tracking-widest border-b border-border pb-2">
                <Activity className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">Enforcement Data</span>
            </div>

            <div className="space-y-3 md:space-y-4">
                {/* Speed Comparison */}
                <div className="grid grid-cols-2 gap-2 text-center bg-secondary/50 p-2 rounded">
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Current Speed</p>
                        <p className={`text-lg font-bold ${isBehind ? 'text-destructive' : 'text-green-500'}`}>
                            {metrics.executionSpeed}
                        </p>
                        <p className="text-[10px] text-muted-foreground">tasks/day</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Required</p>
                        <p className="text-lg font-bold text-foreground/80">
                            {metrics.requiredSpeed}
                        </p>
                        <p className="text-[10px] text-muted-foreground">tasks/day</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="flex justify-between items-center bg-secondary/30 p-2 rounded border border-border">
                    <span className="text-muted-foreground">STATUS</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-xs tracking-wider ${isBehind ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-green-500/10 text-green-500 border border-green-500/20"
                        }`}>
                        {isBehind ? "BEHIND SCHEDULE" : "ON TRACK"}
                    </span>
                </div>

                {/* Probability */}
                <div className="pt-2">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground uppercase">Success Probability</span>
                        <span className={`font-bold ${metrics.probability < 50 ? 'text-destructive' : 'text-primary'}`} title="Based on failure rate, delays, and daily consistency.">
                            {metrics.probability.toFixed(0)}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden" title="Probability of achieving goal by deadline based on current velocity.">
                        <div
                            className={`h-full transition-all duration-500 ${metrics.probability < 50 ? 'bg-destructive'
                                : metrics.probability < 80 ? 'bg-yellow-500'
                                    : 'bg-primary'
                                }`}
                            style={{ width: `${metrics.probability}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Analysis Footer */}
            <div className="pt-4 mt-auto border-t border-border">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">Efficiency Analysis</span>
                <p className={`text-xs italic ${isBehind ? 'text-destructive/80' : 'text-green-500/80'}`}>
                    "{isBehind
                        ? "Velocity critical. Current pace insufficient to meet deadline. Increase daily output immediately."
                        : "Pace nominal. Maintenance of current velocity projected to result in successful completion."
                    }"
                </p>
            </div>
        </div>
    );
}
