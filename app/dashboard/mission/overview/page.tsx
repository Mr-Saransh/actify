export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getOrCreateUser } from "@/app/actions/user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MissionOverviewClient } from "./client";

export default async function MissionOverviewPage() {
    
    const user = await getOrCreateUser();

    if (!user) {
        return <div className="flex items-center justify-center h-full text-muted-foreground">Authenticating...</div>;
    }

    // Fetch the approved or active goal with its milestones
    const goal = await prisma.goal.findFirst({
        where: {
            userId: user.id,
            status: { in: ["APPROVED", "ACTIVE"] },
        },
        include: {
            milestones: {
                orderBy: { order: "asc" },
            },
        },
    } as any);

    if (!goal) {
        // If there's no approved or active goal, redirect to dashboard
        redirect("/dashboard");
    }

    const isReadOnly = (goal as any).status === "ACTIVE";

    return <MissionOverviewClient goal={goal as any} readOnly={isReadOnly} />;
}
