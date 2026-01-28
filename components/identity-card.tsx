
import { User } from "@prisma/client";
import { UserIcon, Fingerprint, Activity } from "lucide-react";

interface IdentityCardProps {
    user: User;
}

export function IdentityCard({ user }: IdentityCardProps) {
    // Level Names Mapping
    const levels = ["INITIATE", "ACTIVE", "CONSISTENT", "EXECUTOR", "OPERATOR"];
    const levelName = levels[user.level - 1] || "UNKNOWN";


    return (
        <div className="border-t border-sidebar-border pt-4 mt-auto">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">Operator Context</span>
                <span className="text-[10px] text-sidebar-foreground/60 font-mono">ID: {user.clerkId.slice(-4)}</span>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-sidebar-foreground/80 uppercase truncate max-w-[120px]" title={user.email.split('@')[0]}>
                        {user.email.split('@')[0]}
                    </span>
                    <span className="text-xs font-black text-sidebar-foreground italic">CV: {levelName}</span>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-sidebar-foreground/50">
                    <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" /> {user.streak} Days Streak
                    </span>
                    <span className="flex items-center gap-1">
                        LVL {user.level}
                    </span>
                </div>
            </div>
        </div>
    );
}
