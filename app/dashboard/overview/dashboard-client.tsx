"use client";

import { Star, Coins, Trophy, Flame, Target, CheckSquare, Upload, Plus, Zap, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Link from "next/link";

interface DashboardClientProps {
    user: {
        name: string;
        actPoints: number;
        actCurrency: number;
        streak: number;
        tasksCompleted: number;
        goalsCompleted: number;
    };
    activeGoal: {
        title: string;
        progress: number;
        deadline: string;
        daysLeft: number;
    } | null;
    stats: {
        todayTasks: number;
        activeTasks: number;
        totalTasks: number;
        completedTasks: number;
        failedTasks: number;
        rank: number;
    };
    weeklyData: { day: string; tasks: number; points: number }[];
    heatmapData: number[][];
    recentActivity: { id: string; task: string; status: 'accepted' | 'rejected' | 'failed'; date: string; points: number }[];
}

function StatCard({ label, value, icon, color, delta }: {
    label: string; value: string; icon: React.ReactNode; color: string; delta: string;
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 card-hover animate-slide-up">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: color }}>
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{delta}</p>
        </div>
    );
}

export function DashboardClient({ user, activeGoal, stats, weeklyData, heatmapData, recentActivity }: DashboardClientProps) {
    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    })();

    return (
        <div className="space-y-5 max-w-6xl mx-auto pb-6">
            {/* Hero */}
            <div className="rounded-2xl p-5 md:p-6 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent, var(--primary)))" }}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 50%)" }} />
                <div className="relative z-10">
                    <p className="text-sm font-medium opacity-75 mb-1">{greeting} ☀️</p>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{user.name}</h1>
                    {activeGoal && (
                        <p className="text-sm opacity-80 mb-4">Current Goal: <span className="font-semibold">{activeGoal.title}</span></p>
                    )}
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2">
                            <Flame className="w-4 h-4" /><span className="text-sm font-semibold">{user.streak} Day Streak</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2">
                            <CheckSquare className="w-4 h-4" /><span className="text-sm font-semibold">{stats.todayTasks} Done Today</span>
                        </div>
                        {activeGoal && (
                            <div className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2">
                                <Target className="w-4 h-4" /><span className="text-sm font-semibold">{activeGoal.progress}% Goal Progress</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                    label="ACT Points"
                    value={user.actPoints.toLocaleString()}
                    icon={<Star className="w-4 h-4" />}
                    color="var(--primary)"
                    delta="Reputation score"
                />
                <StatCard
                    label="ACT Currency"
                    value={user.actCurrency.toLocaleString()}
                    icon={<Coins className="w-4 h-4" />}
                    color="#10b981"
                    delta="Spendable balance"
                />
                <StatCard
                    label="Today's Tasks"
                    value={`${stats.todayTasks}`}
                    icon={<CheckSquare className="w-4 h-4" />}
                    color="#f59e0b"
                    delta={stats.activeTasks > 0 ? `${stats.activeTasks} active` : "No active tasks"}
                />
                <StatCard
                    label="Leaderboard"
                    value={`#${stats.rank}`}
                    icon={<Trophy className="w-4 h-4" />}
                    color="#ec4899"
                    delta="Global rank"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Weekly Execution Chart */}
                <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 animate-slide-up stagger-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-sm">Weekly Execution</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary">This Week</span>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={weeklyData}>
                            <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{
                                    background: "var(--card)",
                                    border: "1px solid var(--border)",
                                    borderRadius: 8,
                                    color: "var(--foreground)",
                                    fontSize: 12,
                                }}
                            />
                            <Area type="monotone" dataKey="tasks" stroke="var(--primary)" strokeWidth={2} fill="url(#areaGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Goal Progress Circle */}
                <div className="rounded-xl border border-border bg-card p-5 animate-slide-up stagger-3">
                    <h3 className="font-semibold text-sm mb-4">Goal Progress</h3>
                    {activeGoal ? (
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <PieChart width={120} height={120}>
                                    <Pie
                                        data={[{ v: activeGoal.progress }, { v: 100 - activeGoal.progress }]}
                                        cx={55} cy={55} innerRadius={38} outerRadius={52}
                                        startAngle={90} endAngle={-270} dataKey="v"
                                    >
                                        <Cell fill="var(--primary)" />
                                        <Cell fill="var(--muted)" />
                                    </Pie>
                                </PieChart>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xl font-bold">{activeGoal.progress}%</span>
                                </div>
                            </div>
                            <p className="text-xs font-medium text-center mt-2 text-muted-foreground line-clamp-2">{activeGoal.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{activeGoal.daysLeft} days left</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                            <Target className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-xs">No active goal</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Heatmap + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Execution Heatmap */}
                <div className="rounded-xl border border-border bg-card p-5 animate-slide-up stagger-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-sm">Execution Calendar</h3>
                        <span className="text-xs text-muted-foreground">Last 16 weeks</span>
                    </div>
                    <div className="flex gap-[3px] overflow-x-auto pb-1">
                        {heatmapData.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-[3px]">
                                {week.map((level, di) => (
                                    <div
                                        key={di}
                                        className="w-[11px] h-[11px] rounded-[2px] transition-opacity hover:opacity-80"
                                        title={`Level ${level}`}
                                        style={{
                                            background: level === 0 ? "var(--muted)" :
                                                level === 1 ? "color-mix(in srgb, var(--primary) 35%, transparent)" :
                                                level === 2 ? "color-mix(in srgb, var(--primary) 55%, transparent)" :
                                                level === 3 ? "color-mix(in srgb, var(--primary) 75%, transparent)" :
                                                "var(--primary)",
                                        }}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] text-muted-foreground">Less</span>
                        {[0, 1, 2, 3, 4].map((l) => (
                            <div key={l} className="w-[11px] h-[11px] rounded-[2px]" style={{
                                background: l === 0 ? "var(--muted)" :
                                    l === 1 ? "color-mix(in srgb, var(--primary) 35%, transparent)" :
                                    l === 2 ? "color-mix(in srgb, var(--primary) 55%, transparent)" :
                                    l === 3 ? "color-mix(in srgb, var(--primary) 75%, transparent)" :
                                    "var(--primary)",
                            }} />
                        ))}
                        <span className="text-[10px] text-muted-foreground">More</span>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-xl border border-border bg-card p-5 animate-slide-up stagger-5">
                    <h3 className="font-semibold text-sm mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {recentActivity.length > 0 ? recentActivity.map((h) => (
                            <div key={h.id} className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                    h.status === "accepted" ? "bg-emerald-400" :
                                    h.status === "rejected" ? "bg-red-400" : "bg-amber-400"
                                }`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{h.task}</p>
                                    <p className="text-xs text-muted-foreground">{h.date}</p>
                                </div>
                                {h.points > 0 && (
                                    <span className="text-xs font-semibold text-emerald-400 shrink-0">+{h.points} pts</span>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-6 text-muted-foreground">
                                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-xs">No activity yet. Start your first goal!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-border bg-card p-5 animate-slide-up stagger-6">
                <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-2.5">
                    <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-all text-sm font-medium">
                        <Upload className="w-4 h-4" /> Submit Proof
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-all text-sm font-medium">
                        <Plus className="w-4 h-4" /> New Goal
                    </Link>
                    <Link href="/dashboard/store" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-all text-sm font-medium">
                        <Zap className="w-4 h-4" /> Buy Power-Up
                    </Link>
                    <Link href="/dashboard/leaderboard" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-all text-sm font-medium">
                        <Flame className="w-4 h-4" /> {user.streak}-Day Streak 🔥
                    </Link>
                </div>
            </div>
        </div>
    );
}
