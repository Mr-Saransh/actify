"use client";

import { Users, Link as LinkIcon, File, LayoutTemplate, ExternalLink, CalendarDays, ShieldAlert, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GroupDetailsClientProps {
    group: any;
}

export function GroupDetailsClient({ group }: GroupDetailsClientProps) {
    const router = useRouter();

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Group Profile</h1>
                    <p className="text-sm text-muted-foreground">Manage execution details and members.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <Card className="bg-card/50 shadow-sm border-border">
                        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                            <Avatar className="w-24 h-24 border-2 border-border shadow-md">
                                <AvatarImage src={group.imageUrl} />
                                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                                    {(group.name || "G").substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-bold text-xl">{group.name}</h2>
                                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                    <CalendarDays className="w-3.5 h-3.5" /> 
                                    Created {format(new Date(group.createdAt || Date.now()), 'MMM d, yyyy')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mission Status Box */}
                    <Card className="bg-primary/5 border-primary/20 shadow-sm">
                        <CardContent className="p-5 flex items-start gap-4">
                            <ShieldAlert className="w-6 h-6 text-primary shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm text-primary uppercase tracking-wider mb-1">{group.missionStatus || 'ACTIVE MISSION'}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">Execution protocols are currently active. All members must report daily progress towards the group objective.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-6">
                    {/* Members List */}
                    <Card className="bg-card/50 shadow-sm border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Group Members ({group.members?.length || 0})
                                </h4>
                            </div>
                            <div className="space-y-1">
                                {group.members?.map((member: any) => (
                                    <div key={member.id} className="flex items-center gap-4 p-3 hover:bg-secondary/30 rounded-xl transition-colors">
                                        <Avatar className="w-10 h-10 border border-border">
                                            <AvatarImage src={member.user?.image} />
                                            <AvatarFallback className="text-sm font-bold bg-secondary">{(member.user?.name || member.user?.email || "U").substring(0,2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <Link href={`/dashboard/profile/${member.user.id}`} className="font-semibold text-sm truncate hover:underline">
                                                {member.user?.name || member.user?.email}
                                            </Link>
                                            <p className="text-xs text-muted-foreground flex gap-2 uppercase font-medium">
                                                <span className={member.role === 'ADMIN' ? 'text-primary' : ''}>{member.role}</span>
                                                <span className="opacity-50">•</span>
                                                <span>Level {member.user.level}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shared Resources */}
                    <Card className="bg-card/50 shadow-sm border-border">
                        <CardContent className="p-6">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Execution Resources</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-background border border-border rounded-xl flex items-center gap-4 hover:bg-secondary/50 cursor-pointer transition-all hover:-translate-y-0.5 group">
                                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                                        <LayoutTemplate className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">System Architecture</p>
                                        <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mt-0.5">Shared by Admin</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-background border border-border rounded-xl flex items-center gap-4 hover:bg-secondary/50 cursor-pointer transition-all hover:-translate-y-0.5 group">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                                        <LinkIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">GitHub Repository</p>
                                        <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mt-0.5">actify/core</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                <div className="p-4 bg-background border border-border rounded-xl flex items-center gap-4 hover:bg-secondary/50 cursor-pointer transition-all hover:-translate-y-0.5 group">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 shadow-sm">
                                        <File className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">Q3 Roadmap.pdf</p>
                                        <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mt-0.5">1.2 MB</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
