"use server";

import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { unlockNextLevel } from "./task";

const SubmitProofSchema = z.object({
    explanation: z.string().min(10, "Explanation must be detailed (min 10 chars)"),
    content: z.string().min(1, "Link or text proof is required"),
});

export async function submitProof(taskId: string, formData: FormData) {
    const prisma = await getPrisma();
    const rawData = {
        explanation: formData.get("explanation"),
        content: formData.get("content"),
    };

    const validatedFields = SubmitProofSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Invalid submission. Please provide explanation and proof URL/Content.",
        };
    }

    const { explanation, content } = validatedFields.data;

    try {
        // Mock AI Verification Logic
        // 1. Text Length Check (Must be >= 20 chars)
        const isTooShort = explanation.length < 20;

        // 2. Keyword/Sentiment Check (Mocking AI semantic analysis)
        const lowEffortKeywords = ["fake", "silly", "joke", "don't take it serious", "lazy", "test", "spam", "not real"];
        const containsRedFlags = lowEffortKeywords.some(keyword => explanation.toLowerCase().includes(keyword));

        const isRejected = isTooShort || containsRedFlags;

        if (isRejected) {
            let feedback = "⚠️ Analysis: Logic insufficient. The explanation provided lacks the required implementation details and conceptual depth. Please elaborate on the 'How' and 'Why', not just the 'What'. (-2 Points)";

            if (containsRedFlags) {
                feedback = "⚠️ Analysis: ZERO TOLERANCE. Automated filters detected non-serious submission patterns. This protocol requires absolute commitment. Attempting to bypass verification with low-effort content results in immediate penalty. (-2 Points)";
            }

            await prisma.$transaction(async (tx) => {
                // 1. Upsert Proof (Rejected) - Handle retries
                await tx.proof.upsert({
                    where: { taskId: taskId },
                    create: {
                        taskId: taskId,
                        content: content,
                        explanation: explanation,
                        reviewStatus: "REJECTED",
                        aiFeedback: feedback
                    },
                    update: {
                        content: content,
                        explanation: explanation,
                        reviewStatus: "REJECTED",
                        aiFeedback: feedback
                    }
                });

                // 2. Update Task Status
                await tx.task.update({
                    where: { id: taskId },
                    data: { state: "REJECTED" }
                });

                // 3. Update User Metrics (Penalty)
                // Check if user has points to lose to avoid negative? Or allow negative.
                // We'll allow negative for "Pressure".
                const taskMeta = await tx.task.findUnique({ where: { id: taskId }, include: { goal: true } });
                if (taskMeta) {
                    await tx.user.update({
                        where: { id: taskMeta.goal.userId },
                        data: {
                            points: { decrement: 2 }
                        }
                    });
                }
            });

            revalidatePath("/dashboard");
            revalidatePath("/dashboard/history");
            return { success: false, message: "❌ Proof Rejected (too short). -2 Points. Try again." };
        }

        // SUCCESS PATH
        const goalId = await prisma.$transaction(async (tx) => {
            // 1. Upsert Proof (Accepted)
            await tx.proof.upsert({
                where: { taskId: taskId },
                create: {
                    taskId: taskId,
                    content: content,
                    explanation: explanation,
                    reviewStatus: "ACCEPTED",
                    aiFeedback: "⚡ Instant Verification: Proof accepted. Execution validated. +5 Points."
                },
                update: {
                    content: content,
                    explanation: explanation,
                    reviewStatus: "ACCEPTED",
                    aiFeedback: "⚡ Instant Verification: Proof accepted. Execution validated. +5 Points."
                }
            });

            // 2. Update Task Status
            const task = await tx.task.update({
                where: { id: taskId },
                data: { state: "ACCEPTED" },
                include: { goal: true }
            });

            // 3. Update User Metrics (Streak & Points)
            await tx.user.update({
                where: { id: task.goal.userId },
                data: {
                    streak: { increment: 1 },
                    points: { increment: 5 }
                }
            });

            return task.goalId;
        });

        // Unlock Level N+1 (Await this!)
        await unlockNextLevel(goalId);

    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Database Error: Failed to submit proof.",
        };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/history");
    return { success: true, message: "⚡ Proof Verified! +5 Points. Next Level Unlocked." };
}
