"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";
import { revalidatePath } from "next/cache";

// ==========================================
// 1-on-1 Messages (Migrated from community.ts)
// ==========================================

export async function getMessages(friendId: string) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized", data: [] };

    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: user.id, receiverId: friendId },
                    { senderId: friendId, receiverId: user.id }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });
        return { success: true, data: messages };
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { success: false, message: "Failed to fetch messages", data: [] };
    }
}

export async function sendMessage(receiverId: string, content: string) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized" };

    if (!content.trim()) return { success: false, message: "Message cannot be empty" };

    try {
        await prisma.message.create({
            data: {
                senderId: user.id,
                receiverId,
                content
            }
        });
        
        revalidatePath("/dashboard/chat");
        return { success: true, message: "Message sent" };
    } catch (error) {
        console.error("Error sending message:", error);
        return { success: false, message: "Failed to send message" };
    }
}

// ==========================================
// Group Actions
// ==========================================

export async function createGroup(name: string, friendIds: string[]) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized" };

    if (!name.trim()) return { success: false, message: "Group name is required" };

    try {
        const group = await (prisma as any).group.create({
            data: {
                name,
                members: {
                    create: [
                        { userId: user.id, role: "ADMIN" },
                        ...friendIds.map(id => ({ userId: id, role: "MEMBER" }))
                    ]
                }
            }
        });

        revalidatePath("/dashboard/network");
        revalidatePath("/dashboard/chat");
        return { success: true, message: "Group created successfully!", groupId: group.id };
    } catch (error) {
        console.error("Error creating group:", error);
        return { success: false, message: "Failed to create group" };
    }
}

export async function getGroups() {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized", data: [] };

    try {
        const userGroups = await (prisma as any).groupMember.findMany({
            where: { userId: user.id },
            include: {
                group: {
                    include: {
                        members: {
                            include: { user: { select: { id: true, name: true, image: true, email: true } } }
                        }
                    }
                }
            }
        });

        const groups = userGroups.map((gm: any) => gm.group);
        return { success: true, data: groups };
    } catch (error) {
        console.error("Error fetching groups:", error);
        return { success: false, message: "Failed to fetch groups", data: [] };
    }
}

export async function getGroupMessages(groupId: string) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized", data: [] };

    try {
        // Verify membership
        const isMember = await (prisma as any).groupMember.findUnique({
            where: { groupId_userId: { groupId, userId: user.id } }
        });

        if (!isMember) return { success: false, message: "Not a member of this group", data: [] };

        const messages = await (prisma as any).groupMessage.findMany({
            where: { groupId },
            include: {
                sender: { select: { id: true, name: true, image: true, email: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
        
        return { success: true, data: messages };
    } catch (error) {
        console.error("Error fetching group messages:", error);
        return { success: false, message: "Failed to fetch group messages", data: [] };
    }
}

export async function sendGroupMessage(groupId: string, content: string) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized" };
    if (!content.trim()) return { success: false, message: "Message cannot be empty" };

    try {
        // Verify membership
        const isMember = await (prisma as any).groupMember.findUnique({
            where: { groupId_userId: { groupId, userId: user.id } }
        });

        if (!isMember) return { success: false, message: "Not a member of this group" };

        await (prisma as any).groupMessage.create({
            data: {
                groupId,
                senderId: user.id,
                content
            }
        });
        
        revalidatePath("/dashboard/chat");
        return { success: true, message: "Message sent" };
    } catch (error) {
        console.error("Error sending group message:", error);
        return { success: false, message: "Failed to send message" };
    }
}
