"use client";

import { Task } from "@prisma/client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, AlertCircle } from "lucide-react";
import { SubmitProofDialog } from "./submit-proof-dialog";
import { proceedToNextTask } from "@/app/actions/task";
import { useTransition, useState, useEffect } from "react";

interface TaskViewProps {
    task: Task & { deadline?: Date | null };
}

function CountdownTimer({ deadline }: { deadline: Date }) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const diff = new Date(deadline).getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft("00:00:00");
                return;
            }

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
        <div className="flex items-center gap-2 text-red-500 font-mono font-bold text-xl md:text-2xl animate-pulse">
            <Clock className="h-5 w-5" />
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
        <Card className="w-full border-red-600 border-2 shadow-[0_0_15px_rgba(220,38,38,0.2)] bg-black relative overflow-hidden rounded-none md:rounded-lg">
            {/* Header / Title */}
            <div className="bg-red-950/30 p-4 md:p-6 border-b border-red-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive" className="uppercase tracking-widest text-[10px] px-2">
                            Do or Fail
                        </Badge>
                        <span className="text-zinc-500 uppercase tracking-widest text-[10px]">
                            L{task.dayIndex} // Protocol
                        </span>
                    </div>
                    <CardTitle className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
                        {task.title}
                    </CardTitle>
                </div>

                {task.deadline && task.state === 'ACTIVE' && (
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] uppercase text-red-500 font-bold tracking-widest">Global Deadline</span>
                        <CountdownTimer deadline={task.deadline} />
                        <div className="flex items-center gap-1 mt-1">
                            <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-[10px] text-red-400/80 font-mono">STRICT ENFORCEMENT</span>
                        </div>
                    </div>
                )}
            </div>

            <CardContent className="p-0">
                <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-8">
                    {/* Deliverable / Instruction */}
                    <div className="space-y-2">
                        <h3 className="text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-widest">Required Output</h3>
                        <p className="text-base md:text-lg lg:text-xl font-mono text-zinc-300 leading-relaxed border-l-4 border-red-900 pl-3 md:pl-4">
                            {task.description || "Submit proof of completion immediately."}
                        </p>
                    </div>

                    {/* Action Area - Prioritized for mobile (above fold) */}
                    <div className="flex flex-col items-center justify-center">
                        {(task.state === "ACTIVE" || task.state === "REJECTED") && (
                            <div className="w-full max-w-md space-y-3 md:space-y-4 flex flex-col items-center">
                                {task.state === "REJECTED" && (
                                    <div className="bg-red-950/50 border border-red-500/50 p-3 md:p-4 rounded flex items-center gap-3 mb-2 md:mb-4 w-full text-left">
                                        <AlertCircle className="text-red-500 h-5 w-5 md:h-6 md:w-6 shrink-0" />
                                        <div>
                                            <p className="font-bold text-red-500 uppercase text-xs md:text-sm">Submission Rejected</p>
                                            <p className="text-[10px] md:text-xs text-red-300">Proof was insufficient. Try again immediately.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="transform scale-105 md:scale-110">
                                    <SubmitProofDialog taskId={task.id} />
                                </div>
                                <p className="text-center text-[10px] md:text-xs text-zinc-600 uppercase tracking-widest">
                                    Failure to submit logs a default
                                </p>
                            </div>
                        )}

                        {task.state === "SUBMITTED" && (
                            <div className="text-center py-6 md:py-8">
                                <div className="inline-flex items-center gap-2 bg-yellow-950/30 border border-yellow-500/20 px-4 py-2 rounded mb-4 animate-pulse">
                                    <span className="h-2 w-2 bg-yellow-500 rounded-full" />
                                    <span className="text-yellow-500 font-bold uppercase tracking-widest text-xs">Awaiting Validation</span>
                                </div>
                                <div className="space-y-1 font-mono text-xs text-zinc-500">
                                    <p>&gt; Analyzing proof content...</p>
                                    <p>&gt; Verifying timestamp compliance...</p>
                                    <p>&gt; Calculating probability impact...</p>
                                </div>
                            </div>
                        )}

                        {isCompleted && (
                            <div className="w-full flex flex-col items-center gap-3 md:gap-4 py-3 md:py-4">
                                <div className="text-green-500 font-bold uppercase tracking-widest flex items-center gap-2 text-lg md:text-xl border-2 border-green-500 px-4 md:px-6 py-1.5 md:py-2 rounded">
                                    <span>Protocol Satisfied</span>
                                </div>
                                <p className="text-xs text-green-400/50 uppercase tracking-widest">System Auto-Unlocking...</p>
                            </div>
                        )}

                        {isLocked && (
                            <div className="text-center py-6 md:py-8 opacity-50">
                                <p className="text-zinc-500 font-bold uppercase">Locked</p>
                            </div>
                        )}
                    </div>

                    {/* Proof Requirements Checklist - After action for mobile */}
                    <div className="bg-zinc-900/50 p-3 md:p-4 border border-zinc-800 rounded">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 md:mb-3">Proof Requirements</h4>
                        <div className="space-y-1.5 md:space-y-2">
                            <div className="flex items-center gap-2 md:gap-3 text-zinc-400">
                                <div className="h-3 w-3 md:h-4 md:w-4 border border-zinc-600 rounded-sm flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-zinc-800" />
                                </div>
                                <span className="text-xs md:text-sm font-mono">Valid content URL (Image/Link)</span>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 text-zinc-400">
                                <div className="h-3 w-3 md:h-4 md:w-4 border border-zinc-600 rounded-sm flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-zinc-800" />
                                </div>
                                <span className="text-xs md:text-sm font-mono">Detailed logic explanation</span>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 text-zinc-400">
                                <div className="h-3 w-3 md:h-4 md:w-4 border border-zinc-600 rounded-sm flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-zinc-800" />
                                </div>
                                <span className="text-xs md:text-sm font-mono">No hesitation detected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent >
        </Card >
    );
}
