"use client";

import { MessageSquare, Send, User, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { getMessages, sendMessage, getGroupMessages, sendGroupMessage } from "@/app/actions/chat";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface ChatClientProps {
    currentUserId: string;
    friends: any[];
    groups: any[];
}

export function ChatClient({ currentUserId, friends, groups }: ChatClientProps) {
    const { toast } = useToast();
    
    // Selection state: can be a friend (1-on-1) or a group
    const [selectedChat, setSelectedChat] = useState<{ type: 'user' | 'group', data: any } | null>(
        groups.length > 0 ? { type: 'group', data: groups[0] } : (friends.length > 0 ? { type: 'user', data: friends[0] } : null)
    );
    
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch messages periodically
    useEffect(() => {
        if (!selectedChat) return;
        
        let interval: NodeJS.Timeout;
        const fetchMessages = async () => {
            if (selectedChat.type === 'user') {
                const res = await getMessages(selectedChat.data.id);
                if (res.success && res.data) setMessages(res.data);
            } else if (selectedChat.type === 'group') {
                const res = await getGroupMessages(selectedChat.data.id);
                if (res.success && res.data) setMessages(res.data);
            }
            
            // Auto scroll to bottom only on first load or if we are already at the bottom
            if (scrollRef.current) {
                // A very basic scroll strategy
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        };

        fetchMessages();
        interval = setInterval(fetchMessages, 3000);
        
        return () => clearInterval(interval);
    }, [selectedChat]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        setIsSending(true);
        const text = newMessage;
        setNewMessage(""); // Optimistic clear
        
        // Optimistic update
        setMessages(prev => [...prev, { 
            id: 'temp-' + Date.now(), 
            content: text, 
            senderId: currentUserId, 
            createdAt: new Date(),
            sender: { id: currentUserId, name: "Me", image: "" } // Mock sender for group optimistic
        }]);

        if (selectedChat.type === 'user') {
            const res = await sendMessage(selectedChat.data.id, text);
            if (!res.success) {
                toast({ title: "Failed", description: res.message, className: "bg-destructive text-white" });
            }
        } else {
            const res = await sendGroupMessage(selectedChat.data.id, text);
            if (!res.success) {
                toast({ title: "Failed", description: res.message, className: "bg-destructive text-white" });
            }
        }
        setIsSending(false);
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-4">
            <div className="space-y-1 shrink-0">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Comms Link
                </h1>
                <p className="text-sm text-muted-foreground">Direct messages and group chats.</p>
            </div>

            <div className="flex-1 border border-border bg-card rounded-2xl overflow-hidden flex shadow-sm min-h-0">
                {/* Left Sidebar (Contacts & Groups) */}
                <div className="w-[80px] md:w-[320px] border-r border-border bg-secondary/10 flex flex-col shrink-0">
                    <div className="flex-1 overflow-y-auto hide-scrollbar">
                        
                        {/* Groups Section */}
                        {groups.length > 0 && (
                            <div className="py-2">
                                <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden md:block">Groups</div>
                                {groups.map(group => (
                                    <button
                                        key={group.id}
                                        onClick={() => setSelectedChat({ type: 'group', data: group })}
                                        className={`w-full text-left p-3 flex items-center justify-center md:justify-start gap-3 transition-colors hover:bg-secondary/50 border-l-2 ${selectedChat?.type === 'group' && selectedChat.data.id === group.id ? 'bg-secondary border-l-primary' : 'border-l-transparent'}`}
                                    >
                                        <Avatar className="w-10 h-10 border border-border shrink-0">
                                            <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                                <Users className="w-5 h-5" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="overflow-hidden hidden md:block">
                                            <p className="font-semibold text-sm truncate">{group.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{group.members?.length || 0} members</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Friends Section */}
                        {friends.length > 0 && (
                            <div className="py-2">
                                <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden md:block">Direct Messages</div>
                                {friends.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => setSelectedChat({ type: 'user', data: user })}
                                        className={`w-full text-left p-3 flex items-center justify-center md:justify-start gap-3 transition-colors hover:bg-secondary/50 border-l-2 ${selectedChat?.type === 'user' && selectedChat.data.id === user.id ? 'bg-secondary border-l-primary' : 'border-l-transparent'}`}
                                    >
                                        <Avatar className="w-10 h-10 border border-border shrink-0">
                                            <AvatarImage src={user.image} />
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {(user.name || user.email).substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="overflow-hidden hidden md:block">
                                            <p className="font-medium text-sm truncate">{user.name || user.email.split('@')[0]}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {groups.length === 0 && friends.length === 0 && (
                            <div className="p-6 text-center text-sm text-muted-foreground hidden md:block">
                                No groups or friends yet. Head to Network to connect.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Chat Pane */}
                <div className="flex-1 flex flex-col min-h-0 bg-background/50 relative">
                    {selectedChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 border-b border-border bg-card/50 flex items-center px-6 gap-4 shrink-0 shadow-sm z-10">
                                {selectedChat.type === 'user' ? (
                                    <Link href={`/dashboard/profile/${selectedChat.data.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                                        <Avatar className="w-10 h-10 border border-border shadow-sm">
                                            <AvatarImage src={selectedChat.data.image} />
                                            <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="font-bold text-base leading-none hover:underline">
                                                {selectedChat.data.name || selectedChat.data.email}
                                            </h2>
                                        </div>
                                    </Link>
                                ) : (
                                    <>
                                        <Avatar className="w-10 h-10 border border-border shadow-sm">
                                            <AvatarFallback className="bg-primary/10 text-primary"><Users className="w-5 h-5" /></AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="font-bold text-base leading-none">
                                                {selectedChat.data.name}
                                            </h2>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {selectedChat.data.members?.map((m: any) => m.user?.name?.split(' ')[0] || 'User').join(', ')}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" ref={scrollRef}>
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm opacity-50">
                                        <MessageSquare className="w-12 h-12 mb-4" />
                                        <p>No messages yet. Say hello!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => {
                                        const isMe = msg.senderId === currentUserId;
                                        const isGroup = selectedChat.type === 'group';
                                        
                                        // Simple grouping logic for consecutive messages
                                        const prevMsg = messages[i - 1];
                                        const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);

                                        return (
                                            <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-6' : 'mt-1'}`}>
                                                {isGroup && !isMe && (
                                                    <div className="w-8 shrink-0 mr-2 flex items-end">
                                                        {showAvatar && (
                                                            <Avatar className="w-8 h-8">
                                                                <AvatarImage src={msg.sender?.image} />
                                                                <AvatarFallback className="text-[10px]">{(msg.sender?.name || "U").substring(0, 2)}</AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                    </div>
                                                )}
                                                <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    {isGroup && !isMe && showAvatar && (
                                                        <span className="text-[10px] text-muted-foreground ml-1 mb-1 font-medium">{msg.sender?.name || 'User'}</span>
                                                    )}
                                                    <div className={`px-4 py-2.5 text-[15px] shadow-sm ${isMe ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm' : 'bg-card text-foreground border border-border rounded-2xl rounded-bl-sm'}`}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-card border-t border-border shrink-0">
                                <form onSubmit={handleSend} className="flex gap-2 items-end max-w-4xl mx-auto">
                                    <Input 
                                        placeholder="Type a message..." 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="bg-secondary/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-11 rounded-full px-5"
                                        autoComplete="off"
                                    />
                                    <Button type="submit" size="icon" className="h-11 w-11 rounded-full shrink-0 shadow-md" disabled={!newMessage.trim() || isSending}>
                                        <Send className="w-5 h-5 ml-1" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
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
