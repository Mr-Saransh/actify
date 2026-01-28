"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";
import { revalidatePath } from "next/cache";

/**
 * Manually use Beyond Act to extend daily limit
 * Called when user clicks "Use Beyond Act" button
 */
export async function useBeyondAct() {
    try {
        const user = await getOrCreateUser() as any;

        if ((user.beyondActCount || 0) <= 0) {
            return {
                success: false,
                message: "No Beyond Act items available"
            };
        }

        // Beyond Act is consumed automatically when unlocking 4th task
        // This action just informs the user about how it works
        return {
            success: true,
            message: "Beyond Act will be consumed when you complete your 3rd task today and unlock the 4th."
        };
    } catch (error) {
        console.error("Use Beyond Act error:", error);
        return {
            success: false,
            message: "Error using Beyond Act"
        };
    }
}

/**
 * Get user's current power-up counts
 */
export async function getPowerUpCounts() {
    try {
        const user = await getOrCreateUser() as any;

        return {
            freezeCount: user.freezeActCount || 0,
            beyondCount: user.beyondActCount || 0
        };
    } catch (error) {
        console.error("Get power-up counts error:", error);
        return {
            freezeCount: 0,
            beyondCount: 0
        };
    }
}

/**
 * Manually activate Liquid Freeze for next miss
 * Note: Freeze is auto-consumed on daily check if user missed a day
 */
export async function useLiquidFreeze() {
    try {
        const user = await getOrCreateUser() as any;

        if ((user.freezeActCount || 0) <= 0) {
            return {
                success: false,
                message: "No Liquid Freeze items available"
            };
        }

        // Freeze is consumed automatically during daily failure check
        // This action just informs the user
        return {
            success: true,
            message: "Liquid Freeze will be automatically used if you miss a day. It prevents failure penalties."
        };
    } catch (error) {
        console.error("Use Liquid Freeze error:", error);
        return {
            success: false,
            message: "Error using Liquid Freeze"
        };
    }
}
