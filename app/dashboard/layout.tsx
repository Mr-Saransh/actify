
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import { LayoutDashboard, Target, History, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { IdentityCard } from "@/components/identity-card";
import { MobileNav } from "@/components/mobile-nav";


interface NavItemProps {
    href: string;
    icon: React.ElementType;
    label: string;
    subtext: string;
}

function NavItem({ href, icon: Icon, label, subtext }: NavItemProps) {
    return (
        <Link href={href} className="group block border-b border-zinc-800 p-4 hover:bg-zinc-900/50 transition-colors">
            <div className="flex items-center gap-3 mb-1">
                <Icon className="h-4 w-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
                <span className="text-sm font-bold tracking-widest text-zinc-400 group-hover:text-zinc-100 uppercase transition-colors">
                    {label}
                </span>
            </div>
            <p className="text-[10px] text-zinc-600 font-mono pl-7 uppercase tracking-wider">
                {subtext}
            </p>
        </Link>
    );
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();
    let recentLogs: any[] = [];
    let userPoints = 0;
    let activeScore = 0;

    if (userId) {
        recentLogs = await prisma.proof.findMany({
            where: { task: { goal: { userId } } },
            orderBy: { createdAt: 'desc' },
            take: 3,
            select: { id: true, reviewStatus: true, createdAt: true }
        });

        const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { points: true } });
        if (user) userPoints = user.points;

        // Calculate Active Score
        const activeGoal = await prisma.goal.findFirst({
            where: { userId: userId, status: "ACTIVE" },
            include: { tasks: true }
        });

        if (activeGoal) {
            activeScore = activeGoal.tasks.reduce((acc, t) => {
                if (t.state === 'ACCEPTED') return acc + 5;
                if (t.state === 'FAILED') return acc - 3;
                if (t.state === 'REJECTED') return acc - 2;
                return acc;
            }, 0);
        }
    }
    return (
        <div className="flex h-screen bg-black text-white font-sans selection:bg-red-500/30">
            {/* Sidebar (Desktop) */}
            <aside className="w-72 border-r border-zinc-800 bg-black hidden md:flex flex-col">
                <div className="p-6 border-b border-zinc-800">
                    <div className="relative w-48 h-12">
                        <Image
                            src="/logo.png"
                            alt="ACTIFY"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">System Armed</span>
                    </div>
                </div>

                <nav className="flex-1 flex flex-col">
                    <NavItem
                        href="/dashboard"
                        icon={LayoutDashboard}
                        label="Active Protocol"
                        subtext="Current Enforced Objective"
                    />

                    <div>
                        <NavItem
                            href="/dashboard/history"
                            icon={History}
                            label="Execution Log"
                            subtext="Immutable Record"
                        />
                        {/* Preview Log */}
                        <div className="px-10 py-2 space-y-2">
                            {recentLogs.map(log => (
                                <div key={log.id} className="text-[10px] font-mono text-zinc-600 border-l border-zinc-800 pl-2">
                                    <span className={log.reviewStatus === 'ACCEPTED' ? "text-green-700" : "text-red-900"}>
                                        [{log.reviewStatus === 'ACCEPTED' ? 'OK' : 'FAIL'}]
                                    </span>
                                    {" "}{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            ))}
                        </div>
                    </div>

                    <NavItem
                        href="/dashboard/settings"
                        icon={Settings}
                        label="System Parameters"
                        subtext="Limited Control"
                    />
                </nav>

                <div className="p-4 bg-black mt-auto">
                    {userId && await prisma.user.findUnique({ where: { clerkId: userId } }).then(u => u && <IdentityCard user={u} />)}

                    <div className="text-[8px] text-zinc-800 font-mono uppercase text-center mt-4">
                        Actify Enforcement Protocol v2.0
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-black">
                {/* Top Header */}
                <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-black">
                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden flex items-center gap-4">
                        <MobileNav />
                        <span className="font-bold tracking-tight text-sm md:hidden">ACTIFY</span>
                    </div>

                    <div className="ml-auto flex items-center space-x-8">
                        {/* Scores Display */}
                        <div className="hidden md:flex gap-8">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Active Score</span>
                                <span className={`text-sm font-bold font-mono ${activeScore < 0 ? 'text-red-500' : 'text-white'}`}>
                                    {activeScore > 0 ? '+' : ''}{activeScore}
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Total Score</span>
                                <span className="text-sm font-bold font-mono text-white">{userPoints}</span>
                            </div>
                        </div>

                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "h-8 w-8 rounded-sm border border-zinc-700",
                                }
                            }}
                        />
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {children}
                </div>
            </main>
        </div>
    );
}
