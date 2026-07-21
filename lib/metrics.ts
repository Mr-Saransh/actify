
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

    const now = new Date();
    const startDate = new Date(goal.createdAt);
    const deadline = new Date(goal.deadline);

    // 1. Precise Day Counters
    const dayDiff = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalDays = Math.max(1, Math.ceil((deadline.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // 2. Pace Calculations
    const executionSpeed = parseFloat((completedTasks / dayDiff).toFixed(2));
    const originalRequiredSpeed = totalTasks / totalDays;
    let requiredSpeed = originalRequiredSpeed;
    if (totalTasks > 0 && requiredSpeed < 0.1) requiredSpeed = 0.1; // UI floor
    requiredSpeed = parseFloat(requiredSpeed.toFixed(2));

    // 3. True Buffer Calculation
    // How many tasks should be done by now?
    const expectedCompletedByNow = originalRequiredSpeed * dayDiff;
    const tasksAhead = completedTasks - expectedCompletedByNow;
    
    // Convert tasks ahead/behind back into days
    let bufferDays = 0;
    if (originalRequiredSpeed > 0) {
        bufferDays = Math.round(tasksAhead / originalRequiredSpeed);
    }
    
    // Ensure if we are out of time we show negatives
    const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    if (daysRemaining === 0 && completedTasks < totalTasks) {
        bufferDays = -99;
    }

    // 4. Missed Yesterday Logic
    // Did they complete anything yesterday?
    const yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const completedYesterday = goal.tasks.some(t => 
        t.state === 'ACCEPTED' && 
        new Date(t.updatedAt) >= yesterdayStart && 
        new Date(t.updatedAt) < todayStart
    );
    const missedYesterday = !completedYesterday && dayDiff > 1;

    // 5. Failures & Impact
    let probability = 95 - (failedTasks * 12);
    if (bufferDays < 0) {
        probability += (bufferDays * 5); // bufferDays is negative, so this drops probability
    }
    probability = Math.max(0, Math.min(100, probability));

    // 6. 7-Day Rolling Metrics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const tasksLast7Days = goal.tasks.filter(t => new Date(t.updatedAt) >= sevenDaysAgo && new Date(t.updatedAt) <= now);
    const acceptedLast7Days = tasksLast7Days.filter(t => t.state === 'ACCEPTED').length;

    const uniqueDaysExecuted = new Set(
        tasksLast7Days
            .filter(t => t.state === 'ACCEPTED')
            .map(t => new Date(t.updatedAt).toDateString())
    ).size;

    const daysExecuted7Days = uniqueDaysExecuted;
    const totalAttempted7Days = tasksLast7Days.filter(t => ['ACCEPTED', 'FAILED', 'REJECTED'].includes(t.state)).length;
    const onTimeRate7Days = totalAttempted7Days > 0 ? (acceptedLast7Days / totalAttempted7Days) * 100 : 100;

    // 7. Risk Classification
    let failureMargin: EnforcementMetrics['failureMargin'] = 'SAFE';
    if (bufferDays < 0) failureMargin = 'DANGER';
    else if (bufferDays < 3) failureMargin = 'CAUTION';

    let riskLevel: EnforcementMetrics['riskLevel'] = 'LOW';
    if (probability < 40) riskLevel = 'CRITICAL';
    else if (probability < 70) riskLevel = 'HIGH';
    else if (probability < 85) riskLevel = 'MEDIUM';

    let dailyLimit = 2;
    switch (riskLevel) {
        case 'CRITICAL': dailyLimit = 1; break;
        case 'HIGH': dailyLimit = 2; break;
        case 'MEDIUM': dailyLimit = 3; break;
        case 'LOW': dailyLimit = 4; break;
    }
    
    // BEYOND ACT POWER-UP: Each one adds +1 to daily capacity
    const beyondActCount = (user as any).beyondActCount || 0;
    dailyLimit += beyondActCount;

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

    const scoreChangeToday = goal.tasks
        .filter(t => {
            const updated = new Date(t.updatedAt);
            updated.setHours(0, 0, 0, 0);
            return updated.getTime() === todayStart.getTime();
        })
        .reduce((acc, t) => {
            if (t.state === 'ACCEPTED') return acc + 5;
            if (t.state === 'FAILED') return acc - 3;
            if (t.state === 'REJECTED') return acc - 2;
            return acc;
        }, 0);

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
        missedYesterday,
        daysBehind: bufferDays < 0 ? Math.abs(bufferDays) : 0,
        lastFailureReason,
        onTimeRate7Days: Math.round(onTimeRate7Days),
        daysExecuted7Days,
        bufferDays,
        failureMargin,
        scoreChangeToday,
        activeScore
    };
}
