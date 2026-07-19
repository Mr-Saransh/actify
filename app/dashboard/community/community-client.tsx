"use client";

import { MessageSquare, Send, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { getConversations, getMessages, sendMessage } from "@/app/actions/community";

interface CommunityClientProps {
    currentUserId: string;
}

export function CommunityClient({ currentUserId }: CommunityClientProps) {
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getConversations().then(res => {
            if (res.success && res.data) {
                setConversations(res.data);
                if (res.data.length > 0) {
                    setSelectedUser(res.data[0]);
                }
            }
        });
    }, []);

    useEffect(() => {
        if (!selectedUser) return;
        let interval: NodeJS.Timeout;

        const fetchMessages = () => {
            getMessages(selectedUser.id).then(res => {
                if (res.success && res.data) {
                    setMessages(res.data);
                    // Scroll to bottom
                    if (scrollRef.current) {
                        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }
                }
            });
        };

        fetchMessages();
        interval = setInterval(fetchMessages, 3000); // Simple polling
        return () => clearInterval(interval);
    }, [selectedUser]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        setIsSending(true);
        const text = newMessage;
        setNewMessage(""); // Optimistic clear
        
        // Optimistic UI update
        setMessages(prev => [...prev, { id: 'temp', content: text, senderId: currentUserId, createdAt: new Date() }]);

        await sendMessage(selectedUser.id, text);
        setIsSending(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12 h-[calc(100vh-8rem)] flex flex-col">
            <div className="space-y-1 shrink-0">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Community Chat
                </h1>
                <p className="text-sm text-muted-foreground">Connect with buyers and sellers directly.</p>
            </div>

            <div className="flex-1 border border-border bg-card rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm animate-slide-up">
                {/* Contacts Pane */}
                <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border bg-secondary/20 flex flex-col shrink-0">
                    <div className="p-4 border-b border-border bg-card/50">
                        <h2 className="font-semibold text-sm">Conversations</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-6 text-center text-sm text-muted-foreground">No conversations yet.</div>
                        ) : (
                            conversations.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`w-full text-left p-4 flex items-center gap-3 transition-colors hover:bg-secondary/50 border-b border-border/50 ${selectedUser?.id === user.id ? 'bg-secondary border-l-2 border-l-primary' : ''}`}
                                >
                                    <Avatar className="w-10 h-10 border border-border shrink-0">
                                        <AvatarImage src={user.image} />
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {(user.name || user.email).substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="overflow-hidden">
                                        <p className="font-medium text-sm truncate">{user.name || user.email.split('@')[0]}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Pane */}
                <div className="flex-1 flex flex-col min-h-0 bg-background/50">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-border bg-card/50 flex items-center gap-3 shrink-0">
                                <Avatar className="w-8 h-8 border border-border">
                                    <AvatarImage src={selectedUser.image} />
                                    <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-sm">{selectedUser.name || selectedUser.email}</span>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                                {messages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                        Say hello!
                                    </div>
                                ) : (
                                    messages.map((msg, i) => {
                                        const isMe = msg.senderId === currentUserId;
                                        return (
                                            <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary text-secondary-foreground rounded-bl-sm border border-border'}`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 bg-card border-t border-border shrink-0">
                                <form onSubmit={handleSend} className="flex gap-2">
                                    <Input 
                                        placeholder="Type a message..." 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="bg-secondary/50"
                                    />
                                    <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
