import { QuizEngine } from "@/components/quiz-engine";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface QuizPageProps {
    params: {
        proofId: string;
    }
}

export default async function QuizPage({ params }: QuizPageProps) {
    const proofId = params.proofId;

    const proof = await prisma.proof.findUnique({
        where: { id: proofId },
        select: { reviewStatus: true }
    });

    if (!proof) {
        redirect("/dashboard");
    }

    if (proof.reviewStatus !== "PENDING_QUIZ") {
        redirect("/dashboard");
    }

    return (
        <QuizEngine proofId={proofId} />
    );
}
