"use client";

import { Users, Search, MoreVertical, Pin, BellOff, Trash, Archive } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface ChatSidebarProps {
    friends: any[];
    groups: any[];
    selectedChat: { type: 'user' | 'group', data: any } | null;
    setSelectedChat: (chat: { type: 'user' | 'group', data: any } | null) => void;
}

export function ChatSidebar({ friends, groups, selectedChat, setSelectedChat }: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredFriends = friends.filter(f => {
        const name = f.name || f.email;
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="w-full md:w-[320px] border-r border-border bg-secondary/10 flex flex-col shrink-0 h-full">
            <div className="p-4 border-b border-border shrink-0">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search conversations..." 
                        className="pl-9 bg-card border-transparent focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar">
                {/* Groups Section */}
                {filteredGroups.length > 0 && (
                    <div className="py-2">
                        <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Operations (Groups)</div>
                        {filteredGroups.map(group => {
                            const isSelected = selectedChat?.type === 'group' && selectedChat.data.id === group.id;
                            return (
                                <div key={group.id} className={`w-full text-left p-3 flex items-center justify-between transition-colors hover:bg-secondary/50 border-l-2 cursor-pointer group/item ${isSelected ? 'bg-secondary border-l-primary' : 'border-l-transparent'}`} onClick={() => setSelectedChat({ type: 'group', data: group })}>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="relative">
                                            <Avatar className="w-10 h-10 border border-border shrink-0">
                                                <AvatarImage src={group.imageUrl} />
                                                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                                    <Users className="w-5 h-5" />
                                                </AvatarFallback>
                                            </Avatar>
                                            {/* Online Indicator */}
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                                        </div>
                                        <div className="overflow-hidden flex-1">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-sm truncate">{group.name}</p>
                                                <span className="text-[10px] text-muted-foreground shrink-0">Just now</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate line-clamp-1">
                                                Active mission protocol running...
                                            </p>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <button className="p-1 hover:bg-background rounded-md text-muted-foreground">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem><Pin className="w-4 h-4 mr-2" /> Pin Chat</DropdownMenuItem>
                                                <DropdownMenuItem><BellOff className="w-4 h-4 mr-2" /> Mute</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive"><Trash className="w-4 h-4 mr-2" /> Leave</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Friends Section */}
                {filteredFriends.length > 0 && (
                    <div className="py-2">
                        <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Direct Comms</div>
                        {filteredFriends.map(user => {
                            const isSelected = selectedChat?.type === 'user' && selectedChat.data.id === user.id;
                            return (
                                <div key={user.id} className={`w-full text-left p-3 flex items-center justify-between transition-colors hover:bg-secondary/50 border-l-2 cursor-pointer group/item ${isSelected ? 'bg-secondary border-l-primary' : 'border-l-transparent'}`} onClick={() => setSelectedChat({ type: 'user', data: user })}>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="relative">
                                            <Avatar className="w-10 h-10 border border-border shrink-0">
                                                <AvatarImage src={user.image} />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {(user.name || user.email).substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="overflow-hidden flex-1">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-sm truncate">{user.name || user.email.split('@')[0]}</p>
                                                <span className="text-[10px] text-muted-foreground shrink-0">2m</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate line-clamp-1">
                                                Standing by for updates.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <button className="p-1 hover:bg-background rounded-md text-muted-foreground">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem><Pin className="w-4 h-4 mr-2" /> Pin Chat</DropdownMenuItem>
                                                <DropdownMenuItem><Archive className="w-4 h-4 mr-2" /> Archive</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive"><Trash className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
