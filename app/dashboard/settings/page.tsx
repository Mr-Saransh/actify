export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { UserButton } from "@clerk/nextjs";
import { getOrCreateUser } from "@/app/actions/user";

export default async function SettingsPage() {
    const user = await getOrCreateUser();
    if (!user) return <div>Authenticating...</div>;

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-xl font-black italic tracking-tighter text-foreground uppercase">System Parameters</h2>
                <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">ACCESS LEVEL: RESTRICTED</span>
            </div>

            <div className="grid gap-6">
                {/* Allowed Settings */}
                <div className="bg-card border border-border rounded p-6 opacity-100">
                    <h3 className="font-bold text-muted-foreground uppercase tracking-widest text-xs mb-4">Core Configuration</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-border rounded bg-secondary/20">
                            <div>
                                <p className="text-sm font-bold text-foreground">Notification Timing</p>
                                <p className="text-xs text-muted-foreground font-mono">Push frequency</p>
                            </div>
                            <span className="text-xs text-green-500 font-mono">[ENABLED]</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-border rounded bg-secondary/20">
                            <div>
                                <p className="text-sm font-bold text-foreground">Proof Upload Method</p>
                                <p className="text-xs text-muted-foreground font-mono">Input source</p>
                            </div>
                            <span className="text-xs text-green-500 font-mono">[STANDARD]</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-border rounded bg-secondary/20">
                            <div>
                                <p className="text-sm font-bold text-foreground">Timezone Sync</p>
                                <p className="text-xs text-muted-foreground font-mono">Global alignment</p>
                            </div>
                            <span className="text-xs text-green-500 font-mono">[AUTO]</span>
                        </div>
                    </div>
                </div>

                {/* LockedSettings - Kept visually distinct as 'locked' but using theme vars */}
                <div className="bg-muted border border-destructive/20 rounded p-6 opacity-50 relative overflow-hidden pointer-events-none grayscale">
                    <div className="absolute inset-0 bg-[url('/diagonal-lines.png')] opacity-10" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-muted-foreground/30 p-4 rounded opacity-50">
                        <span className="text-4xl font-black text-muted-foreground uppercase">LOCKED</span>
                    </div>

                    <h3 className="font-bold text-muted-foreground uppercase tracking-widest text-xs mb-4">Comfort Protocols</h3>
                    <div className="space-y-4 blur-[1px]">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Gamification Sound Effects</span>
                            <div className="h-4 w-8 bg-muted-foreground/20 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Theme Customization</span>
                            <div className="h-4 w-8 bg-muted-foreground/20 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Difficulty Adjustment</span>
                            <div className="h-4 w-8 bg-muted-foreground/20 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Account */}
                <div className="bg-secondary/20 border border-border rounded p-6">
                    <h3 className="font-bold text-muted-foreground uppercase tracking-widest text-xs mb-4">Identity</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-muted-foreground">User Profile</span>
                        <UserButton />
                    </div>
                </div>
            </div>
        </div>
    );
}
