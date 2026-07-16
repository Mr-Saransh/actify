"use client";

import { MessageSquare, Users, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CommunityClient() {
    const [message, setMessage] = useState("");

    const posts = [
        { id: 1, user: "Priya Verma", initials: "PV", message: "Just completed my 90-day Full-Stack journey! 🎉 The grind was worth every minute.", time: "2m ago", likes: 24, liked: false },
        { id: 2, user: "Rahul Singh", initials: "RS", message: "Day 21 streak! DSA is getting harder but I'm loving the challenge 💪 Who else is on the grind?", time: "15m ago", likes: 18, liked: false },
        { id: 3, user: "Kavya Nair", initials: "KN", message: "Anyone else working on the System Design goal? Let's form a study group and hold each other accountable!", time: "1h ago", likes: 31, liked: true },
        { id: 4, user: "Meera Joshi", initials: "MJ", message: "Submitted proof for my biggest task yet — 500 lines of clean backend code. Acceptance rate holding at 94% 🚀", time: "2h ago", likes: 45, liked: false },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Community
                </h1>
                <p className="text-sm text-muted-foreground">Connect with other executors. (Coming Soon)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Feed */}
                <div className="md:col-span-2 space-y-4">
                    {/* Input Area */}
                    <div className="rounded-xl border border-border bg-card p-4 animate-slide-up">
                        <div className="flex gap-3">
                            <Avatar className="w-10 h-10 border border-border">
                                <AvatarFallback className="bg-primary/10 text-primary">ME</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-3">
                                <Input 
                                    placeholder="Share your progress or ask for accountability..." 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="bg-secondary/50 border-transparent focus-visible:ring-primary"
                                />
                                <div className="flex justify-end">
                                    <Button size="sm" onClick={() => setMessage("")} disabled={!message}>Post Update</Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Posts */}
                    <div className="space-y-4">
                        {posts.map((post, i) => (
                            <div key={post.id} className="rounded-xl border border-border bg-card p-4 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10 border border-border">
                                            <AvatarFallback className="bg-secondary text-secondary-foreground">{post.initials}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-sm">{post.user}</p>
                                            <p className="text-xs text-muted-foreground">{post.time}</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed mb-4">{post.message}</p>
                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <button className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${post.liked ? 'text-pink-500' : 'hover:text-foreground'}`}>
                                        <MessageCircle className="w-4 h-4" /> {post.likes}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4 animate-slide-up stagger-2">
                    <div className="rounded-xl border border-border bg-card p-4">
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <Users className="w-4 h-4 text-primary" /> Active Goal Groups
                        </h3>
                        <div className="space-y-3">
                            {["Full-Stack Bootcamp (142 members)", "DSA Grind (89 members)", "System Design Prep (56 members)"].map((group) => (
                                <div key={group} className="p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 cursor-pointer transition-colors">
                                    <p className="text-sm font-medium">{group.split('(')[0]}</p>
                                    <p className="text-[11px] text-muted-foreground">({group.split('(')[1]}</p>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4" size="sm">Browse All Groups</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
