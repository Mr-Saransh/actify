
import { EnforcementMetrics } from "@/lib/metrics";
import { Gauge, Activity } from "lucide-react";

interface EnforcementStatsProps {
    metrics: EnforcementMetrics;
}

export function EnforcementStats({ metrics }: EnforcementStatsProps) {
    const isBehind = metrics.executionSpeed < metrics.requiredSpeed;

    return (
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-3 md:p-4 font-mono text-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3 md:mb-4 text-primary font-bold uppercase tracking-widest border-b border-zinc-800 pb-2">
                <Activity className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">Enforcement Data</span>
            </div>

            <div className="space-y-3 md:space-y-4">
                {/* Speed Comparison */}
                <div className="grid grid-cols-2 gap-2 text-center bg-zinc-900/50 p-2 rounded">
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Current Speed</p>
                        <p className={`text-lg font-bold ${isBehind ? 'text-red-500' : 'text-green-500'}`}>
                            {metrics.executionSpeed}
                        </p>
                        <p className="text-[10px] text-zinc-600">tasks/day</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Required</p>
                        <p className="text-lg font-bold text-zinc-300">
                            {metrics.requiredSpeed}
                        </p>
                        <p className="text-[10px] text-zinc-600">tasks/day</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="flex justify-between items-center bg-zinc-900/30 p-2 rounded border border-zinc-800">
                    <span className="text-muted-foreground">STATUS</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-xs tracking-wider ${isBehind ? "bg-red-950 text-red-500 border border-red-900"
                        : "bg-green-950 text-green-500 border border-green-900"
                        }`}>
                        {isBehind ? "BEHIND SCHEDULE" : "ON TRACK"}
                    </span>
                </div>

                {/* Probability */}
                <div className="pt-2">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground uppercase">Success Probability</span>
                        <span className={`font-bold ${metrics.probability < 50 ? 'text-red-500' : 'text-primary'}`} title="Based on failure rate, delays, and daily consistency.">
                            {metrics.probability.toFixed(0)}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden" title="Probability of achieving goal by deadline based on current velocity.">
                        <div
                            className={`h-full transition-all duration-500 ${metrics.probability < 50 ? 'bg-red-600'
                                : metrics.probability < 80 ? 'bg-yellow-500'
                                    : 'bg-primary'
                                }`}
                            style={{ width: `${metrics.probability}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Analysis Footer */}
            <div className="pt-4 mt-auto border-t border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Efficiency Analysis</span>
                <p className={`text-xs italic ${isBehind ? 'text-red-400' : 'text-green-400'}`}>
                    "{isBehind
                        ? "Velocity critical. Current pace insufficient to meet deadline. Increase daily output immediately."
                        : "Pace nominal. Maintenance of current velocity projected to result in successful completion."
                    }"
                </p>
            </div>
        </div>
    );
}
