export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getOrCreateUser } from "@/app/actions/user";
import { prisma } from "@/lib/prisma";
import { CreateGoalForm } from "@/components/create-goal-form";
import { getCurrentLevelTask, checkDailyDeadlines, proceedToNextTask } from "@/app/actions/task";
import { TaskView } from "@/components/task-view";
import { redirect } from "next/navigation";
import { checkAndEnforceFailures } from "@/app/actions/enforcement";
import { EgoFeedback } from "@/components/ego-feedback";
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


export default async function DashboardPage() {
    // Check for missed days first
    await checkDailyFailure();

    const user = await getOrCreateUser();

    if (!user) {
        return <div>Authenticating...</div>;
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
            <div className="flex items-center justify-center h-full">
                <CreateGoalForm />
            </div>
        );
    }

    // Identify current active task (or strict sequential enforcement)
    // In Candy Crush mode, we might have multiple active if we allowed branching, but here it's linear.
    const allTasks = (activeGoal as any).tasks;
    const activeTask = allTasks.find((t: any) => t.state === "ACTIVE" || t.state === "REJECTED");

    // Calculate Metrics (Early for limit check)
    const metrics = calculateEnforcementMetrics(user, activeGoal as any);

    // Calculate limit status first
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const tasksCompletedToday = allTasks.filter((t: any) => t.state === 'ACCEPTED' && t.updatedAt >= startOfDay).length;

    // Check if daily limit reached (No active task, and limit hit)
    const isDailyLimitReached = !activeTask && activeGoal.status === "ACTIVE" && tasksCompletedToday >= metrics.dailyLimit;

    // Determine the task to view
    // 1. Active/Rejected task
    // 2. If not limit reached & goal not done, show the last accepted task (so user can Proceed)
    let currentTask = activeTask;

    // DISABLED: This causes "PROTOCOL SATISFIED" message at midnight which blocks UI
    // if (!currentTask && !isDailyLimitReached && activeGoal.status !== "COMPLETED") {
    //     const lastAccepted = [...allTasks].reverse().find((t: any) => t.state === "ACCEPTED");
    //     if (lastAccepted) {
    //         currentTask = lastAccepted;
    //     }
    // }

    // If no task returned, check goal status
    const isGoalCompleted = activeGoal.status === "COMPLETED";

    // Prepare Locked Path (Show only next 3 steps)
    // Find index of current task
    const currentIndex = currentTask ? currentTask.dayIndex - 1 :
        allTasks.findIndex((t: any) => t.state === 'LOCKED') - 1;

    // Taking a slice: from start to current + 3
    // But we want to visually focus on the future path? 
    // "Everything else hidden or blurred" -> Show up to current + 3.
    const visiblePathEnd = Math.min(allTasks.length, (currentTask?.dayIndex || 1) + 3);
    const visibleTasks = allTasks.slice(0, visiblePathEnd);

    return (
        <div className="space-y-4 md:space-y-8 max-w-6xl mx-auto pb-6 md:pb-12">

            {/* 0. HEADER CONTEXT - Sticky on mobile for visibility */}
            {/* 0. HEADER CONTEXT */}
            <div className="bg-background pb-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div className="w-full">
                        <GoalIntelligence goal={activeGoal as any} />
                    </div>
                    <div className="flex items-center justify-end gap-2 px-1">
                        <PowerUpDisplay />
                        <DailyStatusBadge />
                    </div>
                </div>
            </div>

            {/* 1. TOP SECTION: TODAY'S TASK (DOMINANT) */}
            <section className="w-full animate-in zoom-in-50 duration-500 mb-8 md:mb-12">
                {currentTask ? (
                    <TaskView task={currentTask} />
                ) : isGoalCompleted ? (
                    // ... (mission accomplished)
                    <div className="p-12 text-center border-2 border-green-500/20 rounded-lg bg-green-500/10">
                        <h3 className="text-4xl font-black text-green-500 mb-4 uppercase tracking-tighter">Mission Accomplished</h3>
                        <p className="text-muted-foreground font-mono">Protocol verified. Archive to initialize new sequence.</p>
                        <div className="mt-8">
                            <TerminateGoalButton goalId={activeGoal.id} />
                        </div>
                    </div>
                ) : isDailyLimitReached ? (
                    // ... (limit hit)
                    <div className="p-12 text-center border-2 border-blue-500/20 rounded-lg bg-blue-500/10">
                        <h3 className="text-4xl font-black text-blue-500 mb-2 uppercase tracking-tighter">Daily Limit Hit</h3>
                        <p className="text-muted-foreground font-mono">Capacity Reached ({metrics.dailyLimit}/{metrics.dailyLimit}). Protocol resumes at 00:00.</p>
                    </div>
                ) : (
                    <div className="p-12 text-center border border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground font-mono">No active directives. Stand by.</p>
                    </div>
                )}
            </section>

            {/* 2. MIDDLE SECTION: PRESSURE GRID */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
                {/* Ego / Impact */}
                <div>
                    <FailurePanel metrics={metrics} />
                </div>

                {/* Enforcement Data */}
                <div>
                    <EnforcementStats metrics={metrics} />
                </div>

                {/* Risk Forecast */}
                <div>
                    <RiskForecast metrics={metrics} />
                </div>
            </section>

            {/* 3. BOTTOM SECTION: LOCKED PATH - Horizontal scroll on mobile */}
            <section>
                <div className="flex items-center justify-between mb-2 md:mb-4">
                    <h3 className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        Execution Path
                    </h3>
                    <span className="text-[10px] md:text-xs text-muted-foreground font-mono">
                        Locked: {allTasks.length - visibleTasks.length}
                    </span>
                </div>

                {/* Task boxes - no connecting line */}
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-3 md:pb-4 pt-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    {(() => {
                        // Pre-calculate active task index once to avoid hydration issues
                        const activeTaskIndex = visibleTasks.findIndex((t: any) => t.state === 'ACTIVE' || t.state === 'REJECTED');

                        return visibleTasks.map((task: any, idx: number) => {
                            // Calculate blur for locked tasks after the active one
                            const isAfterActive = idx > activeTaskIndex && activeTaskIndex !== -1;
                            const distanceFromActive = isAfterActive ? idx - activeTaskIndex : 0;
                            const blurAmount = task.state === 'LOCKED' && isAfterActive ? Math.min(distanceFromActive * 3, 12) : 0;
                            const opacityAmount = task.state === 'LOCKED' && isAfterActive ? Math.max(0.2, 1 - distanceFromActive * 0.2) : 1;

                            return (
                                <div
                                    key={task.id}
                                    className={`
                                        flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-sm flex items-center justify-center font-bold border-2 transition-all
                                        ${task.state === 'ACCEPTED' ? 'bg-green-500/10 text-green-500 border-green-500/30' : ''}
                                        ${(task.state === 'ACTIVE' || task.state === 'REJECTED') ? 'bg-primary text-primary-foreground border-primary scale-125 z-20 shadow-lg' : ''}
                                        ${task.state === 'LOCKED' ? 'bg-secondary text-muted-foreground border-secondary-foreground/10' : ''}
                                        ${task.state === 'FAILED' ? 'bg-destructive/10 text-destructive border-destructive/30' : ''}
                                    `}
                                    style={blurAmount > 0 ? { filter: `blur(${blurAmount}px)`, opacity: opacityAmount } : {}}
                                >
                                    {task.state === 'LOCKED' ? (
                                        <span className="text-lg">🔒</span>
                                    ) : (
                                        <span className={`text-sm md:text-lg ${task.state === 'ACTIVE' ? 'animate-pulse' : ''}`}>
                                            {task.dayIndex}
                                        </span>
                                    )}
                                </div>
                            );
                        });
                    })()}

                    {allTasks.length > visibleTasks.length && (
                        <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-secondary border border-border opacity-20 blur-sm rounded-sm">
                            <span className="text-xs">...</span>
                        </div>
                    )}
                </div>

                {/* Text below */}
                <div className="text-center mt-2">
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                        Complete current task to reveal next step
                    </p>
                </div>
            </section>

            {/* 4. SYSTEM RULES (Context Footer) */}
            <SystemRules />

            {/* Tone Update for Abort */}
            <div className="flex justify-center opacity-50 hover:opacity-100 transition-opacity">
                <TerminateGoalButton goalId={activeGoal.id} />
            </div>
        </div>
    );
}
