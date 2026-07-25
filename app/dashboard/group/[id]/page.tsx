export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getOrCreateUser } from "@/app/actions/user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GroupDetailsClient } from "./group-client";

interface GroupPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function GroupPage({ params }: GroupPageProps) {
    const { id } = await params;
    const currentUser = await getOrCreateUser();

    if (!currentUser) {
        redirect("/sign-in");
    }

    const group = await (prisma as any).group.findUnique({
        where: { id },
        include: {
            members: {
                include: { user: { select: { id: true, name: true, image: true, email: true, level: true, actPoints: true } } }
            },
            sharedResources: true
        }
    });

    if (!group) {
        redirect("/dashboard/chat");
    }

    // Check if the current user is a member of this group
    const isMember = group.members.some((m: any) => m.userId === currentUser.id);
    if (!isMember) {
        redirect("/dashboard/chat");
    }

    return (
        <GroupDetailsClient group={group} />
    );
}
