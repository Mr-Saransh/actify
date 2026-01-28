
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
        <Card className="bg-card border-border border-b-2 rounded-none md:rounded-lg">
            <CardContent className="p-3 md:p-4 lg:p-6 grid grid-cols-4 gap-2 md:gap-4 overflow-x-auto">
                {/* Type */}
                <div className="flex flex-col gap-1 border-r border-border last:border-0 pr-3 md:pr-4">
                    <span className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <Target className="h-2.5 w-2.5 md:h-3 md:w-3" /> Type
                    </span>
                    <span className="font-mono text-xs md:text-sm font-bold text-foreground uppercase">{goal.type}</span>
                </div>

                {/* Deadline */}
                <div className="flex flex-col gap-1 border-r border-border last:border-0 pr-3 md:pr-4">
                    <span className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3" /> Deadline
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="font-mono text-xs md:text-sm font-bold text-foreground">
                            {format(new Date(goal.deadline), "dd/MM/yy")}
                        </span>
                        <span className="text-[9px] md:text-[10px] text-muted-foreground font-mono hidden md:inline">
                            (-{daysRemaining}d)
                        </span>
                    </div>
                </div>

                {/* Tasks */}
                <div className="flex flex-col gap-1 border-r border-border last:border-0 pr-3 md:pr-4">
                    <span className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <ListTodo className="h-2.5 w-2.5 md:h-3 md:w-3" /> Protocol
                    </span>
                    <span className="font-mono text-xs md:text-sm font-bold text-foreground">
                        {completed} <span className="text-muted-foreground">/ {totalTasks}</span>
                    </span>
                </div>

                {/* Efficiency (Progress) */}
                <div className="flex flex-col gap-1 pr-3 md:pr-4">
                    <span className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <Percent className="h-2.5 w-2.5 md:h-3 md:w-3" /> Completion
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 md:h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="font-mono text-xs md:text-sm font-bold text-foreground">{progress}%</span>
                    </div>
                </div>
            </CardContent>
        </Card >
    );
}
