"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";
import { revalidatePath } from "next/cache";

export async function searchUsers(query: string) {
    const currentUser = await getOrCreateUser();
    if (!currentUser) return { success: false, error: "Not authenticated" };

    if (!query || query.length < 2) return { success: true, data: [] };

    const isEmail = query.includes('@');
    
    try {
        const users = await prisma.user.findMany({
            where: {
                id: { not: currentUser.id },
                ...(isEmail 
                    ? { email: { equals: query, mode: "insensitive" } }
                    : { name: { contains: query, mode: "insensitive" } }
                )
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                level: true,
                actPoints: true
            },
            take: 10
        });

        // Get existing request statuses
        const friendRequests = await prisma.friendRequest.findMany({
            where: {
                OR: [
                    { senderId: currentUser.id, receiverId: { in: users.map((u: any) => u.id) } },
                    { receiverId: currentUser.id, senderId: { in: users.map((u: any) => u.id) } }
                ]
            }
        });

        const usersWithStatus = users.map(user => {
            const request = friendRequests.find((r: any) => 
                (r.senderId === currentUser.id && r.receiverId === user.id) ||
                (r.receiverId === currentUser.id && r.senderId === user.id)
            );
            return {
                ...user,
                connectionStatus: request ? request.status : "NONE",
                isSender: request ? request.senderId === currentUser.id : false,
                requestId: request?.id
            };
        });

        return { success: true, data: usersWithStatus };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Search failed" };
    }
}

export async function sendFriendRequest(receiverId: string) {
    const currentUser = await getOrCreateUser();
    if (!currentUser) return { success: false, error: "Not authenticated" };

    try {
        // Create request
        const request = await prisma.friendRequest.create({
            data: {
                senderId: currentUser.id,
                receiverId
            }
        });

        // Create notification for receiver
        await prisma.notification.create({
            data: {
                userId: receiverId,
                type: "FRIEND_REQUEST",
                content: `${currentUser.name || currentUser.email.split('@')[0]} sent you a friend request.`,
                relatedId: request.id
            }
        });

        revalidatePath("/dashboard/community");
        return { success: true, data: request };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to send request" };
    }
}

export async function acceptFriendRequest(requestId: string) {
    const currentUser = await getOrCreateUser();
    if (!currentUser) return { success: false, error: "Not authenticated" };

    try {
        const request = await prisma.friendRequest.update({
            where: { id: requestId, receiverId: currentUser.id },
            data: { status: "ACCEPTED" },
            include: { sender: true }
        });

        // Create notification for sender
        await prisma.notification.create({
            data: {
                userId: request.senderId,
                type: "REQUEST_ACCEPTED",
                content: `${currentUser.name || currentUser.email.split('@')[0]} accepted your friend request!`,
                relatedId: currentUser.id
            }
        });

        revalidatePath("/dashboard/community");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to accept request" };
    }
}

export async function rejectFriendRequest(requestId: string) {
    const currentUser = await getOrCreateUser();
    if (!currentUser) return { success: false, error: "Not authenticated" };

    try {
        await prisma.friendRequest.update({
            where: { id: requestId, receiverId: currentUser.id },
            data: { status: "REJECTED" }
        });

        revalidatePath("/dashboard/community");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to reject request" };
    }
}

export async function getNetworkData() {
    const currentUser = await getOrCreateUser();
    if (!currentUser) return { success: false, error: "Not authenticated" };

    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Fetch all friend requests involving this user
        const allRequests = await prisma.friendRequest.findMany({
            where: {
                OR: [
                    { senderId: currentUser.id },
                    { receiverId: currentUser.id }
                ]
            },
            include: {
                sender: { select: { id: true, name: true, email: true, image: true, level: true, actPoints: true } },
                receiver: { select: { id: true, name: true, email: true, image: true, level: true, actPoints: true } }
            },
            orderBy: { updatedAt: "desc" }
        });

        const pendingReceived = allRequests.filter((r: any) => r.receiverId === currentUser.id && r.status === "PENDING");
        const pendingSent = allRequests.filter((r: any) => r.senderId === currentUser.id && r.status === "PENDING");
        
        // All accepted friends
        const allFriends = allRequests.filter((r: any) => r.status === "ACCEPTED").map((r: any) => {
            const isSender = r.senderId === currentUser.id;
            const friend = isSender ? r.receiver : r.sender;
            return {
                ...friend,
                requestId: r.id,
                connectedAt: r.updatedAt
            };
        });

        // Filter recently accepted (within 24h)
        const recentConnections = allFriends.filter((f: any) => new Date(f.connectedAt) > twentyFourHoursAgo);

        return {
            success: true,
            data: {
                pendingReceived,
                pendingSent,
                recentConnections,
                allFriends
            }
        };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to fetch network data" };
    }
}

export async function getNotifications() {
    const currentUser = await getOrCreateUser();
    if (!currentUser) return { success: false, error: "Not authenticated" };

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: currentUser.id },
            orderBy: { createdAt: "desc" },
            take: 20
        });

        const unreadCount = notifications.filter((n: any) => !n.read).length;

        return { success: true, data: { notifications, unreadCount } };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to fetch notifications" };
    }
}

export async function markNotificationsRead() {
    const currentUser = await getOrCreateUser();
    if (!currentUser) return { success: false, error: "Not authenticated" };

    try {
        await prisma.notification.updateMany({
            where: { userId: currentUser.id, read: false },
            data: { read: true }
        });
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to mark notifications read" };
    }
}
