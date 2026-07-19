"use server";

import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { getOrCreateUser } from "./user";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Schema definitions matching our requirements
const MilestoneSchema = z.object({
    id: z.string().optional(), // For UI tracking
    title: z.string(),
    description: z.string(),
    duration: z.number().describe("Duration in hours"),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
});

const MissionPlanSchema = z.object({
    name: z.string().describe("e.g., Fast Track, Balanced, Deep Learning"),
    estimatedHours: z.number(),
    difficulty: z.string(),
    successProbability: z.number().min(0).max(100),
    commitment: z.string(),
    risks: z.array(z.string()),
    milestones: z.array(MilestoneSchema),
});

const MultiplePlansResponseSchema = z.object({
    plans: z.array(MissionPlanSchema).length(3), // Exactly 3 plans
});

export type MissionPlan = z.infer<typeof MissionPlanSchema>;
export type MilestonePlan = z.infer<typeof MilestoneSchema>;

export async function generateMissionPlans(
    statement: string,
    category: string,
    deadline: string,
    timePerDay: number,
    experienceLevel: string,
    description: string
) {
    const user = await getOrCreateUser();
    if (!user) throw new Error("Unauthorized");

    const prompt = `
        You are an expert Execution Strategist.
        Generate exactly 3 mission plans (Fast Track, Balanced, Deep Learning) for the following Goal:
        
        Goal Statement: ${statement}
        Category: ${category}
        Deadline: ${deadline}
        Time Available Per Day: ${timePerDay} minutes
        Experience Level: ${experienceLevel}
        Description: ${description}

        For each plan, provide the estimated total hours, difficulty, success probability, commitment required, potential risks, and a list of structured milestones.
        Make sure the milestones are actionable and logical.
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
                        plans: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    name: { type: "STRING" },
                                    estimatedHours: { type: "INTEGER" },
                                    difficulty: { type: "STRING" },
                                    successProbability: { type: "INTEGER" },
                                    commitment: { type: "STRING" },
                                    risks: { type: "ARRAY", items: { type: "STRING" } },
                                    milestones: {
                                        type: "ARRAY",
                                        items: {
                                            type: "OBJECT",
                                            properties: {
                                                title: { type: "STRING" },
                                                description: { type: "STRING" },
                                                duration: { type: "INTEGER" },
                                                difficulty: { type: "STRING" }
                                            },
                                            required: ["title", "description", "duration", "difficulty"]
                                        }
                                    }
                                },
                                required: ["name", "estimatedHours", "difficulty", "successProbability", "commitment", "risks", "milestones"]
                            }
                        }
                    },
                    required: ["plans"]
                } as any,
            },
        });

        if (!response.text) throw new Error("No response from AI");
        return JSON.parse(response.text) as z.infer<typeof MultiplePlansResponseSchema>;
    } catch (error) {
        console.error("Failed to generate mission plans", error);
        throw new Error("Failed to generate mission plans");
    }
}

const SplitMilestoneResponseSchema = z.object({
    milestones: z.array(MilestoneSchema),
});

export async function suggestMilestoneSplit(milestoneTitle: string, milestoneDescription: string) {
    const user = await getOrCreateUser();
    if (!user) throw new Error("Unauthorized");

    const prompt = `
        The user wants to split the following milestone into smaller, more manageable sub-milestones.
        
        Milestone: ${milestoneTitle}
        Description: ${milestoneDescription}
        
        Provide 2 to 4 logical sub-milestones that add up to the original milestone's intent.
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
                        milestones: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    title: { type: "STRING" },
                                    description: { type: "STRING" },
                                    duration: { type: "INTEGER" },
                                    difficulty: { type: "STRING" }
                                },
                                required: ["title", "description", "duration", "difficulty"]
                            }
                        }
                    },
                    required: ["milestones"]
                } as any,
            },
        });

        if (!response.text) throw new Error("No response from AI");
        return JSON.parse(response.text) as z.infer<typeof SplitMilestoneResponseSchema>;
    } catch (error) {
        console.error("Failed to split milestone", error);
        throw new Error("Failed to split milestone");
    }
}

export async function approveMission(
    goalData: {
        title: string;
        description: string;
        category: string;
        timePerDay: number;
        experienceLevel: string;
        deadline: string;
    },
    planData: MissionPlan
) {
    const user = await getOrCreateUser();
    if (!user) throw new Error("Unauthorized");

    try {
         await prisma.$transaction(async (tx) => {
            const goal = await tx.goal.create({
                data: {
                    userId: user.id,
                    title: goalData.title,
                    description: goalData.description,
                    category: goalData.category,
                    timePerDay: goalData.timePerDay,
                    experienceLevel: goalData.experienceLevel,
                    deadline: new Date(goalData.deadline),
                    estimatedHours: planData.estimatedHours,
                    difficulty: planData.difficulty,
                    successProbability: planData.successProbability,
                    commitment: planData.commitment,
                    risks: planData.risks,
                    status: "ACTIVE",
                } as any,
            });

            const milestonesData = planData.milestones.map((m, index) => ({
                goalId: goal.id,
                title: m.title,
                description: m.description,
                order: index,
                duration: m.duration,
                difficulty: m.difficulty,
            }));

            await (tx as any).milestone.createMany({
                data: milestonesData,
            });
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to approve mission", error);
        return { success: false, message: "Database Error: Failed to save mission." };
    }
}
