"use client";

import { MessageSquare } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getMessages, sendMessage, getGroupMessages, sendGroupMessage, deleteMessageAction, togglePinMessage } from "@/app/actions/chat";
import { useToast } from "@/hooks/use-toast";

import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessageList } from "@/components/chat/chat-message-list";

interface ChatClientProps {
    currentUserId: string;
    friends: any[];
    groups: any[];
}

export function ChatClient({ currentUserId, friends, groups }: ChatClientProps) {
    const { toast } = useToast();
    
    // Selection state: can be a friend (1-on-1) or a group
    const [selectedChat, setSelectedChat] = useState<{ type: 'user' | 'group', data: any } | null>(null);
    
    const [messages, setMessages] = useState<any[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Fetch
    useEffect(() => {
        if (!selectedChat) return;
        
        const fetchMessages = async () => {
            if (selectedChat.type === 'user') {
                const res = await getMessages(selectedChat.data.id);
                if (res.success && res.data) setMessages(res.data);
            } else if (selectedChat.type === 'group') {
                const res = await getGroupMessages(selectedChat.data.id);
                if (res.success && res.data) setMessages(res.data);
            }
            scrollToBottom();
        };

        fetchMessages();
    }, [selectedChat]);

    // Setup SSE connection for real-time updates
    useEffect(() => {
        const eventSource = new EventSource('/api/chat/stream');

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'new_messages') {
                    // Update state if messages belong to currently opened chat
                    if (!selectedChat) return;
                    
                    if (selectedChat.type === 'user') {
                        const relevantMessages = data.messages?.filter((m: any) => m.senderId === selectedChat.data.id) || [];
                        if (relevantMessages.length > 0) {
                            setMessages(prev => {
                                const newIds = new Set(relevantMessages.map((m: any) => m.id));
                                const filteredPrev = prev.filter(p => !newIds.has(p.id));
                                return [...filteredPrev, ...relevantMessages].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                            });
                            scrollToBottom();
                        }
                    } else if (selectedChat.type === 'group') {
                        const relevantMessages = data.groupMessages?.filter((m: any) => m.groupId === selectedChat.data.id) || [];
                        if (relevantMessages.length > 0) {
                            setMessages(prev => {
                                const newIds = new Set(relevantMessages.map((m: any) => m.id));
                                const filteredPrev = prev.filter(p => !newIds.has(p.id));
                                return [...filteredPrev, ...relevantMessages].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                            });
                            scrollToBottom();
                        }
                    }
                }
            } catch (error) {
                console.error("SSE parse error", error);
            }
        };

        eventSource.onerror = () => {
            // Reconnects automatically
        };

        return () => {
            eventSource.close();
        };
    }, [selectedChat]);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 100);
    };

    const handleSendMessage = async (text: string, type: string = "TEXT", metadata?: any) => {
        if (!selectedChat) return;

        setIsSending(true);
        
        // Optimistic update
        const tempId = 'temp-' + Date.now();
        setMessages(prev => [...prev, { 
            id: tempId, 
            content: text, 
            type,
            metadata,
            senderId: currentUserId, 
            createdAt: new Date(),
            sender: { id: currentUserId, name: "Me", image: "" }
        }]);
        scrollToBottom();

        if (selectedChat.type === 'user') {
            const res = await sendMessage(selectedChat.data.id, text, type, metadata);
            if (!res.success) toast({ title: "Failed", description: res.message, className: "bg-destructive text-white" });
        } else {
            const res = await sendGroupMessage(selectedChat.data.id, text, type, metadata);
            if (!res.success) toast({ title: "Failed", description: res.message, className: "bg-destructive text-white" });
        }
        
        // Let the SSE or polling replace temp message if needed, but for now it's fine.
        setIsSending(false);
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!selectedChat || messageId.startsWith('temp-')) return;
        
        // Optimistic
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, deletedAt: new Date(), content: "This message was deleted." } : m));
        
        await deleteMessageAction(messageId, selectedChat.type === 'group');
    };

    const handlePinMessage = async (messageId: string, isPinned: boolean) => {
        if (!selectedChat || messageId.startsWith('temp-')) return;
        
        // Optimistic
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPinned } : m));
        
        await togglePinMessage(messageId, selectedChat.type === 'group', isPinned);
    };

    return (
        <div className="max-w-[1400px] mx-auto h-full flex flex-col md:space-y-4">
            <div className={`space-y-1 shrink-0 ${selectedChat ? 'hidden md:block' : 'block p-4 md:p-0'}`}>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Comms Link
                </h1>
                <p className="text-sm text-muted-foreground">Direct messages and execution group chats.</p>
            </div>

            <div className={`flex-1 border-y md:border border-border bg-card md:rounded-2xl overflow-hidden flex shadow-sm min-h-0 -mx-4 md:mx-0`}>
                {/* Left Sidebar (Contacts & Groups) */}
                <div className={`
                    ${selectedChat ? 'hidden md:flex' : 'flex w-full'}
                    ${isSidebarOpen ? 'md:w-[320px]' : 'md:w-0'}
                    h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden
                `}>
                    <div className="w-full md:w-[320px] h-full shrink-0">
                        <ChatSidebar 
                            friends={friends} 
                            groups={groups} 
                        selectedChat={selectedChat} 
                        setSelectedChat={(chat) => {
                            setSelectedChat(chat);
                        }} 
                    />
                    </div>
                </div>

                {/* Right Chat Pane */}
                <div className={`${!selectedChat ? 'hidden md:flex' : 'flex'} flex-1 min-h-0 relative w-full`}>
                    {selectedChat ? (
                        <div className="flex-1 flex flex-col min-h-0 bg-background/50 relative">
                            {/* Chat Header */}
                            <ChatHeader 
                                selectedChat={selectedChat} 
                                onBack={() => setSelectedChat(null)}
                                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                                isSidebarOpen={isSidebarOpen}
                            />

                            {/* Messages Area */}
                            <ChatMessageList 
                                messages={messages} 
                                currentUserId={currentUserId} 
                                isGroup={selectedChat.type === 'group'} 
                                scrollRef={scrollRef}
                                onDelete={handleDeleteMessage}
                                onPin={handlePinMessage}
                            />

                            {/* Input Area */}
                            <ChatInput onSendMessage={handleSendMessage} isSending={isSending} />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-background/50">
                            <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mb-6">
                                <MessageSquare className="w-10 h-10 opacity-50" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">Your Comms Link</h3>
                            <p className="max-w-xs">Select a group or a friend from the sidebar to start encrypted communications.</p>
                        </div>
                    )}
                    
                </div>
            </div>
        </div>
    );
}
