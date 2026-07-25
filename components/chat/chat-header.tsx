"use client";

import { User, Users, MoreVertical, Target, ChevronLeft, PanelLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
    selectedChat: { type: 'user' | 'group', data: any };
    onBack: () => void;
    onToggleSidebar?: () => void;
    isSidebarOpen?: boolean;
}

export function ChatHeader({ selectedChat, onBack, onToggleSidebar, isSidebarOpen }: ChatHeaderProps) {
    return (
        <div className="h-16 border-b border-border bg-card/50 flex items-center justify-between px-4 md:px-6 gap-4 shrink-0 shadow-sm z-10 w-full">
            <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden shrink-0">
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                {onToggleSidebar && (
                    <Button variant="ghost" size="icon" onClick={onToggleSidebar} className={`hidden md:flex shrink-0 mr-1 transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`}>
                        <PanelLeft className="w-5 h-5" />
                    </Button>
                )}
                {selectedChat.type === 'user' ? (
                    <Link href={`/dashboard/profile/${selectedChat.data.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                        <div className="relative">
                            <Avatar className="w-10 h-10 border border-border shadow-sm">
                                <AvatarImage src={selectedChat.data.image} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {(selectedChat.data.name || selectedChat.data.email || "U").substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                        </div>
                        <div>
                            <h2 className="font-bold text-base leading-none hover:underline">
                                {selectedChat.data.name || selectedChat.data.email}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1 text-green-500 font-medium">Online</p>
                        </div>
                    </Link>
                ) : (
                    <div className="flex items-center gap-4 cursor-pointer hover:opacity-80">
                        <Avatar className="w-10 h-10 border border-border shadow-sm">
                            <AvatarImage src={selectedChat.data.imageUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {(selectedChat.data.name || "G").substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-bold text-base leading-none">
                                {selectedChat.data.name}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                                {selectedChat.data.members?.map((m: any) => m.user?.name?.split(' ')[0] || 'User').join(', ')}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {selectedChat.type === 'group' && (
                    <div className="hidden md:flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full mr-2 border border-primary/20">
                        <Target className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold uppercase tracking-wider">{selectedChat.data.missionStatus || 'ACTIVE MISSION'}</span>
                    </div>
                )}
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {selectedChat.type === 'group' ? (
                            <>
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/group/${selectedChat.data.id}`} className="cursor-pointer w-full">
                                        Group Details
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>Shared Resources</DropdownMenuItem>
                                <DropdownMenuItem>Search Messages</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Leave Group</DropdownMenuItem>
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Shared Resources</DropdownMenuItem>
                                <DropdownMenuItem>Search Messages</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Block User</DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
