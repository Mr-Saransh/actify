import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { userId: clerkId } = getAuth(request);
    if (!clerkId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    let isClientConnected = true;

    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (data: any) => {
                if (!isClientConnected) return;
                try {
                    const encodedText = new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
                    controller.enqueue(encodedText);
                } catch (e) {
                    isClientConnected = false;
                }
            };

            // Send initial connection success
            sendEvent({ type: 'connected', userId: user.id });
            
            let lastCheck = new Date();

            const intervalId = setInterval(async () => {
                if (!isClientConnected) {
                    clearInterval(intervalId);
                    return;
                }

                try {
                    // Check for new 1-on-1 messages
                    const newMessages = await prisma.message.findMany({
                        where: {
                            receiverId: user.id,
                            createdAt: { gt: lastCheck }
                        },
                        include: { sender: { select: { id: true, name: true, image: true } } }
                    });

                    // Check for new group messages (simplified: check all groups user is in)
                    const userGroups = await (prisma as any).groupMember.findMany({
                        where: { userId: user.id },
                        select: { groupId: true }
                    });
                    
                    const groupIds = userGroups.map((g: any) => g.groupId);
                    
                    const newGroupMessages = await (prisma as any).groupMessage.findMany({
                        where: {
                            groupId: { in: groupIds },
                            senderId: { not: user.id },
                            createdAt: { gt: lastCheck }
                        },
                        include: { sender: { select: { id: true, name: true, image: true } } }
                    });

                    if (newMessages.length > 0 || newGroupMessages.length > 0) {
                        sendEvent({ 
                            type: 'new_messages', 
                            messages: newMessages,
                            groupMessages: newGroupMessages 
                        });
                    }

                    // Heartbeat
                    sendEvent({ type: 'ping' });
                    
                    lastCheck = new Date();
                } catch (error) {
                    console.error("SSE Poll error", error);
                }
            }, 2000);

            // Cleanup when stream cancels
            request.signal.addEventListener("abort", () => {
                isClientConnected = false;
                clearInterval(intervalId);
            });
        },
        cancel() {
            isClientConnected = false;
        }
    });

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
