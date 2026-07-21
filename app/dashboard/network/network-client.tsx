"use client";

import { Users, Search, UserPlus, Check, X, Clock, UserCheck, Plus, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useTransition } from "react";
import { searchUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from "@/app/actions/network";
import { createGroup } from "@/app/actions/chat";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NetworkClientProps {
    currentUserId: string;
    networkData: {
        pendingReceived: any[];
        pendingSent: any[];
        recentConnections: any[];
        allFriends: any[];
    };
}

export function NetworkClient({ currentUserId, networkData }: NetworkClientProps) {
    const { toast } = useToast();
    const router = useRouter();

    // Network State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, startSearch] = useTransition();
    const [isActionPending, startAction] = useTransition();

    // Group State
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedFriendsForGroup, setSelectedFriendsForGroup] = useState<string[]>([]);
    const [isCreatingGroup, startCreateGroup] = useTransition();

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

    // -- GROUP LOGIC --
    const toggleFriendForGroup = (friendId: string) => {
        setSelectedFriendsForGroup(prev => 
            prev.includes(friendId) 
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleCreateGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupName.trim()) {
            toast({ title: "Error", description: "Group name is required", className: "bg-destructive text-destructive-foreground border-destructive" });
            return;
        }

        startCreateGroup(async () => {
            const res = await createGroup(groupName, selectedFriendsForGroup);
            if (res.success) {
                toast({ title: "Success", description: res.message });
                setIsCreateGroupOpen(false);
                setGroupName("");
                setSelectedFriendsForGroup([]);
                router.push("/dashboard/chat"); // Redirect to chat
            } else {
                toast({ title: "Error", description: res.message, className: "bg-destructive text-destructive-foreground border-destructive" });
            }
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        Network
                    </h1>
                    <p className="text-sm text-muted-foreground">Search for operatives, build your squad, and create tactical groups.</p>
                </div>
                
                <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                    <DialogTrigger asChild>
                        <Button className="animate-scale-in shadow-sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Group
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create a New Group</DialogTitle>
                            <DialogDescription>
                                Create a WhatsApp-style group to coordinate with multiple operatives at once.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateGroup} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Group Name</label>
                                <Input placeholder="e.g. Alpha Squad" value={groupName} onChange={(e) => setGroupName(e.target.value)} required />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Add Members ({selectedFriendsForGroup.length})</label>
                                <div className="max-h-[200px] overflow-y-auto space-y-2 p-2 border border-border rounded-lg bg-secondary/10">
                                    {networkData.allFriends.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">You have no friends to add to a group.</p>
                                    ) : (
                                        networkData.allFriends.map(friend => (
                                            <div 
                                                key={friend.id} 
                                                className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${selectedFriendsForGroup.includes(friend.id) ? 'bg-primary/20 border border-primary/30' : 'hover:bg-secondary/50 border border-transparent'}`}
                                                onClick={() => toggleFriendForGroup(friend.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-6 h-6">
                                                        <AvatarImage src={friend.image} />
                                                        <AvatarFallback>{(friend.name || friend.email).substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium">{friend.name || friend.email.split('@')[0]}</span>
                                                </div>
                                                {selectedFriendsForGroup.includes(friend.id) && (
                                                    <Check className="w-4 h-4 text-primary" />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isCreatingGroup}>
                                {isCreatingGroup ? "Creating..." : "Create Group"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto space-y-8 animate-slide-up bg-card/30 rounded-xl p-6 border border-border">
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
                            className="bg-background shadow-sm"
                        />
                        <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                            {isSearching ? "Searching..." : "Search"}
                        </Button>
                    </form>

                    {searchResults.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                            {searchResults.map(u => (
                                <div key={u.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card shadow-sm">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border/50">
                    {/* Pending Requests */}
                    <section className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <UserPlus className="w-4 h-4" /> Pending Requests
                        </h2>
                        {networkData.pendingReceived.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 bg-background rounded-xl border border-border/50 text-center">
                                <Shield className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                <p className="text-sm text-muted-foreground">No incoming requests.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {networkData.pendingReceived.map((req) => (
                                    <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5 shadow-sm">
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
                            <div className="flex flex-col items-center justify-center p-8 bg-background rounded-xl border border-border/50 text-center">
                                <Users className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                <p className="text-sm text-muted-foreground">No recent connections.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {networkData.recentConnections.map((friend) => (
                                    <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={friend.image} />
                                                <AvatarFallback>{friend.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <Link href={`/dashboard/profile/${friend.id}`} className="font-semibold text-sm hover:underline">{friend.name || friend.email.split('@')[0]}</Link>
                                        </div>
                                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">New</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
