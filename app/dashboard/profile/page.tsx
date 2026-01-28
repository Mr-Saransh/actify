import { getOrCreateUser } from "@/app/actions/user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, Target, AlertTriangle, Snowflake, Rocket } from "lucide-react";

export const runtime = "nodejs";

export default async function ProfilePage() {
    const user = await getOrCreateUser() as any;

    if (!user) return <div>Unauthorized</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Identity Header */}
            <div className="flex items-start md:items-center justify-between gap-6 flex-col md:flex-row">
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border-2 border-primary">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                            {user.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">{user.email.split('@')[0]}</h1>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">ID: {user.clerkId.slice(-8)}</Badge>
                            <Badge className="bg-primary text-primary-foreground">Level {user.level}</Badge>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Card className="bg-primary/5 border-primary/20 p-4 min-w-[120px]">
                        <div className="flex items-center gap-2 mb-2">
                            <img src="/act-points.png" alt="ACT Points" className="h-6 w-6 object-contain" />
                            <div className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Reputation</div>
                        </div>
                        <div className="text-2xl font-bold text-primary">{user.actPoints}</div>
                    </Card>
                    <Card className="bg-yellow-500/5 border-yellow-500/20 p-4 min-w-[120px]">
                        <div className="flex items-center gap-2 mb-2">
                            <img src="/act-currency.png" alt="ACT Currency" className="h-6 w-6 object-contain" />
                            <div className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Wealth</div>
                        </div>
                        <div className="text-2xl font-bold text-yellow-500">{user.actCurrency}</div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Performance Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Performance Data
                        </CardTitle>
                        <CardDescription>Lifetime enforcement statistics.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-muted-foreground">Tasks Completed</span>
                            <span className="font-mono font-bold text-foreground">{user.tasksCompleted}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-muted-foreground">Goals Conquered</span>
                            <span className="font-mono font-bold text-green-500">{user.goalsCompleted}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-muted-foreground">Protocol Failures</span>
                            <span className="font-mono font-bold text-destructive">{user.failures}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground">Current Streak</span>
                            <span className="font-mono font-bold text-foreground">{user.streak} Days</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-purple-500" />
                            Active Inventory
                        </CardTitle>
                        <CardDescription>Available power-ups and resources.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 flex items-center justify-center rounded-md p-1">
                                    <img src="/liquid-freeze.png" alt="Liquid Freeze" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">Liquid Freeze</div>
                                    <div className="text-xs text-muted-foreground">Failure forgiveness</div>
                                </div>
                            </div>
                            <div className="text-2xl font-bold font-mono text-purple-400">{user.freezeActCount}</div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 flex items-center justify-center rounded-md p-1">
                                    <img src="/beyond-act.png" alt="Beyond ACT" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">Beyond ACT</div>
                                    <div className="text-xs text-muted-foreground">Limit override</div>
                                </div>
                            </div>
                            <div className="text-2xl font-bold font-mono text-blue-400">{user.beyondActCount}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
