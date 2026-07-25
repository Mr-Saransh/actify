"use server";

import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { getOrCreateUser } from "./user";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MilestoneSchema = z.object({
    id: z.string().optional(), // For UI tracking
    title: z.string(),
    description: z.string(),
    duration: z.number().describe("Duration in hours"),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
});

const MissionPlanSchema = z.object({
    name: z.string().describe("Must be exactly 'Execution Sprint', 'Strategic Execution', or 'Mastery Protocol'"),
    estimatedHours: z.number(),
    difficulty: z.string(),
    successProbability: z.number().min(0).max(100),
    probabilityExplanation: z.string().describe("Short explanation of why this probability was assigned based on the timeline and scope"),
    commitment: z.string(),
    risks: z.array(z.string()),
    milestones: z.array(MilestoneSchema),
});

const AnalysisSchema = z.object({
    availableHours: z.number().describe("Calculated from user's deadline and daily time"),
    minimumHours: z.number().describe("Absolute minimum hours needed for basic proficiency"),
    recommendedHours: z.number().describe("Realistic hours needed for a standard achievement"),
    masteryHours: z.number().describe("Hours needed for genuine mastery without compromises"),
    feasibility: z.string().describe("Evaluation of whether the user's deadline is realistic"),
    constraints: z.string().describe("Major constraints based on available time"),
    recommendations: z.string().describe("Overarching recommendations based on the analysis"),
});

const MultiplePlansResponseSchema = z.object({
    analysis: AnalysisSchema,
    plans: z.array(MissionPlanSchema).length(3), // Exactly 3 plans
});

export type MissionPlan = z.infer<typeof MissionPlanSchema>;
export type MilestonePlan = z.infer<typeof MilestoneSchema>;
export type MissionAnalysis = z.infer<typeof AnalysisSchema>;

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

    // Calculate Available Hours
    const deadlineDate = new Date(deadline);
    const today = new Date();
    // Default to at least 1 day to avoid 0 hours
    const availableDays = Math.max(1, Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const availableHours = Math.floor((availableDays * timePerDay) / 60);

    const prompt = `
        You are an expert Execution Strategist for the ACTIFY system.
        Generate exactly 3 distinct mission blueprints for the user's goal.
        
        **User Parameters:**
        Goal Statement: ${statement}
        Category: ${category}
        Deadline: ${deadline} (approx ${availableDays} days from now)
        Time Available Per Day: ${timePerDay} minutes
        Calculated Total Available Hours: ${availableHours} hours
        Experience Level: ${experienceLevel}
        Description: ${description}

        **Mission Analysis Required:**
        First, perform a Mission Analysis comparing the user's Available Hours (${availableHours}h) to realistic time requirements for this goal. Estimate minimum, recommended, and mastery hours based on industry standards. Evaluate feasibility and provide constraints and recommendations.

        **Blueprint Generation Rules:**
        Generate exactly 3 plans in this exact order and philosophy:

        1. Execution Sprint (Blueprint 1)
        - MUST strictly respect the user's deadline (${deadline}) and available hours (${availableHours}h).
        - Never extend the timeline. 
        - If the requested goal cannot realistically be completed within the available time, heavily reduce the scope to what is actually possible. Provide a MVP/core version of the goal.
        - Name MUST be exactly "Execution Sprint".

        2. Strategic Execution (Blueprint 2)
        - IGNORE the user's deadline.
        - Recommend the ideal, practical timeline and scope required to genuinely achieve the user's original goal.
        - This should represent the most realistic and balanced approach.
        - Name MUST be exactly "Strategic Execution".

        3. Mastery Protocol (Blueprint 3)
        - IGNORE the user's deadline completely.
        - Design a roadmap for genuine mastery of the subject. No compromises.
        - Include advanced concepts, deep dives, best practices, and rigorous portfolio-quality work.
        - Name MUST be exactly "Mastery Protocol".

        **Success Probability Logic:**
        - Execution Sprint: Chance of completing the *reduced scope* within the tight deadline. Explain why.
        - Strategic Execution: Chance of completing the recommended roadmap. Usually the highest probability because it's realistic. Explain why.
        - Mastery Protocol: Chance of reaching genuine mastery. Naturally lower due to the massive commitment required. Explain why.
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
                        analysis: {
                            type: "OBJECT",
                            properties: {
                                availableHours: { type: "INTEGER" },
                                minimumHours: { type: "INTEGER" },
                                recommendedHours: { type: "INTEGER" },
                                masteryHours: { type: "INTEGER" },
                                feasibility: { type: "STRING" },
                                constraints: { type: "STRING" },
                                recommendations: { type: "STRING" }
                            },
                            required: ["availableHours", "minimumHours", "recommendedHours", "masteryHours", "feasibility", "constraints", "recommendations"]
                        },
                        plans: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    name: { type: "STRING" },
                                    estimatedHours: { type: "INTEGER" },
                                    difficulty: { type: "STRING" },
                                    successProbability: { type: "INTEGER" },
                                    probabilityExplanation: { type: "STRING" },
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
                                required: ["name", "estimatedHours", "difficulty", "successProbability", "probabilityExplanation", "commitment", "risks", "milestones"]
                            }
                        }
                    },
                    required: ["analysis", "plans"]
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
                    status: "APPROVED",
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

export async function beginMission(goalId: string) {
    const user = await getOrCreateUser();
    if (!user) throw new Error("Unauthorized");

    try {
        await prisma.goal.update({
            where: { id: goalId, userId: user.id },
            data: { status: "ACTIVE" }
        });
        
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to begin mission", error);
        return { success: false, message: "Failed to begin mission." };
    }
}
