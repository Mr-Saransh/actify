export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getOrCreateUser } from "@/app/actions/user";
import { prisma } from "@/lib/prisma";
import { CreateGoalForm } from "@/components/create-goal-form";
import { getCurrentLevelTask, checkDailyDeadlines, proceedToNextTask } from "@/app/actions/task";
import { TaskView } from "@/components/task-view";
import { redirect } from "next/navigation";
import { checkAndEnforceFailures } from "@/app/actions/enforcement";
import { TerminateGoalButton } from "@/components/terminate-goal-button";
import { calculateEnforcementMetrics } from "@/lib/metrics";
import { FailurePanel } from "@/components/failure-panel";
import { EnforcementStats } from "@/components/enforcement-stats";
import { GoalIntelligence } from "@/components/goal-intelligence";
import { SystemRules } from "@/components/system-rules";
import { RiskForecast } from "@/components/risk-forecast";
import { checkDailyFailure } from "@/app/actions/daily-check";
import { DailyStatusBadge } from "@/components/daily-status-badge";
import { PowerUpDisplay } from "@/components/power-up-display";
import { Target, CheckCircle, AlertTriangle } from "lucide-react";


export default async function DashboardPage() {
    // Check for missed days first
    await checkDailyFailure();

    const user = await getOrCreateUser();

    if (!user) {
        return <div className="flex items-center justify-center h-full text-muted-foreground">Authenticating...</div>;
    }

    // Check for failures (existing) - keeping this for backward compat if needed, but adding new check
    const { failureDetected: enforcementFailure } = await checkAndEnforceFailures(user.id);

    // Check for DEADLINE failures
    const { failureDetected: deadlineFailure } = await checkDailyDeadlines(user.id);

    const failureDetected = enforcementFailure || deadlineFailure;

    // Fetch active goal with ALL tasks for the map
    const activeGoal = await prisma.goal.findFirst({
        where: {
            userId: user.id,
            status: "ACTIVE",
        },
        include: {
            tasks: {
                orderBy: { dayIndex: 'asc' },
                include: { proof: true }
            }
        },
    });

    if (!activeGoal) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <CreateGoalForm />
            </div>
        );
    }

    // Identify current active task
    const allTasks = (activeGoal as any).tasks;
    const activeTask = allTasks.find((t: any) => t.state === "ACTIVE" || t.state === "REJECTED");

    // Calculate Metrics
    const metrics = calculateEnforcementMetrics(user, activeGoal as any);

    // Calculate limit status
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const tasksCompletedToday = allTasks.filter((t: any) => t.state === 'ACCEPTED' && t.updatedAt >= startOfDay).length;

    // Check if daily limit reached
    const isDailyLimitReached = !activeTask && activeGoal.status === "ACTIVE" && tasksCompletedToday >= metrics.dailyLimit;

    let currentTask = activeTask;
    const isGoalCompleted = activeGoal.status === "COMPLETED";

    // Prepare Locked Path
    const currentIndex = currentTask ? currentTask.dayIndex - 1 :
        allTasks.findIndex((t: any) => t.state === 'LOCKED') - 1;

    const visiblePathEnd = Math.min(allTasks.length, (currentTask?.dayIndex || 1) + 3);
    const visibleTasks = allTasks.slice(0, visiblePathEnd);

    return (
        <div className="space-y-5 md:space-y-8 max-w-5xl mx-auto pb-6 md:pb-12">

            {/* Header Context */}
            <div className="animate-slide-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                    <div className="w-full">
                        <GoalIntelligence goal={activeGoal as any} />
                    </div>
                    <div className="flex items-center justify-end gap-2 px-1">
                        <PowerUpDisplay />
                        <DailyStatusBadge />
                    </div>
                </div>
            </div>

            {/* Today's Task (Dominant) */}
            <section className="w-full animate-slide-up stagger-1">
                {currentTask ? (
                    <TaskView task={currentTask} />
                ) : isGoalCompleted ? (
                    <div className="p-8 md:p-12 text-center rounded-xl border-2 border-emerald-500/20 bg-emerald-500/5 animate-scale-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-emerald-500 mb-3">Mission Accomplished</h3>
                        <p className="text-muted-foreground mb-6">Protocol verified. All tasks completed successfully.</p>
                        <TerminateGoalButton goalId={activeGoal.id} />
                    </div>
                ) : isDailyLimitReached ? (
                    <div className="p-8 md:p-12 text-center rounded-xl border-2 border-blue-500/20 bg-blue-500/5 animate-scale-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
                            <Target className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-blue-500 mb-2">Daily Limit Hit</h3>
                        <p className="text-muted-foreground">Capacity Reached ({metrics.dailyLimit}/{metrics.dailyLimit}). Protocol resumes at 00:00.</p>
                    </div>
                ) : (
                    <div className="p-8 md:p-12 text-center rounded-xl border border-dashed border-border">
                        <p className="text-muted-foreground">No active directives. Stand by.</p>
                    </div>
                )}
            </section>

            {/* Pressure Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 animate-slide-up stagger-2">
                <FailurePanel metrics={metrics} />
                <EnforcementStats metrics={metrics} />
                <RiskForecast metrics={metrics} />
            </section>

            {/* Execution Path */}
            <section className="animate-slide-up stagger-3">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Execution Path
                    </h3>
                    <span className="text-[10px] text-muted-foreground">
                        Locked: {allTasks.length - visibleTasks.length}
                    </span>
                </div>

                <div className="flex gap-2.5 md:gap-3 overflow-x-auto pb-3 pt-1">
                    {(() => {
                        const activeTaskIndex = visibleTasks.findIndex((t: any) => t.state === 'ACTIVE' || t.state === 'REJECTED');

                        return visibleTasks.map((task: any, idx: number) => {
                            const isAfterActive = idx > activeTaskIndex && activeTaskIndex !== -1;
                            const distanceFromActive = isAfterActive ? idx - activeTaskIndex : 0;
                            const blurAmount = task.state === 'LOCKED' && isAfterActive ? Math.min(distanceFromActive * 3, 12) : 0;
                            const opacityAmount = task.state === 'LOCKED' && isAfterActive ? Math.max(0.2, 1 - distanceFromActive * 0.2) : 1;

                            return (
                                <div
                                    key={task.id}
                                    className={`
                                        flex-shrink-0 w-11 h-11 md:w-14 md:h-14 rounded-lg flex items-center justify-center font-bold border-2 transition-all duration-300
                                        ${task.state === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : ''}
                                        ${(task.state === 'ACTIVE' || task.state === 'REJECTED') ? 'bg-primary text-primary-foreground border-primary scale-110 z-20 shadow-lg animate-glow' : ''}
                                        ${task.state === 'LOCKED' ? 'bg-secondary text-muted-foreground border-border' : ''}
                                        ${task.state === 'FAILED' ? 'bg-destructive/10 text-destructive border-destructive/30' : ''}
                                    `}
                                    style={blurAmount > 0 ? { filter: `blur(${blurAmount}px)`, opacity: opacityAmount } : {}}
                                >
                                    {task.state === 'LOCKED' ? (
                                        <span className="text-base opacity-40">🔒</span>
                                    ) : (
                                        <span className={`text-sm md:text-base ${task.state === 'ACTIVE' ? 'animate-pulse' : ''}`}>
                                            {task.dayIndex}
                                        </span>
                                    )}
                                </div>
                            );
                        });
                    })()}

                    {allTasks.length > visibleTasks.length && (
                        <div className="flex-shrink-0 w-11 h-11 md:w-14 md:h-14 flex items-center justify-center bg-secondary border border-border opacity-20 blur-sm rounded-lg">
                            <span className="text-xs">...</span>
                        </div>
                    )}
                </div>

                <div className="text-center mt-2">
                    <p className="text-[11px] text-muted-foreground tracking-wide">
                        Complete current task to reveal next step
                    </p>
                </div>
            </section>

            {/* System Rules */}
            <SystemRules />

            {/* Abort */}
            <div className="flex justify-center opacity-40 hover:opacity-100 transition-opacity">
                <TerminateGoalButton goalId={activeGoal.id} />
            </div>
        </div>
    );
}
