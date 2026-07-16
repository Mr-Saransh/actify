"use client";

import { Task } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, AlertCircle, Shield, Zap } from "lucide-react";
import { SubmitProofDialog } from "./submit-proof-dialog";
import { proceedToNextTask } from "@/app/actions/task";
import { useTransition, useState, useEffect } from "react";

interface TaskViewProps {
    task: Task & { deadline?: Date | null };
}

function CountdownTimer({ deadline }: { deadline: Date }) {
    const [timeLeft, setTimeLeft] = useState("");
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const diff = new Date(deadline).getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft("00:00:00");
                setIsUrgent(true);
                return;
            }

            setIsUrgent(diff < 3600000); // < 1 hour

            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            setTimeLeft(`${h}h ${m}m ${s}s`);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [deadline]);

    return (
        <div className={`flex items-center gap-2 font-mono font-bold text-lg md:text-xl ${isUrgent ? 'text-destructive animate-urgency' : 'text-amber-500'}`}>
            <Clock className="h-4 w-4" />
            <span>{timeLeft}</span>
        </div>
    );
}

export function TaskView({ task }: TaskViewProps) {
    const isLocked = task.state === "LOCKED";
    const isCompleted = task.state === "ACCEPTED";
    const [isPending, startTransition] = useTransition();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleProceed = () => {
        setErrorMsg(null);
        startTransition(async () => {
            const result = await proceedToNextTask(task.goalId);
            if (result?.limitReached) {
                setErrorMsg(result.message || "Limit reached");
            }
        });
    };

    return (
        <div className="w-full rounded-xl border-2 border-primary/30 bg-card shadow-lg relative overflow-hidden card-hover">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 md:p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className="uppercase tracking-widest text-[10px] px-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
                            <Zap className="w-3 h-3 mr-1" /> Do or Fail
                        </Badge>
                        <span className="text-muted-foreground text-[11px] font-medium">
                            Level {task.dayIndex}
                        </span>
                    </div>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground">
                        {task.title}
                    </h2>
                </div>

                {task.deadline && task.state === 'ACTIVE' && (
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-widest">Deadline</span>
                        <CountdownTimer deadline={task.deadline} />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 space-y-6">
                {/* Deliverable */}
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Required Output</h3>
                    <p className="text-base md:text-lg text-foreground leading-relaxed border-l-3 border-primary pl-4 bg-primary/5 rounded-r-lg py-3 pr-4">
                        {task.description || "Submit proof of completion immediately."}
                    </p>
                </div>

                {/* Action Area */}
                <div className="flex flex-col items-center justify-center">
                    {(task.state === "ACTIVE" || task.state === "REJECTED") && (
                        <div className="w-full max-w-md space-y-4 flex flex-col items-center">
                            {task.state === "REJECTED" && (
                                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg flex items-center gap-3 w-full">
                                    <AlertCircle className="text-destructive h-5 w-5 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-destructive text-sm">Submission Rejected</p>
                                        <p className="text-xs text-destructive/80">Proof was insufficient. Try again immediately.</p>
                                    </div>
                                </div>
                            )}

                            <div className="transform scale-105">
                                <SubmitProofDialog taskId={task.id} />
                            </div>
                            <p className="text-center text-[11px] text-muted-foreground tracking-wide">
                                Failure to submit logs a default
                            </p>
                        </div>
                    )}

                    {task.state === "SUBMITTED" && (
                        <div className="text-center py-6">
                            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-lg mb-4 animate-pulse">
                                <span className="h-2 w-2 bg-amber-500 rounded-full" />
                                <span className="text-amber-500 font-semibold text-xs tracking-widest uppercase">Awaiting Validation</span>
                            </div>
                            <div className="space-y-1.5 font-mono text-xs text-muted-foreground">
                                <p>&gt; Analyzing proof content...</p>
                                <p>&gt; Verifying timestamp compliance...</p>
                                <p>&gt; Calculating probability impact...</p>
                            </div>
                        </div>
                    )}

                    {isCompleted && (
                        <div className="w-full flex flex-col items-center gap-3 py-4">
                            <div className="text-emerald-500 font-bold flex items-center gap-2 text-lg border-2 border-emerald-500/30 px-6 py-2 rounded-lg bg-emerald-500/5">
                                <Shield className="w-5 h-5" />
                                <span>Protocol Satisfied</span>
                            </div>
                            <p className="text-xs text-emerald-500/60 tracking-wide">System Auto-Unlocking...</p>
                        </div>
                    )}

                    {isLocked && (
                        <div className="text-center py-6 opacity-40">
                            <p className="text-muted-foreground font-semibold">Locked</p>
                        </div>
                    )}
                </div>

                {/* Proof Requirements */}
                <div className="bg-secondary/50 p-4 border border-border rounded-lg">
                    <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Proof Requirements</h4>
                    <div className="space-y-2">
                        {["Valid content URL (Image/Link)", "Detailed logic explanation", "No hesitation detected"].map((req) => (
                            <div key={req} className="flex items-center gap-3 text-muted-foreground">
                                <div className="h-3.5 w-3.5 border border-border rounded flex items-center justify-center shrink-0">
                                    <div className="h-1.5 w-1.5 bg-foreground/60 rounded-full" />
                                </div>
                                <span className="text-xs">{req}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
