
import { Goal, Task, User, Proof } from "@prisma/client";

export interface EnforcementMetrics {
    executionSpeed: number; // tasks per day
    requiredSpeed: number; // tasks per day needed to finish by deadline
    probability: number; // percentage
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    dailyLimit: number;
    failuresCount: number;
    missedYesterday: boolean;
    daysBehind: number;
    lastFailureReason?: string;
    // New 7-Day & Risk Metrics
    onTimeRate7Days: number;
    daysExecuted7Days: number;
    bufferDays: number;
    failureMargin: 'SAFE' | 'CAUTION' | 'DANGER';
    scoreChangeToday: number;
    activeScore: number;
}

export function calculateEnforcementMetrics(
    user: User,
    goal: Goal & { tasks: (Task & { proof: Proof | null })[] }
): EnforcementMetrics {
    const totalTasks = goal.tasks.length;
    const completedTasks = goal.tasks.filter(t => t.state === 'ACCEPTED').length;
    const failedTasks = goal.tasks.filter(t => t.state === 'FAILED' || t.state === 'REJECTED').length;

    // Calculate Speed
    const now = new Date();
    const startDate = new Date(goal.createdAt);
    const dayDiff = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    const executionSpeed = parseFloat((completedTasks / dayDiff).toFixed(2));

    // Required Speed
    const deadline = new Date(goal.deadline);
    const daysRemaining = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const tasksRemaining = totalTasks - completedTasks;
    const requiredSpeed = parseFloat((tasksRemaining / daysRemaining).toFixed(2));

    // Failures & Impact
    // Simple heuristic: Each failure drops probability by 12%
    // Base probability starts at 95% (nobody is 100%)
    let probability = 95 - (failedTasks * 12);

    // Delay penalty: If behind schedule, drop probability
    const daysBehind = Math.max(0, Math.ceil((tasksRemaining / executionSpeed) - daysRemaining));
    if (!isFinite(daysBehind)) {
        // If speed is 0, we can't calc days behind properly, assume 1 day if > 1 day passed
        if (dayDiff > 1 && completedTasks === 0) probability -= 10;
    } else {
        probability -= (daysBehind * 5);
    }

    // 7-Day Rolling Metrics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const tasksLast7Days = goal.tasks.filter(t => new Date(t.updatedAt) >= sevenDaysAgo && new Date(t.updatedAt) <= now);
    const acceptedLast7Days = tasksLast7Days.filter(t => t.state === 'ACCEPTED').length;

    // Days executed (unique days with an accepted task)
    const uniqueDaysExecuted = new Set(
        tasksLast7Days
            .filter(t => t.state === 'ACCEPTED')
            .map(t => new Date(t.updatedAt).toDateString())
    ).size;

    const daysExecuted7Days = uniqueDaysExecuted;
    // On-time rate logic: if we have deadlines, check if accepted <= deadline. 
    // For now, simpler: Accepted / Total Active+Accepted+Failed in last 7 days.
    const totalAttempted7Days = tasksLast7Days.filter(t => ['ACCEPTED', 'FAILED', 'REJECTED'].includes(t.state)).length;
    const onTimeRate7Days = totalAttempted7Days > 0 ? (acceptedLast7Days / totalAttempted7Days) * 100 : 100;

    // Buffer Days & Failure Margin
    // Buffer = (Available Days to Deadline) - (Days needed at Current Speed)
    // If executionSpeed is high, buffer is positive.
    const daysNeeded = executionSpeed > 0 ? tasksRemaining / executionSpeed : 999;
    const bufferDays = Math.round(daysRemaining - daysNeeded);

    let failureMargin: EnforcementMetrics['failureMargin'] = 'SAFE';
    if (bufferDays < 0) failureMargin = 'DANGER';
    else if (bufferDays < 3) failureMargin = 'CAUTION';

    probability = Math.max(0, Math.min(100, probability));

    // Risk Level
    let riskLevel: EnforcementMetrics['riskLevel'] = 'LOW';
    if (probability < 40) riskLevel = 'CRITICAL';
    else if (probability < 70) riskLevel = 'HIGH';
    else if (probability < 85) riskLevel = 'MEDIUM';

    // Daily Limit based on Risk
    let dailyLimit = 2;
    switch (riskLevel) {
        case 'CRITICAL': dailyLimit = 1; break;
        case 'HIGH': dailyLimit = 2; break;
        case 'MEDIUM': dailyLimit = 3; break;
        case 'LOW': dailyLimit = 4; break;
    }

    // Check "Missed Yesterday"
    // Logic: Did we have an active task yesterday that wasn't completed? 
    // Or simpler: Did we complete 0 tasks yesterday?
    // We'll approximate: If last update of any accepted task wasn't yesterday or today, we might have missed.
    // Better: Check checkDailyDeadlines logic which creates FAILED proofs. if we have a FAILED proof from yesterday.
    // For now, heuristic:
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const hasFailureYesterday = goal.tasks.some(t =>
        (t.state === 'FAILED' || t.state === 'REJECTED') &&
        new Date(t.updatedAt) >= yesterday &&
        new Date(t.updatedAt) < new Date(new Date().setHours(0, 0, 0, 0))
    );

    // Get Last Failure Reason
    let lastFailureReason: string | undefined;
    const lastFailed = goal.tasks
        .filter(t => t.state === 'FAILED' || t.state === 'REJECTED')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

    if (lastFailed) {
        if (lastFailed.proof && lastFailed.proof.reviewStatus === 'REJECTED') {
            lastFailureReason = lastFailed.proof.aiFeedback || "Rejected by Protocol.";
        } else if (lastFailed.state === 'FAILED') {
            lastFailureReason = "Deadline Missed automatically.";
        } else {
            lastFailureReason = "Protocol Violation.";
        }
    }

    // Calculate Score Change (Today)
    const scoreChangeToday = goal.tasks
        .filter(t => {
            const updated = new Date(t.updatedAt);
            updated.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return updated.getTime() === today.getTime();
        })
        .reduce((acc, t) => {
            if (t.state === 'ACCEPTED') return acc + 5;
            if (t.state === 'FAILED') return acc - 3;
            if (t.state === 'REJECTED') return acc - 2;
            return acc;
        }, 0);

    // Calculate Active Score (Total for current goal)
    const activeScore = goal.tasks.reduce((acc, t) => {
        if (t.state === 'ACCEPTED') return acc + 5;
        if (t.state === 'FAILED') return acc - 3;
        if (t.state === 'REJECTED') return acc - 2;
        return acc;
    }, 0);

    return {
        executionSpeed,
        requiredSpeed,
        probability,
        riskLevel,
        dailyLimit,
        failuresCount: failedTasks,
        missedYesterday: hasFailureYesterday,
        daysBehind: isFinite(daysBehind) ? daysBehind : 0,
        lastFailureReason,
        onTimeRate7Days: Math.round(onTimeRate7Days),
        daysExecuted7Days,
        bufferDays: isFinite(bufferDays) ? bufferDays : -99,
        failureMargin,
        scoreChangeToday,
        activeScore
    };
}
