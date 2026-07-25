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
        const messages = await (prisma as any).message.findMany({
            where: {
                OR: [
                    { senderId: user.id, receiverId: friendId },
                    { senderId: friendId, receiverId: user.id }
                ]
            },
            include: {
                sender: { select: { id: true, name: true, image: true, email: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
        return { success: true, data: messages };
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { success: false, message: "Failed to fetch messages", data: [] };
    }
}

export async function sendMessage(receiverId: string, content: string, type: string = "TEXT", metadata?: any, replyToId?: string) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized" };

    if (!content.trim() && type === "TEXT") return { success: false, message: "Message cannot be empty" };

    try {
        await (prisma as any).message.create({
            data: {
                senderId: user.id,
                receiverId,
                content,
                type,
                metadata: metadata ? metadata : undefined,
                replyToId
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

export async function sendGroupMessage(groupId: string, content: string, type: string = "TEXT", metadata?: any, replyToId?: string) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized" };
    if (!content.trim() && type === "TEXT") return { success: false, message: "Message cannot be empty" };

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
                content,
                type,
                metadata: metadata ? metadata : undefined,
                replyToId
            }
        });
        
        revalidatePath("/dashboard/chat");
        return { success: true, message: "Message sent" };
    } catch (error) {
        console.error("Error sending group message:", error);
        return { success: false, message: "Failed to send message" };
    }
}

// ==========================================
// Message Interactions (Execution Features)
// ==========================================

export async function togglePinMessage(messageId: string, isGroup: boolean, isPinned: boolean) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized" };

    try {
        if (isGroup) {
            await (prisma as any).groupMessage.update({
                where: { id: messageId },
                data: { isPinned }
            });
        } else {
            await (prisma as any).message.update({
                where: { id: messageId },
                data: { isPinned }
            });
        }
        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error) {
        console.error("Error pinning message:", error);
        return { success: false, message: "Failed to pin message" };
    }
}

export async function deleteMessageAction(messageId: string, isGroup: boolean) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized" };

    try {
        if (isGroup) {
            // Should check if sender is user or admin, keeping simple for demo
            await (prisma as any).groupMessage.update({
                where: { id: messageId, senderId: user.id },
                data: { deletedAt: new Date(), content: "This message was deleted." }
            });
        } else {
            await (prisma as any).message.update({
                where: { id: messageId, senderId: user.id },
                data: { deletedAt: new Date(), content: "This message was deleted." }
            });
        }
        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error) {
        console.error("Error deleting message:", error);
        return { success: false, message: "Failed to delete message" };
    }
}

export async function reactToMessage(messageId: string, isGroup: boolean, emoji: string) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized" };

    try {
        const model = isGroup ? (prisma as any).groupMessage : (prisma as any).message;
        const msg = await model.findUnique({ where: { id: messageId } });
        if (!msg) return { success: false, message: "Not found" };

        // Parse existing reactions or start new
        let reactions: any[] = [];
        if (msg.reactions && typeof msg.reactions === 'string') {
            try { reactions = JSON.parse(msg.reactions); } catch(e){}
        } else if (Array.isArray(msg.reactions)) {
            reactions = msg.reactions;
        }

        // Toggle logic: if exists, remove it, else add it
        const existingIdx = reactions.findIndex(r => r.userId === user.id && r.emoji === emoji);
        if (existingIdx >= 0) {
            reactions.splice(existingIdx, 1);
        } else {
            reactions.push({ emoji, userId: user.id });
        }

        await model.update({
            where: { id: messageId },
            data: { reactions: reactions }
        });

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (error) {
        console.error("Error reacting:", error);
        return { success: false, message: "Failed to react" };
    }
}

export async function shareExecutionResource(title: string, url: string, type: string, groupId?: string, receiverId?: string) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized" };

    try {
        // 1. Create the Shared Resource
        const resource = await (prisma as any).sharedResource.create({
            data: {
                title,
                url,
                type,
                groupId: groupId || undefined
            }
        });

        // 2. Send the message containing the resource
        const metadata = { resourceId: resource.id, title, url, type };
        if (groupId) {
            await sendGroupMessage(groupId, "Shared an execution resource.", "RESOURCE", metadata);
        } else if (receiverId) {
            await sendMessage(receiverId, "Shared an execution resource.", "RESOURCE", metadata);
        }

        return { success: true, resourceId: resource.id };
    } catch (error) {
        console.error("Error sharing resource:", error);
        return { success: false, message: "Failed to share resource" };
    }
}

