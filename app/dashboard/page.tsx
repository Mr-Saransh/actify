export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getOrCreateUser } from "@/app/actions/user";
import { prisma } from "@/lib/db";
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


export default async function DashboardPage() {
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
    const allTasks = activeGoal.tasks;
    const activeTask = allTasks.find(t => t.state === "ACTIVE" || t.state === "REJECTED");

    // Calculate Metrics (Early for limit check)
    const metrics = calculateEnforcementMetrics(user, activeGoal as any);

    // Calculate limit status first
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const tasksCompletedToday = allTasks.filter(t => t.state === 'ACCEPTED' && t.updatedAt >= startOfDay).length;

    // Check if daily limit reached (No active task, and limit hit)
    const isDailyLimitReached = !activeTask && activeGoal.status === "ACTIVE" && tasksCompletedToday >= metrics.dailyLimit;

    // Determine the task to view
    // 1. Active/Rejected task
    // 2. If not limit reached & goal not done, show the last accepted task (so user can Proceed)
    let currentTask = activeTask;

    if (!currentTask && !isDailyLimitReached && activeGoal.status !== "COMPLETED") {
        const lastAccepted = [...allTasks].reverse().find(t => t.state === "ACCEPTED");
        if (lastAccepted) {
            currentTask = lastAccepted;
        }
    }

    // If no task returned, check goal status
    const isGoalCompleted = activeGoal.status === "COMPLETED";

    // Prepare Locked Path (Show only next 3 steps)
    // Find index of current task
    const currentIndex = currentTask ? currentTask.dayIndex - 1 :
        allTasks.findIndex(t => t.state === 'LOCKED') - 1;

    // Taking a slice: from start to current + 3
    // But we want to visually focus on the future path? 
    // "Everything else hidden or blurred" -> Show up to current + 3.
    const visiblePathEnd = Math.min(allTasks.length, (currentTask?.dayIndex || 1) + 3);
    const visibleTasks = allTasks.slice(0, visiblePathEnd);

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">

            {/* 0. HEADER CONTEXT */}
            <GoalIntelligence goal={activeGoal as any} />

            {/* 1. TOP SECTION: TODAY'S TASK (DOMINANT) */}
            <section className="w-full animate-in zoom-in-50 duration-500">
                {currentTask ? (
                    <TaskView task={currentTask} />
                ) : isGoalCompleted ? (
                    // ... (mission accomplished)
                    <div className="p-12 text-center border-2 border-green-500/20 rounded-lg bg-green-950/20">
                        <h3 className="text-4xl font-black text-green-500 mb-4 uppercase tracking-tighter">Mission Accomplished</h3>
                        <p className="text-zinc-400 font-mono">Protocol verified. Archive to initialize new sequence.</p>
                        <div className="mt-8">
                            <TerminateGoalButton goalId={activeGoal.id} />
                        </div>
                    </div>
                ) : isDailyLimitReached ? (
                    // ... (limit hit)
                    <div className="p-12 text-center border-2 border-blue-500/20 rounded-lg bg-blue-950/20">
                        <h3 className="text-4xl font-black text-blue-500 mb-2 uppercase tracking-tighter">Daily Limit Hit</h3>
                        <p className="text-zinc-400 font-mono">Capacity Reached ({metrics.dailyLimit}/{metrics.dailyLimit}). Protocol resumes at 00:00.</p>
                    </div>
                ) : (
                    <div className="p-12 text-center border border-dashed border-zinc-800 rounded-lg">
                        <p className="text-zinc-500 font-mono">No active directives. Stand by.</p>
                    </div>
                )}
            </section>

            {/* 2. MIDDLE SECTION: PRESSURE GRID */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Ego / Impact</h4>
                    <FailurePanel metrics={metrics} />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Enforcement Data</h4>
                    <EnforcementStats metrics={metrics} />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Risk Forecast</h4>
                    <RiskForecast metrics={metrics} />
                </div>
            </section>

            {/* 3. BOTTOM SECTION: LOCKED PATH */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                        Execution Path
                    </h3>
                    <span className="text-xs text-zinc-600 font-mono">
                        Steps Locked: {allTasks.length - visibleTasks.length}
                    </span>
                </div>

                <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-900 -translate-y-1/2 rounded-full" />

                    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 relative z-10 scrollbar-hide">
                        {visibleTasks.map((task, idx) => {
                            // Is this the very last visible one and it's locked?
                            const isLastVisible = idx === visibleTasks.length - 1;
                            const isBlurred = isLastVisible && task.state === 'LOCKED';

                            return (
                                <div
                                    key={task.id}
                                    className={`
                                        flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-sm flex items-center justify-center font-bold border-2 transition-all
                                        ${task.state === 'ACCEPTED' ? 'bg-green-950 text-green-500 border-green-900' : ''}
                                        ${(task.state === 'ACTIVE' || task.state === 'REJECTED') ? 'bg-black text-white border-white scale-125 z-20 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : ''}
                                        ${task.state === 'LOCKED' ? 'bg-zinc-950 text-zinc-700 border-zinc-900' : ''}
                                        ${task.state === 'FAILED' ? 'bg-red-950 text-red-800 border-red-900' : ''}
                                        ${isBlurred ? 'opacity-50 blur-[2px]' : ''}
                                    `}
                                >
                                    {task.state === 'LOCKED' ? (
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] opacity-50">L{task.dayIndex}</span>
                                            <span className="text-xs">🔒</span>
                                        </div>
                                    ) : (
                                        <span className={`text-sm md:text-lg ${task.state === 'ACTIVE' ? 'animate-pulse' : ''}`}>
                                            {task.dayIndex}
                                        </span>
                                    )}
                                </div>
                            );
                        })}

                        {allTasks.length > visibleTasks.length && (
                            <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-zinc-950 border border-zinc-900 opacity-30 blur-sm rounded-sm">
                                <span className="text-xs">...</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center mt-2">
                    <p className="text-xs text-zinc-600 font-mono uppercase">
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
