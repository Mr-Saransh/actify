"use server";

import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { getOrCreateUser } from "./user";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GeneratedTaskSchema = z.object({
    title: z.string().describe("Concise title of the task"),
    description: z.string().describe("Detailed explanation of the task"),
    objective: z.string().describe("High-level goal of this specific task"),
    expectedOutput: z.string().describe("What exactly needs to be delivered/proved"),
    resources: z.array(z.string()).describe("Helpful resources, links, or concepts to research"),
    hints: z.string().describe("Optional hints to avoid common pitfalls"),
    estimatedTime: z.number().describe("Estimated time in minutes"),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
});

export type GeneratedTask = z.infer<typeof GeneratedTaskSchema>;

export async function generateNextTask(goalId: string) {
    const user = await getOrCreateUser();
    if (!user) throw new Error("Unauthorized");

    // Fetch Goal and Context
    const rawGoal = await prisma.goal.findUnique({
        where: { id: goalId },
        include: {
            milestones: {
                orderBy: { order: "asc" }
            },
            tasks: {
                orderBy: { createdAt: "desc" },
                take: 5 // Get last 5 tasks for context
            }
        } as any
    });
    const goal = rawGoal as any;

    if (!goal) throw new Error("Goal not found");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const tasksCompletedToday = await prisma.task.count({
        where: {
            goalId: goalId,
            updatedAt: { gte: startOfDay },
            state: "ACCEPTED"
        }
    });

    const { calculateEnforcementMetrics } = await import("@/lib/metrics");
    const metrics = calculateEnforcementMetrics(user as any, goal as any);
    const beyondActCount = (user as any).beyondActCount || 0;
    const baseDailyLimit = metrics.dailyLimit - beyondActCount;

    if (tasksCompletedToday >= metrics.dailyLimit) {
        return { success: false, limitReached: true, message: `Daily capacity reached (${tasksCompletedToday}/${metrics.dailyLimit}).` };
    }

    // Consume a Beyond ACT power-up if they are exceeding their base daily limit
    if (tasksCompletedToday >= baseDailyLimit && beyondActCount > 0) {
        await prisma.user.update({
            where: { id: user.id },
            data: { beyondActCount: { decrement: 1 } } as any
        });
    }

    // Identify Current Milestone
    let currentMilestone = (goal.milestones as any[]).find(m => m.status === "PENDING" || m.status === "IN_PROGRESS");
    
    // If no milestone is pending, they might be done or we need to mark goal complete
    if (!currentMilestone) {
        if (goal.status !== "COMPLETED") {
            // Calculate ACT Currency Payout
            const multiplier = goal.difficulty === "Hard" ? 3 : goal.difficulty === "Medium" ? 2 : 1;
            const size = goal.estimatedHours || 10;
            const totalTasks = goal.tasks.length;
            const acceptedTasks = (goal.tasks as any[]).filter(t => t.state === "ACCEPTED").length;
            const completionPct = totalTasks > 0 ? (acceptedTasks / totalTasks) : 1;
            
            const payout = Math.floor(multiplier * size * completionPct * 10); // * 10 for scaling
            
            await prisma.$transaction(async (tx) => {
                await tx.goal.update({
                    where: { id: goal.id },
                    data: { status: "COMPLETED" }
                });
                await tx.user.update({
                    where: { id: user.id },
                    data: { actCurrency: { increment: payout } } as any
                });
            });
            revalidatePath("/dashboard");
            return { success: false, completed: true, message: `Goal Completed! +${payout} ACT Currency.` };
        }
        return { success: false, completed: true, message: "All milestones completed!" };
    }

    // Identify if the milestone needs to be transitioned from PENDING to IN_PROGRESS
    if (currentMilestone.status === "PENDING") {
        currentMilestone = await (prisma as any).milestone.update({
            where: { id: currentMilestone.id },
            data: { status: "IN_PROGRESS" }
        });
    }

    // Prepare Prompt Context
    const pastTasksContext = (goal.tasks as any[]).length > 0 
        ? (goal.tasks as any[]).map((t: any) => `- [${t.state}] ${t.title}: ${t.objective}`).join("\n")
        : "No tasks completed yet.";

    const prompt = `
        You are an expert Execution Strategist powering the ACTIFY engine.
        Generate exactly ONE highly contextual task for the user based on their current state.

        **Goal Context**:
        Title: ${goal.title}
        Category: ${goal.category}
        Experience Level: ${(goal as any).experienceLevel}

        **Current Milestone**:
        Title: ${currentMilestone.title}
        Description: ${currentMilestone.description}

        **Recent Past Tasks (Last 5)**:
        ${pastTasksContext}

        **Rules**:
        1. Generate exactly ONE task.
        2. It must logically follow the past tasks.
        3. It must contribute directly to the current milestone.
        4. Provide an actionable objective, clear expected output, and useful resources/hints.
        5. Estimated time should be reasonable for a daily task (usually 30-120 minutes).
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING", description: "Concise title of the task" },
                        description: { type: "STRING", description: "Detailed explanation of the task" },
                        objective: { type: "STRING", description: "High-level goal of this specific task" },
                        expectedOutput: { type: "STRING", description: "What exactly needs to be delivered/proved" },
                        resources: { type: "ARRAY", items: { type: "STRING" }, description: "Helpful resources, links, or concepts to research" },
                        hints: { type: "STRING", description: "Optional hints to avoid common pitfalls" },
                        estimatedTime: { type: "INTEGER", description: "Estimated time in minutes" },
                        difficulty: { type: "STRING", description: "Easy, Medium, or Hard" }
                    },
                    required: ["title", "description", "objective", "expectedOutput", "resources", "hints", "estimatedTime", "difficulty"]
                } as any,
            },
        });

        if (!response.text) throw new Error("No response from AI");
        const generatedData = JSON.parse(response.text) as GeneratedTask;

        // Calculate dayIndex
        const totalTasks = await prisma.task.count({ where: { goalId: goalId } });
        const dayIndex = totalTasks + 1;

        // Deadline: End of current day
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        // Save to Database
        const newTask = await prisma.task.create({
            data: {
                goalId: goal.id,
                milestoneId: currentMilestone.id,
                title: generatedData.title,
                description: generatedData.description,
                objective: generatedData.objective,
                expectedOutput: generatedData.expectedOutput,
                resources: generatedData.resources,
                hints: generatedData.hints,
                estimatedTime: generatedData.estimatedTime,
                difficulty: generatedData.difficulty,
                date: new Date(),
                deadline: endOfToday,
                dayIndex: dayIndex,
                state: "ACTIVE"
            } as any
        });

        revalidatePath("/dashboard");
        return { success: true, task: newTask };
    } catch (error) {
        console.error("Failed to generate task", error);
        return { success: false, message: "AI Engine Failed to generate task." };
    }
}
