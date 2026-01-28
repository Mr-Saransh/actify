import { getOrCreateUser } from "@/app/actions/user";
import { prisma } from "@/lib/prisma";
import { Trophy, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const runtime = "nodejs";

export default async function LeaderboardPage() {
    const currentUser = await getOrCreateUser();

    // Fetch top 50 users sorted by ACT Points
    const leaderboard = await prisma.user.findMany({
        orderBy: { actPoints: 'desc' },
        take: 50,
        select: {
            id: true,
            email: true,
            actPoints: true,
            tasksCompleted: true,
            failures: true,
            goalsCompleted: true,
            createdAt: true
        }
    } as any) as any[];

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
                <p className="text-muted-foreground">Global Enforcement Rankings. Reputation is currency.</p>
            </div>

            <div className="rounded-lg border border-border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider font-mono text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium">Rank</th>
                                <th className="px-6 py-4 font-medium">Agent</th>
                                <th className="px-6 py-4 font-medium text-right">Reputation</th>
                                <th className="px-6 py-4 font-medium text-right hidden md:table-cell">Tasks</th>
                                <th className="px-6 py-4 font-medium text-right hidden md:table-cell">Failures</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {leaderboard.map((user, index) => {
                                const isCurrentUser = currentUser?.id === user.id;
                                const rank = index + 1;

                                return (
                                    <tr
                                        key={user.id}
                                        className={`group transition-colors hover:bg-muted/50 ${isCurrentUser ? 'bg-primary/5 hover:bg-primary/10' : ''}`}
                                    >
                                        <td className="px-6 py-4 font-mono">
                                            <div className="flex items-center gap-2">
                                                {rank === 1 && <Trophy className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                                                {rank === 2 && <Trophy className="h-4 w-4 text-gray-400 fill-gray-400" />}
                                                {rank === 3 && <Trophy className="h-4 w-4 text-amber-700 fill-amber-700" />}
                                                <span className={`font-bold ${rank <= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    #{rank.toString().padStart(2, '0')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border border-border">
                                                    <AvatarImage src={user.image || ""} />
                                                    <AvatarFallback className="text-xs bg-muted">
                                                        {user.email.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className={`font-medium ${isCurrentUser ? 'text-primary font-bold' : ''}`}>
                                                        {user.email.split('@')[0]}
                                                        {isCurrentUser && " (YOU)"}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-base font-bold text-yellow-500">
                                            {user.actPoints}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono hidden md:table-cell text-muted-foreground">
                                            {user.tasksCompleted}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono hidden md:table-cell text-destructive">
                                            {user.failures}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
