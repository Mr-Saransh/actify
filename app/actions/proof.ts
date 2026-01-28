"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { unlockNextLevel } from "./task";

const SubmitProofSchema = z.object({
    explanation: z.string().min(10, "Explanation must be detailed (min 10 chars)"),
    content: z.string().min(1, "Link or text proof is required"),
});

export async function submitProof(taskId: string, formData: FormData) {
    // 1. Extract Data
    const explanation = formData.get("explanation") as string;
    const content = formData.get("content") as string;
    const imageFile = formData.get("image") as File | null; // Get image file

    // 2. Validate Text
    const validatedFields = SubmitProofSchema.safeParse({ explanation, content });

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Invalid submission. Please provide explanation and proof URL/Content.",
        };
    }

    // 3. Process Image (if provided)
    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
        // Basic Size Limit Check (e.g., 2MB)
        if (imageFile.size > 2 * 1024 * 1024) {
            return { success: false, message: "Image too large. Max 2MB." };
        }

        try {
            const buffer = await imageFile.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");
            const mimeType = imageFile.type;
            imageUrl = `data:${mimeType};base64,${base64}`;
        } catch (e) {
            console.error("Image processing failed", e);
            // Fail gracefully or strict? Strict for Actify.
            return { success: false, message: "Failed to process image. Try another." };
        }
    }

    const { explanation: validExplanation, content: validContent } = validatedFields.data;

    try {
        // Mock AI Verification Logic
        // 1. Check if explanation is too short
        const isTooShort = validExplanation.length < 20;

        // 2. Keyword check
        const lowEffortKeywords = ["fake", "silly", "joke", "don't take it serious", "lazy", "test", "spam", "not real"];
        const containsRedFlags = lowEffortKeywords.some(keyword => validExplanation.toLowerCase().includes(keyword));

        const isRejected = isTooShort || containsRedFlags;

        if (isRejected) {
            let feedback = "⚠️ Analysis: Logic insufficient. The explanation provided lacks the required implementation details. (-2 ACT Points)";
            if (containsRedFlags) {
                feedback = "⚠️ Analysis: ZERO TOLERANCE. Automated filters detected non-serious submission patterns. (-2 ACT Points)";
            }

            // REJECT TRANSACTION
            await prisma.$transaction(async (tx) => {
                // 1. Upsert Proof (Rejected)
                await tx.proof.upsert({
                    where: { taskId: taskId },
                    create: {
                        taskId: taskId,
                        content: validContent,
                        imageUrl: imageUrl, // Save Image
                        explanation: validExplanation,
                        reviewStatus: "REJECTED",
                        aiFeedback: feedback
                    },
                    update: {
                        content: validContent,
                        imageUrl: imageUrl, // Update Image
                        explanation: validExplanation,
                        reviewStatus: "REJECTED",
                        aiFeedback: feedback
                    }
                });

                // 2. Update Task Status
                await tx.task.update({
                    where: { id: taskId },
                    data: { state: "REJECTED" }
                });

                // 3. Update User Metrics
                const taskMeta = await tx.task.findUnique({ where: { id: taskId }, include: { goal: true } });
                if (taskMeta) {
                    await tx.user.update({
                        where: { id: taskMeta.goal.userId },
                        data: {
                            actPoints: { decrement: 2 },
                            failures: { increment: 1 }
                        }
                    });
                }
            });

            revalidatePath("/dashboard");
            return { success: false, message: "❌ Proof Rejected. -2 ACT Points." };
        }

        // SUCCESS TRANSACTION
        const goalId = await prisma.$transaction(async (tx) => {
            // 1. Upsert Proof (Accepted)
            await tx.proof.upsert({
                where: { taskId: taskId },
                create: {
                    taskId: taskId,
                    content: validContent,
                    imageUrl: imageUrl, // Save Image
                    explanation: validExplanation,
                    reviewStatus: "ACCEPTED",
                    aiFeedback: "⚡ Instant Verification: Proof accepted. +5 ACT Points."
                },
                update: {
                    content: validContent,
                    imageUrl: imageUrl, // Update Image
                    explanation: validExplanation,
                    reviewStatus: "ACCEPTED",
                    aiFeedback: "⚡ Instant Verification: Proof accepted. +5 ACT Points."
                }
            });

            // 2. Update Task
            const task = await tx.task.update({
                where: { id: taskId },
                data: { state: "ACCEPTED" },
                include: { goal: true }
            });

            // Helper for daily tracking
            const startOfDay = (date: Date): Date => {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);
                return d;
            };

            const today = startOfDay(new Date());
            const user = await tx.user.findUnique({ where: { id: task.goal.userId } }) as any;
            const lastCompletion = user?.lastCompletionDate ? startOfDay(new Date(user.lastCompletionDate)) : null;
            const isFirstTaskToday = !lastCompletion || lastCompletion.getTime() < today.getTime();

            // 3. Update User Metrics with Daily Tracking
            await tx.user.update({
                where: { id: task.goal.userId },
                data: {
                    streak: { increment: 1 },
                    actPoints: { increment: 5 },
                    tasksCompleted: { increment: 1 },
                    // Mark daily completion if first task today
                    ...(isFirstTaskToday && {
                        lastCompletionDate: new Date(),
                        dailyTaskCompleted: true
                    })
                } as any
            });

            return task.goalId;
        });

        // Unlock Next Level
        await unlockNextLevel(goalId);

        // Revalidate to update daily status badge and stats
        revalidatePath("/dashboard");

    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Database Error: Failed to submit proof.",
        };
    }

    revalidatePath("/dashboard");
    return { success: true, message: "⚡ Proof Verified! +5 ACT Points." };
}
