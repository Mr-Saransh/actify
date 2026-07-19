import { getOrCreateUser } from "@/app/actions/user";
import { prisma } from "@/lib/prisma";
import { History, CheckCircle, XCircle, AlertCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PublishJourneyButton } from "../../../components/publish-journey-button";

export const runtime = "nodejs";

export default async function HistoryPage() {
    const user = await getOrCreateUser();

    if (!user) {
        return <div className="flex items-center justify-center h-full text-muted-foreground">Authenticating...</div>;
    }

    // Fetch all goals and their tasks
    const goals = await prisma.goal.findMany({
        where: { userId: user.id },
        include: {
            tasks: {
                where: {
                    state: { in: ['ACCEPTED', 'REJECTED', 'FAILED'] }
                },
                include: {
                    proof: true
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            }
        }
    });

    const allTasks = goals.flatMap(g => g.tasks.map(t => ({ ...t, goalTitle: g.title })))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const accepted = allTasks.filter(t => t.state === 'ACCEPTED').length;
    const rejected = allTasks.filter(t => t.state === 'REJECTED').length;
    const failed = allTasks.filter(t => t.state === 'FAILED').length;
    const total = accepted + rejected + failed;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl animate-slide-up">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <History className="w-6 h-6 text-primary" />
                        Execution History
                    </h1>
                    <p className="text-sm text-muted-foreground">Immutable log of your performance.</p>
                </div>

                <div className="flex gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-500 tabular-nums">{accepted}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Accepted</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-amber-500 tabular-nums">{rejected}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Rejected</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-destructive tabular-nums">{failed}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Failed</p>
                    </div>
                </div>
            </div>

            {/* Completed Goals Section */}
            {goals.filter(g => g.status === 'COMPLETED').length > 0 && (
                <div className="space-y-4 pt-4">
                    <h2 className="text-xl font-bold tracking-tight">Completed Goals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {goals.filter(g => g.status === 'COMPLETED').map((goal: any) => (
                            <div key={goal.id} className="p-4 rounded-xl border border-border bg-emerald-500/5 flex flex-col justify-between h-full">
                                <div>
                                    <h3 className="font-bold text-lg text-emerald-500 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        {goal.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-emerald-500/10 flex items-center justify-between">
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                        + {Math.floor((goal.estimatedHours || 10) * (goal.difficulty === 'Hard' ? 3 : goal.difficulty === 'Medium' ? 2 : 1) * 10)} ACT Currency
                                    </Badge>
                                    <PublishJourneyButton goalId={goal.id} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent pt-4 mt-8">
                {allTasks.length === 0 ? (
                    <div className="text-center py-12 relative z-10 bg-background/80 backdrop-blur-sm rounded-xl">
                        <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold">No execution data</h3>
                        <p className="text-muted-foreground text-sm">Start your first goal to build your history.</p>
                    </div>
                ) : allTasks.map((task, i) => {
                    const isAccepted = task.state === 'ACCEPTED';
                    const isRejected = task.state === 'REJECTED';
                    
                    return (
                        <div key={task.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                            {/* Marker */}
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_var(--background)] z-10 ${
                                isAccepted ? 'text-emerald-500' : isRejected ? 'text-amber-500' : 'text-destructive'
                            }`}>
                                {isAccepted ? <CheckCircle className="w-5 h-5 fill-current text-background" /> : 
                                 isRejected ? <AlertCircle className="w-5 h-5 fill-current text-background" /> : 
                                 <XCircle className="w-5 h-5 fill-current text-background" />}
                            </div>

                            {/* Card */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card card-hover">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className={`text-[10px] uppercase tracking-widest ${
                                        isAccepted ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 
                                        isRejected ? 'border-amber-500/30 text-amber-500 bg-amber-500/5' : 
                                        'border-destructive/30 text-destructive bg-destructive/5'
                                    }`}>
                                        {task.state}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {new Date(task.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <h3 className="font-bold text-base leading-tight mb-1">{task.title}</h3>
                                <p className="text-xs text-muted-foreground font-medium mb-3 truncate">Goal: {task.goalTitle}</p>
                                
                                {task.proof && (
                                    <div className="mt-3 pt-3 border-t border-border/50">
                                        <p className="text-[11px] font-mono text-muted-foreground line-clamp-2">
                                            <span className="text-foreground/50">Proof:</span> {task.proof.content}
                                        </p>
                                        {task.proof.aiFeedback && (
                                            <div className="mt-2 p-2 rounded-md bg-secondary/50 text-[11px] text-muted-foreground">
                                                <span className="font-semibold text-primary">System:</span> {task.proof.aiFeedback}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
