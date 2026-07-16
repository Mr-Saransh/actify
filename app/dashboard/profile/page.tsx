import { getOrCreateUser } from "@/app/actions/user";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Coins, Target, Flame, Shield, Zap, CheckCircle, Trophy, Award } from "lucide-react";

export const runtime = "nodejs";

export default async function ProfilePage() {
    const user = await getOrCreateUser() as any;
    if (!user) return <div className="flex items-center justify-center h-full text-muted-foreground">Unauthorized</div>;

    // Calculate acceptance rate
    const totalAttempted = user.tasksCompleted + user.failures;
    const acceptanceRate = totalAttempted > 0 ? Math.round((user.tasksCompleted / totalAttempted) * 100) : 100;

    // Fetch completed goals
    const completedGoals = await prisma.goal.findMany({
        where: { userId: user.id, status: "COMPLETED" },
        orderBy: { updatedAt: 'desc' },
        take: 5,
    });

    // Mock achievements based on actual stats
    const achievements = [
        { name: "First Steps", desc: "Complete your first task", earned: user.tasksCompleted >= 1, icon: "🎯" },
        { name: "Week Warrior", desc: "7-day execution streak", earned: user.streak >= 7, icon: "🔥" },
        { name: "Century Club", desc: "Earn 100 ACT Points", earned: user.actPoints >= 100, icon: "💯" },
        { name: "Goal Crusher", desc: "Complete a goal", earned: user.goalsCompleted >= 1, icon: "🏆" },
        { name: "Consistency", desc: "30-day streak", earned: user.streak >= 30, icon: "⚡" },
        { name: "Power User", desc: "Use a power-up", earned: user.freezeActCount > 0 || user.beyondActCount > 0, icon: "🛡️" },
    ];

    const stats = [
        { label: "ACT Points", value: user.actPoints.toLocaleString(), icon: <Star className="w-4 h-4" />, color: "var(--primary)" },
        { label: "ACT Currency", value: user.actCurrency.toLocaleString(), icon: <Coins className="w-4 h-4" />, color: "#10b981" },
        { label: "Goals Completed", value: user.goalsCompleted, icon: <Trophy className="w-4 h-4" />, color: "#f59e0b" },
        { label: "Tasks Completed", value: user.tasksCompleted, icon: <CheckCircle className="w-4 h-4" />, color: "#3b82f6" },
        { label: "Acceptance Rate", value: `${acceptanceRate}%`, icon: <Target className="w-4 h-4" />, color: "#8b5cf6" },
        { label: "Current Streak", value: `${user.streak}d`, icon: <Flame className="w-4 h-4" />, color: "#ef4444" },
        { label: "Freeze Available", value: user.freezeActCount, icon: <Shield className="w-4 h-4" />, color: "#06b6d4" },
        { label: "Beyond ACT", value: user.beyondActCount, icon: <Zap className="w-4 h-4" />, color: "#ec4899" },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Identity Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 rounded-xl border border-border bg-card animate-slide-up">
                <div className="relative">
                    <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-primary/30">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                            {(user.name || user.email).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-2 border-card">
                        {user.level}
                    </div>
                </div>
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">{user.name || user.email.split('@')[0]}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                        <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">Level {user.level}</span>
                        <span className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                            ID: {user.clerkId.slice(-8)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up stagger-1">
                {stats.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border bg-card p-4 card-hover">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: stat.color }}>
                                {stat.icon}
                            </div>
                        </div>
                        <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Achievements */}
            <div className="rounded-xl border border-border bg-card p-5 animate-slide-up stagger-2">
                <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold">Achievements</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {achievements.map((a) => (
                        <div key={a.name} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            a.earned
                                ? 'border-primary/20 bg-primary/5'
                                : 'border-border bg-muted/30 opacity-40 grayscale'
                        }`}>
                            <span className="text-2xl">{a.icon}</span>
                            <div>
                                <p className="text-sm font-semibold">{a.name}</p>
                                <p className="text-[11px] text-muted-foreground">{a.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Journeys */}
            {completedGoals.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5 animate-slide-up stagger-3">
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <h2 className="font-semibold">Recent Journeys</h2>
                    </div>
                    <div className="space-y-3">
                        {completedGoals.map((goal) => (
                            <div key={goal.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-emerald-500/5">
                                <div>
                                    <p className="text-sm font-medium">{goal.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Completed {new Date(goal.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
