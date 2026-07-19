"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { calculateEnforcementMetrics } from "@/lib/metrics";

// Check for missed deadlines and enforce penalties
export async function checkDailyDeadlines(userId: string) {
    const now = new Date();

    // Find active tasks with passed deadlines
    const expiredTasks = await prisma.task.findMany({
        where: {
            goal: { userId, status: "ACTIVE" },
            state: "ACTIVE",
            deadline: { lt: now }, // Deadline has passed
        },
        include: { goal: true }
    });

    let penaltyApplied = false;

    for (const task of expiredTasks) {
        // Fetch User Inventory to check for FREEZE
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const hasFreeze = ((user as any)?.freezeActCount || 0) > 0;

        if (hasFreeze) {
            // -- FREEZE LOGIC --
            // 1. Consume Freeze
            await prisma.user.update({
                where: { id: userId },
                data: {
                    freezeActCount: { decrement: 1 }
                } as any
            });

            // 2. Log Freeze Usage (Info Proof)
            await prisma.proof.create({
                data: {
                    taskId: task.id,
                    content: "System: ICE PROTOCOL ACTIVATED",
                    explanation: "A System Freeze Power-up was automatically consumed to prevent failure.",
                    reviewStatus: "ACCEPTED", // Or pending, but let's say it just 'saves' you. Actually, usually it just extends. 
                    // Let's make it a note.
                    aiFeedback: "❄️ Freeze Used. Streak Preserved. No Penalty Applied.",
                }
            });
            // We don't mark as FAILED. We just reassign.

        } else {
            // -- FAILURE LOGIC --
            // 1. Deduct 3 ACT Points
            await prisma.user.update({
                where: { id: userId },
                data: {
                    actPoints: { decrement: 2 },
                    failures: { increment: 1 }
                } as any
            });

            // 2. Log Failure (Create a FAILED proof)
            await prisma.proof.create({
                data: {
                    taskId: task.id,
                    content: "System: Deadline Missed",
                    explanation: "The user failed to complete the task before the deadline.",
                    reviewStatus: "REJECTED",
                    aiFeedback: "Deadline missed. -2 ACT Points. Consistency is key. The task has been reassigned for today.",
                }
            });
        }

        // 3. Reassign Task for "Today" (New Deadline) - Applies in both cases
        // Reset deadline to end of *current* day (23:59:59)
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        await prisma.task.update({
            where: { id: task.id },
            data: {
                date: new Date(), // Reset start date to now
                deadline: endOfToday,
            }
        });

        penaltyApplied = true;
    }

    if (penaltyApplied) {
        revalidatePath("/dashboard");
        return { failureDetected: true };
    }

    return { failureDetected: false };
}

// Proceed to the next task (triggered by button)
export async function proceedToNextTask(goalId: string) {
    return await unlockNextLevel(goalId);
}

// Unlock the next pre-generated level
export async function unlockNextLevel(goalId: string, ignoreLimit: boolean = false) {
    const goal = await prisma.goal.findUnique({
        where: { id: goalId },
        include: { tasks: { orderBy: { dayIndex: 'asc' }, include: { proof: true } } }
    });

    if (!goal) throw new Error("Goal not found");

    // Find the latest accepted task
    const lastAccepted = (goal as any).tasks.filter((t: any) => t.state === "ACCEPTED").pop();
    const nextIndex = lastAccepted ? lastAccepted.dayIndex + 1 : 1;

    // Daily Limit Check & Dynamic Capacity
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Count tasks accepted TODAY
    const tasksCompletedToday = await prisma.task.count({
        where: {
            goalId: goalId,
            updatedAt: { gte: startOfDay },
            state: "ACCEPTED"
        }
    });

    // Check Beyond Act for extended capacity
    const user = await prisma.user.findUnique({ where: { id: goal.userId } }) as any;
    const hasBeyondAct = (user?.beyondActCount || 0) > 0;

    // Base limit: 3, with Beyond Act: 6
    const dailyLimit = hasBeyondAct ? 6 : 3;

    // Consume Beyond Act when unlocking 4th task (transition from 3 to 6 limit)
    if (tasksCompletedToday === 3 && hasBeyondAct && !ignoreLimit) {
        await prisma.user.update({
            where: { id: goal.userId },
            data: { beyondActCount: { decrement: 1 } } as any
        });
    }

    if (tasksCompletedToday >= dailyLimit && !ignoreLimit) {
        // Daily Limit Reached
        const message = hasBeyondAct
            ? `Enhanced capacity reached (${tasksCompletedToday}/6). Protocol restricted until tomorrow.`
            : `Daily capacity reached (${tasksCompletedToday}/3). Use Beyond Act for +3 tasks or wait until tomorrow.`;

        return { message, limitReached: true, currentLimit: dailyLimit };
    }

    // Find the next task (which should be LOCKED)
    const nextTask = (goal as any).tasks.find((t: any) => t.dayIndex === nextIndex);

    if (nextTask && nextTask.state === "LOCKED") {
        // Determine Deadline Logic
        // "only 1st task of 4 has deadline of one day other three doesnt have any deadline"
        // If tasksCompletedToday == 0, this is the 1st task.
        let deadline: Date | null = null;

        if (tasksCompletedToday === 0) {
            const endOfToday = new Date();
            endOfToday.setHours(23, 59, 59, 999);
            deadline = endOfToday;
        }

        const updatedTask = await prisma.task.update({
            where: { id: nextTask.id },
            data: {
                state: "ACTIVE",
                date: new Date(), // Refresh date on unlock
                deadline: deadline
            }
        });

        revalidatePath("/dashboard");
        return { success: true, task: updatedTask };
    }

    // Check if we are done (all tasks accepted)
    if (!nextTask && lastAccepted && lastAccepted.dayIndex === (goal as any).tasks.length) {
        // Goal Completed Logic
        await prisma.$transaction([
            prisma.goal.update({ where: { id: goalId }, data: { status: "COMPLETED" } }),
            prisma.user.update({
                where: { id: goal.userId },
                data: {
                    actCurrency: { increment: 25 },
                    goalsCompleted: { increment: 1 }
                } as any
            })
        ]);

        revalidatePath("/dashboard");
        return { completed: true };
    }

    return null;
}

export async function getCurrentLevelTask(goalId: string) {
    // Check goal status first
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.status === "COMPLETED") return null;

    // Look for active task first
    let activeTask = await prisma.task.findFirst({
        where: { goalId, state: "ACTIVE" }
    });

    // If no active task, auto-activate the next locked one
    if (!activeTask) {
        const nextLockedTask = await prisma.task.findFirst({
            where: { goalId, state: "LOCKED" },
            orderBy: { dayIndex: "asc" }
        });

        if (nextLockedTask) {
            // Auto-activate it
            activeTask = await prisma.task.update({
                where: { id: nextLockedTask.id },
                data: { state: "ACTIVE" }
            }) as any;
        }
    }

    return activeTask;
}
