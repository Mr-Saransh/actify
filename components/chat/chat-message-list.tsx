"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Check, CheckCheck, MoreHorizontal, Reply, SmilePlus, Copy, Trash2, Edit2, Pin, FolderArchive } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatMessageListProps {
    messages: any[];
    currentUserId: string;
    isGroup: boolean;
    scrollRef: React.RefObject<HTMLDivElement | null>;
    onDelete?: (messageId: string) => void;
    onPin?: (messageId: string, isPinned: boolean) => void;
}

export function ChatMessageList({ messages, currentUserId, isGroup, scrollRef, onDelete, onPin }: ChatMessageListProps) {
    if (messages.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm opacity-50">
                <MessageSquare className="w-12 h-12 mb-4" />
                <p>No messages yet. Initiate execution protocol.</p>
            </div>
        );
    }

    const renderMessageContent = (msg: any) => {
        if (msg.type === "CODE") {
            return (
                <div className="bg-zinc-950 text-zinc-300 p-3 rounded-xl text-xs font-mono overflow-x-auto my-1 border border-zinc-800">
                    <pre>{msg.content.replace(/```(javascript)?/g, '').trim()}</pre>
                </div>
            );
        }
        
        if (msg.type === "IMAGE") {
            return (
                <div className="mt-1 mb-2">
                    <img src={msg.metadata?.url || "https://placehold.co/600x400"} alt="Shared image" className="rounded-xl max-w-full h-auto border border-border/50 max-h-[300px] object-cover" />
                    {msg.content && <p className="mt-2 text-[15px]">{msg.content}</p>}
                </div>
            );
        }

        if (msg.type === "FILE") {
            return (
                <div className="bg-background/80 border border-border p-3 rounded-xl flex items-center gap-3 my-1 cursor-pointer hover:bg-background transition-colors">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                        <FolderArchive className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{msg.metadata?.filename || "Document.pdf"}</p>
                        <p className="text-xs text-muted-foreground">{msg.content}</p>
                    </div>
                </div>
            );
        }

        if (msg.type === "RESOURCE") {
            return (
                <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl my-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-primary text-primary-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm tracking-wider">
                            Execution Resource
                        </span>
                    </div>
                    <p className="font-semibold text-sm">{msg.metadata?.title || "Resource"}</p>
                    <a href={msg.metadata?.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 block">
                        Access Resource →
                    </a>
                </div>
            );
        }

        return <div className="text-[15px] whitespace-pre-wrap">{msg.content}</div>;
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar relative" ref={scrollRef}>
            {messages.map((msg, i) => {
                const isMe = msg.senderId === currentUserId;
                const prevMsg = messages[i - 1];
                const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);
                const isDeleted = msg.deletedAt != null;

                // Simple date divider logic
                const showDate = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

                return (
                    <div key={msg.id || i}>
                        {showDate && (
                            <div className="flex justify-center my-6">
                                <span className="bg-secondary/50 text-muted-foreground text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                                    {format(new Date(msg.createdAt), 'MMM d, yyyy')}
                                </span>
                            </div>
                        )}

                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-6' : 'mt-1'} group/message`}>
                            {!isMe && (
                                <div className="w-8 shrink-0 mr-2 flex items-end">
                                    {showAvatar && (
                                        <Avatar className="w-8 h-8 border border-border shadow-sm">
                                            <AvatarImage src={msg.sender?.image} />
                                            <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground font-bold">{(msg.sender?.name || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            )}
                            
                            {/* Message Bubble Container */}
                            <div className={`max-w-[85%] md:max-w-[65%] flex flex-col relative ${isMe ? 'items-end' : 'items-start'}`}>
                                {isGroup && !isMe && showAvatar && (
                                    <span className="text-[11px] text-muted-foreground ml-1 mb-1 font-semibold">{msg.sender?.name || 'User'}</span>
                                )}
                                
                                <div className="flex items-center gap-2">
                                    {/* Action Menu (Left if Me, Right if Them) */}
                                    {isMe && !isDeleted && (
                                        <div className="opacity-0 group-hover/message:opacity-100 transition-opacity flex items-center gap-1">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-secondary">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem><Reply className="w-4 h-4 mr-2" /> Reply</DropdownMenuItem>
                                                    <DropdownMenuItem><Copy className="w-4 h-4 mr-2" /> Copy text</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onPin?.(msg.id, !msg.isPinned)}>
                                                        <Pin className="w-4 h-4 mr-2" /> {msg.isPinned ? "Unpin" : "Pin Message"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem><Edit2 className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(msg.id)}>
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-secondary">
                                                <SmilePlus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}

                                    <div className={`relative px-4 py-2.5 shadow-sm 
                                        ${isDeleted ? 'bg-secondary/30 text-muted-foreground italic border border-border/50 rounded-2xl' : 
                                            isMe ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm' : 'bg-card text-card-foreground border border-border rounded-2xl rounded-bl-sm'}
                                        ${msg.isPinned ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-background' : ''}
                                    `}>
                                        {msg.isPinned && (
                                            <div className="absolute -top-3 -right-2 bg-amber-500 text-white rounded-full p-1 shadow-md">
                                                <Pin className="w-3 h-3 fill-current" />
                                            </div>
                                        )}

                                        {isDeleted ? (
                                            <span className="text-[14px]">🚫 This message was deleted</span>
                                        ) : (
                                            renderMessageContent(msg)
                                        )}
                                        
                                        <div className={`flex items-center justify-end gap-1 mt-1 -mb-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            <span className="text-[10px] font-medium">{format(new Date(msg.createdAt), 'HH:mm')}</span>
                                            {isMe && !isDeleted && (
                                                msg.readBy?.length > 0 ? <CheckCheck className="w-3 h-3 text-blue-300" /> : <Check className="w-3 h-3" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Menu for received messages */}
                                    {!isMe && !isDeleted && (
                                        <div className="opacity-0 group-hover/message:opacity-100 transition-opacity flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-secondary">
                                                <SmilePlus className="w-4 h-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-secondary">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start">
                                                    <DropdownMenuItem><Reply className="w-4 h-4 mr-2" /> Reply</DropdownMenuItem>
                                                    <DropdownMenuItem><Copy className="w-4 h-4 mr-2" /> Copy text</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onPin?.(msg.id, !msg.isPinned)}>
                                                        <Pin className="w-4 h-4 mr-2" /> {msg.isPinned ? "Unpin" : "Pin Message"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
