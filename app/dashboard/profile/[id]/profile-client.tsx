"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Shield, Target, Trophy, Clock, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { sendFriendRequest } from "@/app/actions/network";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ProfileClientProps {
    profileUser: any;
    connectionStatus: string;
    isSender: boolean;
    isSelf: boolean;
}

export function ProfileClient({ profileUser, connectionStatus: initialStatus, isSender, isSelf }: ProfileClientProps) {
    const [status, setStatus] = useState(initialStatus);
    const [isPending, setIsPending] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleAddFriend = async () => {
        setIsPending(true);
        const res = await sendFriendRequest(profileUser.id);
        setIsPending(false);
        if (res.success) {
            setStatus("PENDING");
            toast({
                title: "Request Sent",
                description: `A friend request was sent to ${profileUser.name || 'this user'}.`
            });
        } else {
            toast({
                className: "bg-destructive text-destructive-foreground border-destructive",
                title: "Error",
                description: "Failed to send request."
            });
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pt-4 animate-slide-up">
            <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            <div className="bg-card border border-border rounded-2xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent" />
                
                <Avatar className="w-24 h-24 mx-auto border-4 border-background relative z-10 mb-4 shadow-xl">
                    <AvatarImage src={profileUser.image} />
                    <AvatarFallback className="text-3xl bg-primary/20 text-primary font-bold">
                        {(profileUser.name || profileUser.email).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <h1 className="text-3xl font-bold tracking-tight mb-1">{profileUser.name || profileUser.email.split('@')[0]}</h1>
                <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium mb-8">
                    Level {profileUser.level} Operator
                </p>

                {!isSelf && (
                    <div className="flex justify-center mb-8 relative z-10">
                        {status === "NONE" && (
                            <Button onClick={handleAddFriend} disabled={isPending} className="w-40 font-bold uppercase tracking-wider">
                                <UserPlus className="w-4 h-4 mr-2" /> Add Friend
                            </Button>
                        )}
                        {status === "PENDING" && (
                            <Button disabled variant="outline" className="w-40 font-bold uppercase tracking-wider border-primary/30 text-primary">
                                <Clock className="w-4 h-4 mr-2" /> Pending
                            </Button>
                        )}
                        {status === "ACCEPTED" && (
                            <Button disabled variant="outline" className="w-40 font-bold uppercase tracking-wider border-emerald-500/30 text-emerald-500">
                                <UserCheck className="w-4 h-4 mr-2" /> Connected
                            </Button>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-left border-t border-border/50 pt-8 mt-4 relative z-10">
                    <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
                            <Trophy className="w-3 h-3 text-primary" /> ACT Points
                        </p>
                        <p className="text-2xl font-mono font-bold">{profileUser.actPoints.toLocaleString()}</p>
                    </div>
                    <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
                            <Target className="w-3 h-3 text-primary" /> Tasks Completed
                        </p>
                        <p className="text-2xl font-mono font-bold">{profileUser.tasksCompleted}</p>
                    </div>
                    <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
                            <Shield className="w-3 h-3 text-primary" /> Goals Conquered
                        </p>
                        <p className="text-2xl font-mono font-bold">{profileUser.goalsCompleted}</p>
                    </div>
                    <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
                            <Target className="w-3 h-3 text-primary" /> Current Streak
                        </p>
                        <p className="text-2xl font-mono font-bold">{profileUser.streak} Days</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
