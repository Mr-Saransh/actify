"use client";

import { MessageSquare, Send, User, Search, Users, UserPlus, Check, X, Clock, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useRef, useTransition } from "react";
import { getMessages, sendMessage } from "@/app/actions/community";
import { searchUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from "@/app/actions/network";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface CommunityClientProps {
    currentUserId: string;
    networkData: {
        pendingReceived: any[];
        pendingSent: any[];
        recentConnections: any[];
        allFriends: any[];
    };
}

export function CommunityClient({ currentUserId, networkData }: CommunityClientProps) {
    // Chat state
    const [selectedUser, setSelectedUser] = useState<any | null>(networkData.allFriends.length > 0 ? networkData.allFriends[0] : null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Network State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, startSearch] = useTransition();
    const [isActionPending, startAction] = useTransition();

    // -- CHAT LOGIC --
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
        interval = setInterval(fetchMessages, 3000); // Poll chat
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

        const res = await sendMessage(selectedUser.id, text);
        if (!res.success) {
            toast({ className: "bg-destructive text-destructive-foreground border-destructive", title: "Message failed", description: res.message });
        }
        setIsSending(false);
    };

    // -- NETWORK LOGIC --
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        startSearch(async () => {
            const res = await searchUsers(searchQuery);
            if (res.success && res.data) setSearchResults(res.data);
        });
    };

    const handleSendRequest = (id: string) => {
        startAction(async () => {
            await sendFriendRequest(id);
            toast({ title: "Request Sent" });
            const res = await searchUsers(searchQuery);
            if (res.success && res.data) setSearchResults(res.data);
        });
    };

    const handleAccept = (reqId: string) => {
        startAction(async () => {
            await acceptFriendRequest(reqId);
            toast({ title: "Friend request accepted!" });
            window.location.reload();
        });
    };

    const handleReject = (reqId: string) => {
        startAction(async () => {
            await rejectFriendRequest(reqId);
            toast({ title: "Friend request rejected" });
            window.location.reload();
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12 h-[calc(100vh-8rem)] flex flex-col">
            <div className="space-y-1 shrink-0">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    Community Hub
                </h1>
                <p className="text-sm text-muted-foreground">Expand your network, track connections, and communicate with allies.</p>
            </div>

            <Tabs defaultValue="network" className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4 shrink-0">
                    <TabsTrigger value="network">My Network</TabsTrigger>
                    <TabsTrigger value="chat">Comms Link</TabsTrigger>
                </TabsList>

                {/* NETWORK TAB */}
                <TabsContent value="network" className="flex-1 flex flex-col min-h-0 overflow-y-auto space-y-8 animate-slide-up bg-card/30 rounded-xl p-4 border border-border">
                    {/* Search */}
                    <section className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Search className="w-4 h-4" /> Find Operatives
                        </h2>
                        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                            <Input 
                                placeholder="Search by name or email..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-background"
                            />
                            <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                                {isSearching ? "Searching..." : "Search"}
                            </Button>
                        </form>

                        {searchResults.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                {searchResults.map(u => (
                                    <div key={u.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10 border border-border">
                                                <AvatarImage src={u.image} />
                                                <AvatarFallback>{u.name?.substring(0, 2).toUpperCase() || u.email.substring(0,2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <Link href={`/dashboard/profile/${u.id}`} className="font-semibold text-sm hover:underline">{u.name || u.email.split('@')[0]}</Link>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Level {u.level} • {u.actPoints} ACT</p>
                                            </div>
                                        </div>
                                        <div>
                                            {u.connectionStatus === "NONE" && (
                                                <Button size="sm" variant="outline" onClick={() => handleSendRequest(u.id)} disabled={isActionPending}>Add</Button>
                                            )}
                                            {u.connectionStatus === "PENDING" && u.isSender && (
                                                <Button size="sm" variant="secondary" disabled><Clock className="w-3 h-3 mr-1"/> Sent</Button>
                                            )}
                                            {u.connectionStatus === "PENDING" && !u.isSender && (
                                                <Button size="sm" variant="outline" onClick={() => handleAccept(u.requestId)} disabled={isActionPending}>Accept</Button>
                                            )}
                                            {u.connectionStatus === "ACCEPTED" && (
                                                <Button size="sm" variant="ghost" disabled className="text-emerald-500"><UserCheck className="w-4 h-4" /></Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Pending Requests */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <UserPlus className="w-4 h-4" /> Pending Requests
                            </h2>
                            {networkData.pendingReceived.length === 0 ? (
                                <p className="text-sm text-muted-foreground p-4 bg-background rounded-lg border border-border/50 text-center">No incoming requests.</p>
                            ) : (
                                <div className="space-y-3">
                                    {networkData.pendingReceived.map((req) => (
                                        <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={req.sender.image} />
                                                    <AvatarFallback>{req.sender.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <Link href={`/dashboard/profile/${req.sender.id}`} className="font-semibold text-sm hover:underline">{req.sender.name || req.sender.email.split('@')[0]}</Link>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10" onClick={() => handleAccept(req.id)} disabled={isActionPending}>
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleReject(req.id)} disabled={isActionPending}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Recent Connections */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <UserCheck className="w-4 h-4" /> Recent Connections (24h)
                            </h2>
                            {networkData.recentConnections.length === 0 ? (
                                <p className="text-sm text-muted-foreground p-4 bg-background rounded-lg border border-border/50 text-center">No recent connections.</p>
                            ) : (
                                <div className="space-y-3">
                                    {networkData.recentConnections.map((friend) => (
                                        <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={friend.image} />
                                                    <AvatarFallback>{friend.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <Link href={`/dashboard/profile/${friend.id}`} className="font-semibold text-sm hover:underline">{friend.name || friend.email.split('@')[0]}</Link>
                                            </div>
                                            <span className="text-xs text-muted-foreground">Connected recently</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </TabsContent>

                {/* CHAT TAB */}
                <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 animate-slide-up m-0">
                    <div className="flex-1 border border-border bg-card rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm">
                        {/* Contacts Pane */}
                        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border bg-secondary/20 flex flex-col shrink-0">
                            <div className="p-4 border-b border-border bg-card/50">
                                <h2 className="font-semibold text-sm">Friends List</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {networkData.allFriends.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground">No friends yet. Add connections in the Network tab.</div>
                                ) : (
                                    networkData.allFriends.map(user => (
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
                                        <Link href={`/dashboard/profile/${selectedUser.id}`} className="font-semibold text-sm hover:underline">{selectedUser.name || selectedUser.email}</Link>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                                        {messages.length === 0 ? (
                                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                                Start the mission comms!
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
                                                placeholder="Message your ally..." 
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
                                    <p>Select a friend to open comms link</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
