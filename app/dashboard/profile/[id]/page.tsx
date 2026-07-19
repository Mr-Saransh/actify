export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getOrCreateUser } from "@/app/actions/user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

interface ProfilePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { id } = await params;
    const currentUser = await getOrCreateUser();

    if (!currentUser) {
        redirect("/sign-in");
    }

    const profileUser = await prisma.user.findUnique({
        where: { id }
    });

    if (!profileUser) {
        redirect("/dashboard/leaderboard");
    }

    // Check relationship
    const request = await prisma.friendRequest.findFirst({
        where: {
            OR: [
                { senderId: currentUser.id, receiverId: profileUser.id },
                { receiverId: currentUser.id, senderId: profileUser.id }
            ]
        }
    });

    let connectionStatus = "NONE";
    let isSender = false;

    if (request) {
        connectionStatus = request.status;
        isSender = request.senderId === currentUser.id;
    }

    const isSelf = currentUser.id === profileUser.id;

    return (
        <ProfileClient 
            profileUser={profileUser as any} 
            connectionStatus={connectionStatus}
            isSender={isSender}
            isSelf={isSelf}
        />
    );
}
