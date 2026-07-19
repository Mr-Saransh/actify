import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

export async function POST(req: NextRequest) {
    try {
        const { proofId, userAnswers, token, isAntiCheatFail } = await req.json();

        const proof = await prisma.proof.findUnique({
            where: { id: proofId },
            include: { task: { include: { goal: true } } }
        });

        if (!proof || proof.reviewStatus !== "PENDING_QUIZ") {
            return NextResponse.json({ error: "Invalid proof or quiz already completed." }, { status: 400 });
        }

        // Anti-Cheat Fail
        if (isAntiCheatFail) {
            await handleFail(proof.taskId, proof.task.goal.userId, "⚠️ Anti-Cheat Protocol Triggered. Quiz terminated. (-3 ACT Points)");
            return NextResponse.json({ success: true, passed: false, score: 0, message: "Anti-Cheat Triggered. Failed." });
        }

        // Verify Token
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (e) {
            return NextResponse.json({ error: "Invalid or expired quiz session." }, { status: 401 });
        }

        if (decoded.proofId !== proofId) {
            return NextResponse.json({ error: "Token mismatch." }, { status: 400 });
        }

        const correctAnswers = decoded.answers;
        let score = 0;

        // Calculate Score
        correctAnswers.forEach((ans: any) => {
            const userAns = userAnswers.find((ua: any) => ua.id === ans.id);
            if (userAns && userAns.answer === ans.answer) {
                score += 10; // 10 questions * 10 points = 100 max
            }
        });

        const passed = score >= 80;

        if (passed) {
            await handlePass(proof.taskId, proof.task.goal.userId, `⚡ Quiz Passed! Score: ${score}%. +5 ACT Points.`);
        } else {
            await handleFail(proof.taskId, proof.task.goal.userId, `⚠️ Quiz Failed. Score: ${score}%. Minimum 80% required. (-3 ACT Points)`);
        }

        return NextResponse.json({ success: true, passed, score });
    } catch (error) {
        console.error("Quiz Grading Error:", error);
        return NextResponse.json({ error: "Failed to grade quiz" }, { status: 500 });
    }
}

async function handlePass(taskId: string, userId: string, feedback: string) {
    await prisma.$transaction(async (tx) => {
        await tx.proof.update({
            where: { taskId },
            data: { reviewStatus: "ACCEPTED", aiFeedback: feedback }
        });
        
        const task = await tx.task.update({
            where: { id: taskId },
            data: { state: "ACCEPTED" }
        });

        const startOfDay = (date: Date): Date => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d;
        };
        const today = startOfDay(new Date());
        const user = await tx.user.findUnique({ where: { id: userId } }) as any;
        const lastCompletion = user?.lastCompletionDate ? startOfDay(new Date(user.lastCompletionDate)) : null;
        const isFirstTaskToday = !lastCompletion || lastCompletion.getTime() < today.getTime();

        await tx.user.update({
            where: { id: userId },
            data: {
                streak: { increment: 1 },
                actPoints: { increment: 5 },
                tasksCompleted: { increment: 1 },
                ...(isFirstTaskToday && { lastCompletionDate: new Date(), dailyTaskCompleted: true })
            } as any
        });
    });

    // We can trigger the next task generation here by calling an endpoint or it can be done on dashboard load.
}

async function handleFail(taskId: string, userId: string, feedback: string) {
    await prisma.$transaction(async (tx) => {
        await tx.proof.update({
            where: { taskId },
            data: { reviewStatus: "REJECTED", aiFeedback: feedback }
        });
        await tx.task.update({
            where: { id: taskId },
            data: { state: "REJECTED" }
        });
        await tx.user.update({
            where: { id: userId },
            data: { actPoints: { decrement: 3 }, failures: { increment: 1 } }
        });
    });
}
