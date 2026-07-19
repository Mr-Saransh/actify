import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

export async function POST(req: NextRequest) {
    try {
        const { proofId } = await req.json();

        // 1. Fetch Proof and Context
        const rawProof = await prisma.proof.findUnique({
            where: { id: proofId },
            include: {
                task: {
                    include: { goal: true }
                }
            } as any
        });
        const proof = rawProof as any;

        if (!proof || proof.reviewStatus !== "PENDING_QUIZ") {
            return NextResponse.json({ error: "Invalid proof or quiz already completed." }, { status: 400 });
        }

        // 2. Generate deterministic seed if not present
        let seed = proof.quizSeed;
        if (!seed) {
            seed = Math.floor(Math.random() * 1000000);
            await prisma.proof.update({
                where: { id: proof.id },
                data: { quizSeed: seed } as any
            });
        }

        // 3. Generate MCQs using AI
        const prompt = `
            You are an expert examiner. Generate exactly 5 Multiple Choice Questions (MCQs) to test the user's knowledge based on their submission.
            
            **Goal**: ${proof.task.goal.title}
            **Task Objective**: ${proof.task.objective || proof.task.title}
            **User Explanation**: ${proof.explanation}
            
            Rules:
            1. Return exactly 5 questions.
            2. Each question must have exactly 4 options.
            3. The correct answer must be one of the options.
            4. Make it challenging but fair.
            
            Output strictly in JSON format matching this schema:
            {
                "questions": [
                    {
                        "q": "Question text",
                        "options": ["A", "B", "C", "D"],
                        "answer": "The correct option text exactly matching one of the options"
                    }
                ]
            }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        if (!response.text) throw new Error("AI returned empty response");
        const data = JSON.parse(response.text);

        // 4. Extract Questions and Answers
        const clientQuestions = data.questions.map((q: any, i: number) => ({
            id: i,
            text: q.q,
            options: q.options
        }));

        const correctAnswers = data.questions.map((q: any, i: number) => ({
            id: i,
            answer: q.answer
        }));

        // 5. Encrypt Answers in JWT
        const answerToken = jwt.sign({ answers: correctAnswers, proofId }, JWT_SECRET, { expiresIn: '1h' });

        return NextResponse.json({
            questions: clientQuestions,
            token: answerToken
        });

    } catch (error) {
        console.error("Quiz Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
    }
}
