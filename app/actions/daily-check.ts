"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";

/**
 * Check if user missed any days and apply failure penalties
 * Called on dashboard load to enforce daily task requirement
 */
export async function checkDailyFailure() {
    try {
        const user = await getOrCreateUser() as any;

        // Helper function to get start of day in local time
        const startOfDay = (date: Date): Date => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d;
        };

        const today = startOfDay(new Date());
        const lastCheck = user.lastFailureCheck ? startOfDay(new Date(user.lastFailureCheck)) : null;
        const lastCompletion = user.lastCompletionDate ? startOfDay(new Date(user.lastCompletionDate)) : null;

        // If we've already checked today, skip
        if (lastCheck && lastCheck.getTime() === today.getTime()) {
            return {
                failed: false,
                message: "Already checked today"
            };
        }

        // Calculate yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Check if user completed a task yesterday
        const missedYesterday = !lastCompletion || lastCompletion.getTime() < yesterday.getTime();

        // For new users or first day, give grace period
        if (!user.lastCompletionDate && user.tasksCompleted === 0) {
            // First time user, just update check time
            await prisma.user.update({
                where: { id: user.id },
                data: { lastFailureCheck: new Date() } as any
            });
            return {
                failed: false,
                message: "First day - grace period"
            };
        }

        if (missedYesterday && lastCheck) {
            // Check if user has Liquid Freeze
            const hasFreezeAct = (user.freezeActCount || 0) > 0;

            if (hasFreezeAct) {
                // Use Liquid Freeze to skip penalty
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        freezeActCount: { decrement: 1 } as any,
                        lastFailureCheck: new Date(),
                        dailyTaskCompleted: false // Reset for new day
                    } as any
                });

                return {
                    failed: false,
                    freezeUsed: true,
                    message: "❄️ Liquid Freeze activated - Day skipped. No penalties applied."
                };
            }

            // No freeze available - apply penalty
            const pointsToDeduct = 3;

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    actPoints: { decrement: pointsToDeduct },
                    failures: { increment: 1 },
                    streak: 0,
                    lastFailureCheck: new Date(),
                    dailyTaskCompleted: false // Reset for new day
                } as any
            });

            return {
                failed: true,
                message: `Missed daily task. -${pointsToDeduct} ACT Points`,
                pointsLost: pointsToDeduct
            };
        } else {
            // User was active or this is first check
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    lastFailureCheck: new Date(),
                    dailyTaskCompleted: false // Reset for new day
                } as any
            });

            return {
                failed: false,
                message: "Check complete - no failure"
            };
        }
    } catch (error) {
        console.error("Daily failure check error:", error);
        return {
            failed: false,
            message: "Error during check"
        };
    }
}

/**
 * Check if user has completed their daily task today
 */
export async function getDailyStatus() {
    try {
        const user = await getOrCreateUser() as any;

        const startOfDay = (date: Date): Date => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d;
        };

        const today = startOfDay(new Date());
        const lastCompletion = user.lastCompletionDate ? startOfDay(new Date(user.lastCompletionDate)) : null;

        const completedToday = lastCompletion && lastCompletion.getTime() === today.getTime();

        return {
            completedToday,
            lastCompletion: user.lastCompletionDate,
            streak: user.streak
        };
    } catch (error) {
        console.error("Get daily status error:", error);
        return {
            completedToday: false,
            lastCompletion: null,
            streak: 0
        };
    }
}
