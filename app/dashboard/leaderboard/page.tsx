import { getOrCreateUser } from "@/app/actions/user";
import { prisma } from "@/lib/prisma";
import { Trophy, Flame, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

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
            name: true,
            image: true,
            actPoints: true,
            tasksCompleted: true,
            failures: true,
            goalsCompleted: true,
            streak: true,
            createdAt: true
        }
    } as any) as any[];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
                <p className="text-sm text-muted-foreground">Global Execution Rankings — Reputation is everything.</p>
            </div>

            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
                <div className="grid grid-cols-3 gap-3 mb-2">
                    {[1, 0, 2].map((idx) => {
                        const u = leaderboard[idx];
                        if (!u) return null;
                        const rank = idx + 1;
                        const isMe = currentUser?.id === u.id;
                        const colors = [
                            'from-amber-500/20 to-amber-600/5 border-amber-500/30',
                            'from-gray-400/20 to-gray-500/5 border-gray-400/30',
                            'from-orange-700/20 to-orange-800/5 border-orange-700/30',
                        ];
                        const trophyColors = ['text-amber-500', 'text-gray-400', 'text-orange-700'];

                        return (
                            <div
                                key={u.id}
                                className={`rounded-xl border bg-gradient-to-b ${colors[idx]} p-4 flex flex-col items-center text-center animate-slide-up ${
                                    idx === 0 ? 'order-2 md:-mt-4' : idx === 1 ? 'order-1' : 'order-3'
                                } ${isMe ? 'ring-2 ring-primary' : ''}`}
                            >
                                <Trophy className={`w-5 h-5 ${trophyColors[idx]} mb-2 fill-current`} />
                                <Avatar className="h-12 w-12 border-2 border-border mb-2">
                                    <AvatarImage src={u.image || ""} />
                                    <AvatarFallback className="text-sm font-bold bg-muted">
                                        {(u.name || u.email).substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <p className="text-sm font-semibold truncate w-full">{u.name || u.email.split('@')[0]}</p>
                                <p className="text-lg font-bold text-primary mt-1">{u.actPoints.toLocaleString()}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Flame className="w-3 h-3 text-amber-500" />
                                    <span className="text-[11px] text-muted-foreground">{u.streak}d streak</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Rankings Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/30 text-muted-foreground text-xs">
                            <tr>
                                <th className="px-4 py-3 font-medium">Rank</th>
                                <th className="px-4 py-3 font-medium">Agent</th>
                                <th className="px-4 py-3 font-medium text-right">ACT Points</th>
                                <th className="px-4 py-3 font-medium text-right hidden md:table-cell">Tasks</th>
                                <th className="px-4 py-3 font-medium text-right hidden md:table-cell">Streak</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {leaderboard.map((user, index) => {
                                const isCurrentUser = currentUser?.id === user.id;
                                const rank = index + 1;

                                return (
                                    <tr
                                        key={user.id}
                                        className={`transition-colors hover:bg-muted/30 ${isCurrentUser ? 'bg-primary/5 hover:bg-primary/10' : ''}`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`font-bold text-sm ${rank <= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    #{rank.toString().padStart(2, '0')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link href={`/dashboard/profile/${user.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                                <Avatar className="h-8 w-8 border border-border">
                                                    <AvatarImage src={user.image || ""} />
                                                    <AvatarFallback className="text-xs bg-muted font-medium">
                                                        {(user.name || user.email).substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <span className={`text-sm font-medium hover:underline ${isCurrentUser ? 'text-primary font-bold' : ''}`}>
                                                        {user.name || user.email.split('@')[0]}
                                                        {isCurrentUser && <span className="ml-1 text-xs text-primary">(You)</span>}
                                                    </span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-primary tabular-nums">
                                            {user.actPoints.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right hidden md:table-cell text-muted-foreground tabular-nums">
                                            {user.tasksCompleted}
                                        </td>
                                        <td className="px-4 py-3 text-right hidden md:table-cell">
                                            <div className="flex items-center justify-end gap-1">
                                                <Flame className="w-3 h-3 text-amber-500" />
                                                <span className="text-sm text-muted-foreground tabular-nums">{user.streak}</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
