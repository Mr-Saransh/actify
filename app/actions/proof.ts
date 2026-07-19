"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const SubmitProofSchema = z.object({
    explanation: z.string().min(10, "Explanation must be detailed (min 10 chars)"),
    content: z.string().min(1, "Link or text proof is required"),
});

export async function submitProof(taskId: string, formData: FormData) {
    // 1. Extract Data
    const explanation = formData.get("explanation") as string;
    const content = formData.get("content") as string;
    const imageFile = formData.get("image") as File | null;

    // 2. Validate Text
    const validatedFields = SubmitProofSchema.safeParse({ explanation, content });

    if (!validatedFields.success) {
        return { success: false, message: "Invalid submission. Please provide explanation and proof URL/Content." };
    }

    // 3. Process Image (if provided)
    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
        if (imageFile.size > 2 * 1024 * 1024) return { success: false, message: "Image too large. Max 2MB." };
        try {
            const buffer = await imageFile.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");
            imageUrl = `data:${imageFile.type};base64,${base64}`;
        } catch (e) {
            return { success: false, message: "Failed to process image. Try another." };
        }
    }

    const { explanation: validExplanation, content: validContent } = validatedFields.data;

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { goal: true }
        });
        if (!task) return { success: false, message: "Task not found" };

        const category = task.goal.category;

        // Validation Routing Based on Category
        let reviewStatus: "PENDING_QUIZ" | "ACCEPTED" | "REJECTED" = "ACCEPTED";
        let validationType = "MOCK";
        let feedback = "⚡ Proof Verified! +5 ACT Points.";

        if (category === "Learning" || category === "Reading" || category === "Research") {
            reviewStatus = "PENDING_QUIZ";
            validationType = "QUIZ";
            feedback = "Proof registered. Complete the Quiz to finalize validation.";
        } else if (category === "Project") {
            validationType = "CODE_REVIEW";
            if (validExplanation.length < 20 || validContent.length < 10) {
                reviewStatus = "REJECTED";
                feedback = "⚠️ Code Review Failed: Insufficient details or missing repository link. (-3 ACT Points)";
            }
        } else if (category === "Writing") {
            validationType = "GRAMMAR";
            if (validExplanation.length < 20) {
                reviewStatus = "REJECTED";
                feedback = "⚠️ Grammar Review Failed: Explanation is too short or contains poor phrasing. (-3 ACT Points)";
            }
        } else if (category === "Fitness") {
            validationType = "METRICS";
            if (!imageUrl && !validContent.includes("http")) {
                reviewStatus = "REJECTED";
                feedback = "⚠️ Metrics Validation Failed: Please provide an image or link to your workout stats. (-3 ACT Points)";
            }
        }

        // Apply Penalty if Rejected
        if (reviewStatus === "REJECTED") {
            await prisma.$transaction(async (tx) => {
                await tx.proof.upsert({
                    where: { taskId: taskId },
                    create: { taskId, content: validContent, imageUrl, explanation: validExplanation, reviewStatus, aiFeedback: feedback, validationType },
                    update: { content: validContent, imageUrl, explanation: validExplanation, reviewStatus, aiFeedback: feedback, validationType }
                });
                await tx.task.update({ where: { id: taskId }, data: { state: "REJECTED" } });
                await tx.user.update({
                    where: { id: task.goal.userId },
                    data: { actPoints: { decrement: 3 }, failures: { increment: 1 } }
                });
            });
            revalidatePath("/dashboard");
            return { success: false, message: feedback };
        }

        // Handle PENDING_QUIZ
        if (reviewStatus === "PENDING_QUIZ") {
            const proof = await prisma.proof.upsert({
                where: { taskId: taskId },
                create: { taskId, content: validContent, imageUrl, explanation: validExplanation, reviewStatus, aiFeedback: feedback, validationType },
                update: { content: validContent, imageUrl, explanation: validExplanation, reviewStatus, aiFeedback: feedback, validationType }
            });
            await prisma.task.update({ where: { id: taskId }, data: { state: "SUBMITTED" } });
            revalidatePath("/dashboard");
            return { success: true, message: feedback, requiresQuiz: true, proofId: proof.id };
        }

        // Handle ACCEPTED
        await prisma.$transaction(async (tx) => {
            await tx.proof.upsert({
                where: { taskId: taskId },
                create: { taskId, content: validContent, imageUrl, explanation: validExplanation, reviewStatus, aiFeedback: feedback, validationType },
                update: { content: validContent, imageUrl, explanation: validExplanation, reviewStatus, aiFeedback: feedback, validationType }
            });
            await tx.task.update({ where: { id: taskId }, data: { state: "ACCEPTED" } });
            
            const startOfDay = (date: Date): Date => {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);
                return d;
            };
            const today = startOfDay(new Date());
            const user = await tx.user.findUnique({ where: { id: task.goal.userId } }) as any;
            const lastCompletion = user?.lastCompletionDate ? startOfDay(new Date(user.lastCompletionDate)) : null;
            const isFirstTaskToday = !lastCompletion || lastCompletion.getTime() < today.getTime();

            await tx.user.update({
                where: { id: task.goal.userId },
                data: {
                    streak: { increment: 1 },
                    actPoints: { increment: 5 },
                    tasksCompleted: { increment: 1 },
                    ...(isFirstTaskToday && { lastCompletionDate: new Date(), dailyTaskCompleted: true })
                } as any
            });
        });

        // Generate Next Task automatically
        const { generateNextTask } = await import("./ai-task");
        const nextTaskResult = await generateNextTask(task.goalId);
        if (!nextTaskResult.success) {
            console.log("Auto-generation skipped or limit reached:", nextTaskResult.message);
        }

        revalidatePath("/dashboard");
        return { success: true, message: feedback };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Database Error: Failed to submit proof." };
    }
}
