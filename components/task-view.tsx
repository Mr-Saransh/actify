"use client";

import { Task } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, Shield, Zap, Target, FileCheck, ExternalLink, Lightbulb } from "lucide-react";
import { SubmitProofDialog } from "./submit-proof-dialog";
import { useState, useEffect } from "react";

interface TaskViewProps {
    task: Task & { deadline?: Date | null, resources?: string[] | null, objective?: string | null, expectedOutput?: string | null, estimatedTime?: number | null, difficulty?: string | null, hints?: string | null };
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

    const getDifficultyColor = (diff?: string | null) => {
        if (diff === "Easy") return "text-green-500 bg-green-500/10";
        if (diff === "Medium") return "text-amber-500 bg-amber-500/10";
        if (diff === "Hard") return "text-destructive bg-destructive/10";
        return "text-muted-foreground bg-secondary";
    };

    return (
        <div className="w-full rounded-xl border-2 border-primary/30 bg-card shadow-lg relative overflow-hidden card-hover">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 md:p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className="uppercase tracking-widest text-[10px] px-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
                            <Zap className="w-3 h-3 mr-1" /> ACTIVE DIRECTIVE
                        </Badge>
                        <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider border border-border px-2 py-0.5 rounded-full">
                            Task {task.dayIndex}
                        </span>
                        {task.difficulty && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getDifficultyColor(task.difficulty)}`}>
                                {task.difficulty}
                            </span>
                        )}
                        {task.estimatedTime && (
                            <span className="flex items-center text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3 mr-1" /> {task.estimatedTime}m
                            </span>
                        )}
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
                
                {/* Description */}
                <div className="text-base text-muted-foreground leading-relaxed">
                    {task.description}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Objective */}
                    {task.objective && (
                        <div className="space-y-2 border border-border/50 bg-secondary/20 p-4 rounded-lg">
                            <h3 className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
                                <Target className="w-4 h-4" /> Primary Objective
                            </h3>
                            <p className="text-sm text-foreground">
                                {task.objective}
                            </p>
                        </div>
                    )}

                    {/* Expected Output */}
                    {task.expectedOutput && (
                        <div className="space-y-2 border border-border/50 bg-secondary/20 p-4 rounded-lg">
                            <h3 className="flex items-center gap-2 text-xs font-semibold text-emerald-500 uppercase tracking-widest">
                                <FileCheck className="w-4 h-4" /> Expected Output
                            </h3>
                            <p className="text-sm text-foreground">
                                {task.expectedOutput}
                            </p>
                        </div>
                    )}
                </div>

                {/* Resources & Hints */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.resources && task.resources.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Resources</h3>
                            <ul className="space-y-1">
                                {task.resources.map((res, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-blue-400 hover:text-blue-300">
                                        <ExternalLink className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span className="break-all">{res}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {task.hints && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">AI Hint</h3>
                            <div className="flex items-start gap-2 text-sm text-amber-500/90 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>{task.hints}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Area */}
                <div className="flex flex-col items-center justify-center pt-4 border-t border-border/50">
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
                                Failure to submit before deadline logs a default
                            </p>
                        </div>
                    )}

                    {task.state === "SUBMITTED" && (
                        <div className="text-center py-6">
                            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-lg mb-4 animate-pulse">
                                <span className="h-2 w-2 bg-amber-500 rounded-full" />
                                <span className="text-amber-500 font-semibold text-xs tracking-widest uppercase">Awaiting AI Validation</span>
                            </div>
                        </div>
                    )}

                    {isCompleted && (
                        <div className="w-full flex flex-col items-center gap-3 py-4">
                            <div className="text-emerald-500 font-bold flex items-center gap-2 text-lg border-2 border-emerald-500/30 px-6 py-2 rounded-lg bg-emerald-500/5">
                                <Shield className="w-5 h-5" />
                                <span>Protocol Satisfied</span>
                            </div>
                            <p className="text-xs text-emerald-500/60 tracking-wide">You can generate your next task if you have daily capacity.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
