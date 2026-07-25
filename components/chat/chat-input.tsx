"use client";

import { Send, Paperclip, Smile, Code, Image as ImageIcon, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface ChatInputProps {
    onSendMessage: (text: string, type?: string, metadata?: any) => void;
    isSending: boolean;
}

export function ChatInput({ onSendMessage, isSending }: ChatInputProps) {
    const [newMessage, setNewMessage] = useState("");

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;
        
        // Basic markdown/code block detection
        let type = "TEXT";
        if (newMessage.startsWith("```") && newMessage.endsWith("```")) {
            type = "CODE";
        }
        
        onSendMessage(newMessage, type);
        setNewMessage("");
    };

    return (
        <div className="p-4 bg-card border-t border-border shrink-0">
            <div className="max-w-4xl mx-auto space-y-2">
                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1 px-2 text-muted-foreground">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-primary">
                                <Paperclip className="w-4 h-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2" side="top" align="start">
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <Button variant="ghost" className="flex flex-col h-16 gap-1" onClick={() => onSendMessage("Attached an image.", "IMAGE", { url: "https://placehold.co/600x400" })}>
                                    <ImageIcon className="w-5 h-5 text-blue-500" />
                                    <span className="text-[10px]">Image</span>
                                </Button>
                                <Button variant="ghost" className="flex flex-col h-16 gap-1" onClick={() => onSendMessage("Shared a document.", "FILE", { filename: "Execution_Plan.pdf" })}>
                                    <FileText className="w-5 h-5 text-purple-500" />
                                    <span className="text-[10px]">File</span>
                                </Button>
                                <Button variant="ghost" className="flex flex-col h-16 gap-1" onClick={() => onSendMessage("```javascript\n// Shared Code snippet\nconst execute = () => {\n  console.log('Running...');\n}\n```", "CODE")}>
                                    <Code className="w-5 h-5 text-amber-500" />
                                    <span className="text-[10px]">Code</span>
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:text-primary">
                        <Smile className="w-4 h-4" />
                    </Button>
                    <div className="h-4 w-[1px] bg-border mx-1"></div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-mono hover:text-primary" onClick={() => setNewMessage(prev => prev + "```\n\n```")}>
                        <Code className="w-3.5 h-3.5 mr-1" /> block
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-mono hover:text-primary" onClick={() => setNewMessage(prev => prev + "**bold**")}>
                        B
                    </Button>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSend} className="flex gap-2 items-end">
                    <Input 
                        placeholder="Type a message or share an execution resource..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="bg-secondary/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-12 rounded-2xl px-5"
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon" className="h-12 w-12 rounded-2xl shrink-0 shadow-md transition-transform active:scale-95" disabled={!newMessage.trim() || isSending}>
                        <Send className="w-5 h-5 ml-1" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
