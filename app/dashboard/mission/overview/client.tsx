"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { beginMission } from "@/app/actions/mission";
import { useToast } from "@/hooks/use-toast";
import { Rocket, ShieldAlert, Target, Clock, Activity, Crosshair, AlertTriangle, ChevronRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface MissionOverviewClientProps {
    goal: any;
    readOnly?: boolean;
}

export function MissionOverviewClient({ goal, readOnly }: MissionOverviewClientProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const handleBeginMission = () => {
        startTransition(async () => {
            const result = await beginMission(goal.id);
            if (result.success) {
                toast({
                    title: "Mission Initialized",
                    description: "Execution protocol started. Good luck.",
                });
                router.push("/dashboard");
            } else {
                toast({
                    title: "Initialization Failed",
                    description: result.message,
                    className: "bg-destructive text-destructive-foreground",
                });
            }
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
            
            {/* Header */}
            <div className="text-center space-y-4 pt-8">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-2 border border-primary/20">
                    <Rocket className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight uppercase">Mission Protocol: <span className="text-primary">{goal.title}</span></h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    {goal.description || "Mission blueprint generated and awaiting execution initialization."}
                </p>
            </div>

            {/* Core Telemetry */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Clock className="w-6 h-6 text-blue-500 mb-1" />
                    <div className="text-2xl font-bold font-mono">{goal.estimatedHours}h</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest">Est. Duration</div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Target className="w-6 h-6 text-green-500 mb-1" />
                    <div className="text-2xl font-bold font-mono">{goal.successProbability}%</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest">Success Prob</div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Activity className="w-6 h-6 text-amber-500 mb-1" />
                    <div className="text-2xl font-bold font-mono">{goal.difficulty}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest">Difficulty</div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Crosshair className="w-6 h-6 text-purple-500 mb-1" />
                    <div className="text-2xl font-bold font-mono uppercase">{goal.commitment}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest">Commitment</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Roadmap / Milestones */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold uppercase tracking-wider">Execution Roadmap</h3>
                    </div>
                    
                    <div className="space-y-3">
                        {goal.milestones.map((milestone: any, idx: number) => (
                            <div key={milestone.id} className="flex gap-4 p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-colors">
                                <div className="flex flex-col items-center justify-center bg-secondary/50 rounded-lg w-12 h-12 shrink-0 font-mono font-bold text-lg">
                                    {idx + 1}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-lg flex items-center gap-2">
                                        {milestone.title}
                                        {milestone.difficulty && (
                                            <span className="text-[10px] uppercase bg-secondary px-2 py-0.5 rounded-full text-muted-foreground font-mono">
                                                {milestone.difficulty}
                                            </span>
                                        )}
                                    </h4>
                                    {milestone.description && (
                                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                                    )}
                                    {milestone.duration && (
                                        <div className="text-xs font-medium text-primary mt-2">
                                            Est. {milestone.duration} hours
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Risk Analysis & Action */}
                <div className="space-y-6">
                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2 text-destructive border-b border-destructive/20 pb-2">
                            <ShieldAlert className="w-5 h-5" />
                            <h3 className="font-bold uppercase tracking-wider">Risk Analysis</h3>
                        </div>
                        <ul className="space-y-2">
                            {goal.risks && goal.risks.length > 0 ? (
                                goal.risks.map((risk: string, i: number) => (
                                    <li key={i} className="flex gap-2 text-sm text-destructive/80">
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{risk}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-sm text-muted-foreground italic">No major risks identified.</li>
                            )}
                        </ul>
                    </div>

                    {readOnly ? (
                        <div className="bg-card/60 backdrop-blur-md border border-border rounded-xl p-6 text-center space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wider text-muted-foreground">Mission Active</h3>
                                <p className="text-sm text-muted-foreground">
                                    The execution protocol is currently engaged. You cannot modify the blueprint while the mission is running.
                                </p>
                            </div>
                            <Button 
                                size="lg" 
                                variant="outline"
                                className="w-full h-14 text-lg font-bold uppercase tracking-wider group border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                                onClick={() => router.push("/dashboard")}
                            >
                                Return to Active Protocol
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-card border border-border rounded-xl p-6 text-center space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wider text-muted-foreground">Ready for Execution?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Initiating this mission will engage the ACTIFY engine. You will be held accountable to the generated schedule.
                                </p>
                            </div>
                            <Button 
                                size="lg" 
                                className="w-full h-14 text-lg font-bold uppercase tracking-wider group"
                                onClick={handleBeginMission}
                                disabled={isPending}
                            >
                                {isPending ? "Initializing..." : "Begin Mission"}
                                {!isPending && <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
