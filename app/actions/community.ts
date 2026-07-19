"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";
import { revalidatePath } from "next/cache";

export async function sendMessage(receiverId: string, content: string) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized" };

    if (!content.trim()) return { success: false, message: "Message cannot be empty." };

    try {
        await prisma.message.create({
            data: {
                senderId: user.id,
                receiverId,
                content: content.trim()
            }
        });

        revalidatePath("/dashboard/community");
        return { success: true };
    } catch (error) {
        console.error("Send message error:", error);
        return { success: false, message: "Failed to send message." };
    }
}

export async function getConversations() {
    const user = await getOrCreateUser();
    if (!user) return { success: false, data: [] };

    try {
        // Fetch users we have chatted with
        const sentTo = await prisma.message.findMany({
            where: { senderId: user.id },
            select: { receiverId: true }
        });
        const receivedFrom = await prisma.message.findMany({
            where: { receiverId: user.id },
            select: { senderId: true }
        });

        const otherUserIds = Array.from(new Set([
            ...sentTo.map(m => m.receiverId),
            ...receivedFrom.map(m => m.senderId)
        ]));

        if (otherUserIds.length === 0) {
            // Give them a dummy user to talk to if empty
            const systemUser = await prisma.user.findFirst({ where: { id: { not: user.id } } });
            if (systemUser) {
                otherUserIds.push(systemUser.id);
            }
        }

        const users = await prisma.user.findMany({
            where: { id: { in: otherUserIds } },
            select: { id: true, name: true, image: true, email: true }
        });

        return { success: true, data: users };
    } catch (error) {
        console.error("Get conversations error:", error);
        return { success: false, data: [] };
    }
}

export async function getMessages(otherUserId: string) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, data: [] };

    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: user.id, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: user.id }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });
        return { success: true, data: messages };
    } catch (error) {
        console.error("Get messages error:", error);
        return { success: false, data: [] };
    }
}
