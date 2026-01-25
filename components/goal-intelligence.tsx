
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Goal } from "@prisma/client";
import { Calendar, Target, ListTodo, Percent } from "lucide-react";
import { format } from "date-fns";

interface GoalIntelligenceProps {
    goal: Goal & { tasks: any[] };
}

export function GoalIntelligence({ goal }: GoalIntelligenceProps) {
    const totalTasks = goal.tasks.length;
    const completed = goal.tasks.filter(t => t.state === 'ACCEPTED').length;
    const progress = Math.round((completed / totalTasks) * 100) || 0;

    const daysRemaining = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

    return (
        <Card className="bg-zinc-950 border-zinc-800 border-b-2 rounded-none md:rounded-lg mb-6">
            <CardContent className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Type */}
                <div className="flex flex-col gap-1 border-r border-zinc-900 last:border-0 pr-4">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                        <Target className="h-3 w-3" /> Type
                    </span>
                    <span className="font-mono text-sm font-bold text-white uppercase">{goal.type}</span>
                </div>

                {/* Deadline */}
                <div className="flex flex-col gap-1 border-r border-zinc-900 last:border-0 pr-4">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Deadline
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="font-mono text-sm font-bold text-white">
                            {format(new Date(goal.deadline), "dd/MM/yyyy")}
                        </span>
                        <span className="text-[10px] text-zinc-600 font-mono hidden md:inline">
                            (-{daysRemaining}d)
                        </span>
                    </div>
                </div>

                {/* Tasks */}
                <div className="flex flex-col gap-1 border-r border-zinc-900 last:border-0 pr-4">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                        <ListTodo className="h-3 w-3" /> Protocol
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                        {completed} <span className="text-zinc-600">/ {totalTasks} Step(s)</span>
                    </span>
                </div>

                {/* Efficiency (Progress) */}
                <div className="flex flex-col gap-1 pr-4">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                        <Percent className="h-3 w-3" /> Completion
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-white" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="font-mono text-sm font-bold text-white">{progress}%</span>
                    </div>
                </div>
            </CardContent>
        </Card >
    );
}
