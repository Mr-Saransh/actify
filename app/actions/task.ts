"use server";

import { prisma } from "@/lib/db";
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
        // 1. Deduct 3 Points
        await prisma.user.update({
            where: { id: userId },
            data: { points: { decrement: 3 } }
        });

        // 2. Log Failure (Create a FAILED proof)
        await prisma.proof.create({
            data: {
                taskId: task.id,
                content: "System: Deadline Missed",
                explanation: "The user failed to complete the task before the deadline.",
                reviewStatus: "REJECTED",
                aiFeedback: "Deadline missed. -3 Points. Consistency is key. The task has been reassigned for today.",
            }
        });

        // 3. Reassign Task for "Today" (New Deadline)
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
export async function unlockNextLevel(goalId: string) {
    const goal = await prisma.goal.findUnique({
        where: { id: goalId },
        include: { tasks: { orderBy: { dayIndex: 'asc' }, include: { proof: true } } }
    });

    if (!goal) throw new Error("Goal not found");

    // Find the latest accepted task
    const lastAccepted = goal.tasks.filter(t => t.state === "ACCEPTED").pop();
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

    // Calculate Dynamic Limit based on Performance
    const user = await prisma.user.findUnique({ where: { id: goal.userId } });
    let dailyLimit = 2; // Default fallback

    if (user) {
        const metrics = calculateEnforcementMetrics(user, goal);
        dailyLimit = metrics.dailyLimit;
    }

    if (tasksCompletedToday >= dailyLimit) {
        // Daily Limit Reached.
        return { message: `Daily capacity reached (${tasksCompletedToday}/${dailyLimit}). Protocol restricted until tomorrow.`, limitReached: true };
    }

    // Find the next task (which should be LOCKED)
    const nextTask = goal.tasks.find(t => t.dayIndex === nextIndex);

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
    if (!nextTask && lastAccepted && lastAccepted.dayIndex === goal.tasks.length) {
        await prisma.goal.update({ where: { id: goalId }, data: { status: "COMPLETED" } });
        revalidatePath("/dashboard");
        return { completed: true };
    }

    return null;
}

export async function getCurrentLevelTask(goalId: string) {
    // Check goal status first
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.status === "COMPLETED") return null;

    const activeTask = await prisma.task.findFirst({
        where: { goalId, state: "ACTIVE" }
    });

    return activeTask;
}
