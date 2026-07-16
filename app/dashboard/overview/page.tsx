export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getOrCreateUser } from "@/app/actions/user";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardOverviewPage() {
    const user = await getOrCreateUser();

    if (!user) {
        return <div className="flex items-center justify-center h-full text-muted-foreground">Authenticating...</div>;
    }

    // Fetch active goal
    const activeGoal = await prisma.goal.findFirst({
        where: { userId: user.id, status: "ACTIVE" },
        include: {
            tasks: {
                orderBy: { dayIndex: 'asc' },
                include: { proof: true }
            }
        },
    });

    // Fetch all user goals for stats
    const allGoals = await prisma.goal.findMany({
        where: { userId: user.id },
        include: {
            tasks: {
                orderBy: { updatedAt: 'desc' },
                include: { proof: true }
            }
        },
    });

    // Calculate stats
    const totalTasks = allGoals.reduce((sum, g) => sum + g.tasks.length, 0);
    const completedTasks = allGoals.reduce((sum, g) => sum + g.tasks.filter(t => t.state === 'ACCEPTED').length, 0);
    const failedTasks = allGoals.reduce((sum, g) => sum + g.tasks.filter(t => t.state === 'FAILED').length, 0);

    // Today's tasks
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayTasks = activeGoal?.tasks.filter(t =>
        t.state === 'ACCEPTED' && new Date(t.updatedAt) >= startOfDay
    ).length || 0;

    const activeTasks = activeGoal?.tasks.filter(t =>
        t.state === 'ACTIVE' || t.state === 'REJECTED'
    ).length || 0;

    // Goal progress
    const goalProgress = activeGoal
        ? Math.round((activeGoal.tasks.filter(t => t.state === 'ACCEPTED').length / Math.max(1, activeGoal.tasks.length)) * 100)
        : 0;

    // Weekly data (last 7 days)
    const weeklyData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayTasks = allGoals.reduce((sum, g) =>
            sum + g.tasks.filter(t =>
                t.state === 'ACCEPTED' &&
                new Date(t.updatedAt) >= date &&
                new Date(t.updatedAt) < nextDay
            ).length, 0);

        weeklyData.push({
            day: dayNames[date.getDay()],
            tasks: dayTasks,
            points: dayTasks * 5,
        });
    }

    // Heatmap data (last 16 weeks)
    const heatmapData: number[][] = [];
    for (let w = 0; w < 16; w++) {
        const week: number[] = [];
        for (let d = 0; d < 7; d++) {
            const date = new Date();
            date.setDate(date.getDate() - ((15 - w) * 7 + (6 - d)));
            date.setHours(0, 0, 0, 0);
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const dayCount = allGoals.reduce((sum, g) =>
                sum + g.tasks.filter(t =>
                    t.state === 'ACCEPTED' &&
                    new Date(t.updatedAt) >= date &&
                    new Date(t.updatedAt) < nextDay
                ).length, 0);

            week.push(Math.min(4, dayCount));
        }
        heatmapData.push(week);
    }

    // Recent activity
    const recentActivity = allGoals
        .flatMap(g => g.tasks.filter(t => ['ACCEPTED', 'REJECTED', 'FAILED'].includes(t.state)))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
        .map(t => ({
            id: t.id,
            task: t.title,
            status: t.state.toLowerCase() as 'accepted' | 'rejected' | 'failed',
            date: new Date(t.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            points: t.state === 'ACCEPTED' ? 5 : 0,
        }));

    // Leaderboard rank
    const rank = await prisma.user.count({
        where: { actPoints: { gt: user.actPoints } }
    }) + 1;

    return (
        <DashboardClient
            user={{
                name: user.name || user.email.split('@')[0],
                actPoints: user.actPoints,
                actCurrency: user.actCurrency,
                streak: user.streak,
                tasksCompleted: user.tasksCompleted,
                goalsCompleted: user.goalsCompleted,
            }}
            activeGoal={activeGoal ? {
                title: activeGoal.title,
                progress: goalProgress,
                deadline: activeGoal.deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                daysLeft: Math.max(0, Math.ceil((activeGoal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
            } : null}
            stats={{
                todayTasks,
                activeTasks,
                totalTasks,
                completedTasks,
                failedTasks,
                rank,
            }}
            weeklyData={weeklyData}
            heatmapData={heatmapData}
            recentActivity={recentActivity}
        />
    );
}
