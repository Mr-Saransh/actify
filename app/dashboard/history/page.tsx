export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getOrCreateUser } from "@/app/actions/user";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default async function HistoryPage() {
    const user = await getOrCreateUser();

    if (!user) {
        return <div>Authenticating...</div>;
    }

    // Fetch past tasks (Accepted, Rejected, Failed)
    const history = await prisma.task.findMany({
        where: {
            goal: { userId: user.id },
            state: { in: ["ACCEPTED", "REJECTED", "FAILED"] }
        },
        orderBy: { updatedAt: 'desc' },
        include: { proof: true }
    });

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-primary">Execution History</h2>

            {history.length === 0 ? (
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center text-muted-foreground">
                    No execution history found. Start your first protocol.
                </div>
            ) : (
                <div className="grid gap-4">
                    {history.map((task) => (
                        <Card key={task.id} className="overflow-hidden">
                            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-muted-foreground uppercase">Level {task.dayIndex}</span>
                                        <h3 className="font-semibold">{task.title}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                        {task.proof?.explanation || "No explanation provided."}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {new Date(task.updatedAt).toLocaleString()}
                                    </p>
                                </div>

                                <div className="shrink-0">
                                    {task.state === "ACCEPTED" && (
                                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                                            <CheckCircle className="mr-1 h-3 w-3" /> Verified
                                        </Badge>
                                    )}
                                    {task.state === "REJECTED" && (
                                        <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
                                            <XCircle className="mr-1 h-3 w-3" /> Rejected
                                        </Badge>
                                    )}
                                    {task.state === "FAILED" && (
                                        <Badge variant="destructive">
                                            <AlertTriangle className="mr-1 h-3 w-3" /> Failed
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
