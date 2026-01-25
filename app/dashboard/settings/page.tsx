import { UserButton } from "@clerk/nextjs";
import { getOrCreateUser } from "@/app/actions/user";

export default async function SettingsPage() {
    const user = await getOrCreateUser();
    if (!user) return <div>Authenticating...</div>;

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">System Parameters</h2>
                <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded">ACCESS LEVEL: RESTRICTED</span>
            </div>

            <div className="grid gap-6">
                {/* Allowed Settings */}
                <div className="bg-zinc-950 border border-zinc-800 rounded p-6 opacity-100">
                    <h3 className="font-bold text-zinc-300 uppercase tracking-widest text-xs mb-4">Core Configuration</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-zinc-800 rounded bg-black">
                            <div>
                                <p className="text-sm font-bold text-zinc-400">Notification Timing</p>
                                <p className="text-xs text-zinc-600 font-mono">Push frequency</p>
                            </div>
                            <span className="text-xs text-green-500 font-mono">[ENABLED]</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-zinc-800 rounded bg-black">
                            <div>
                                <p className="text-sm font-bold text-zinc-400">Proof Upload Method</p>
                                <p className="text-xs text-zinc-600 font-mono">Input source</p>
                            </div>
                            <span className="text-xs text-green-500 font-mono">[STANDARD]</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-zinc-800 rounded bg-black">
                            <div>
                                <p className="text-sm font-bold text-zinc-400">Timezone Sync</p>
                                <p className="text-xs text-zinc-600 font-mono">Global alignment</p>
                            </div>
                            <span className="text-xs text-green-500 font-mono">[AUTO]</span>
                        </div>
                    </div>
                </div>

                {/* Locked Settings */}
                <div className="bg-zinc-950 border border-red-900/20 rounded p-6 opacity-50 relative overflow-hidden pointer-events-none grayscale">
                    <div className="absolute inset-0 bg-[url('/diagonal-lines.png')] opacity-10" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-zinc-800 p-4 rounded opacity-50">
                        <span className="text-4xl font-black text-zinc-800 uppercase">LOCKED</span>
                    </div>

                    <h3 className="font-bold text-zinc-500 uppercase tracking-widest text-xs mb-4">Comfort Protocols</h3>
                    <div className="space-y-4 blur-[1px]">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-600">Gamification Sound Effects</span>
                            <div className="h-4 w-8 bg-zinc-900 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-600">Theme Customization</span>
                            <div className="h-4 w-8 bg-zinc-900 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-600">Difficulty Adjustment</span>
                            <div className="h-4 w-8 bg-zinc-900 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Account */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded p-6">
                    <h3 className="font-bold text-zinc-500 uppercase tracking-widest text-xs mb-4">Identity</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-zinc-400">User Profile</span>
                        <UserButton />
                    </div>
                </div>
            </div>
        </div>
    );
}
