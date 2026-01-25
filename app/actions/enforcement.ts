"use server";

import { getPrisma } from "@/lib/db";
import { Task } from "@prisma/client";

export async function checkAndEnforceFailures(userId: string) {
    const prisma = await getPrisma();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find users' active goals
    const activeGoals = await prisma.goal.findMany({
        where: { userId, status: "ACTIVE" },
        include: { tasks: true }
    });

    let failureDetected = false;

    for (const goal of activeGoals) {
        // Check for past tasks that are not ACCEPTED or SUBMITTED
        // If a task is LOCKED, it hasn't been reached yet (or shouldn't exist in past).
        // If a task is ACTIVE and date < today, it's FAILED.

        // We only care about tasks with date < today
        const pastUnfinishedTasks = goal.tasks.filter((t: Task) => {
            const taskDate = new Date(t.date);
            taskDate.setHours(0, 0, 0, 0);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate < today && t.state === "ACTIVE";
        });

        if (pastUnfinishedTasks.length > 0) {
            failureDetected = true;
            // Mark as FAILED
            await prisma.task.updateMany({
                where: {
                    id: { in: pastUnfinishedTasks.map(t => t.id) }
                },
                data: { state: "FAILED" }
            });

            // Reset Streak (Simplified logic)
            await prisma.user.update({
                where: { id: userId },
                data: { streak: 0 }
            });
        }
    }

    return { failureDetected };
}
