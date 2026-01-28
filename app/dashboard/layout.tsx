import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import { LayoutDashboard, Target, History, Settings, Menu, Trophy, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { auth } from "@clerk/nextjs/server";
import { IdentityCard } from "@/components/identity-card";
import { MobileNav } from "@/components/mobile-nav";
import { ActCurrencyDisplay } from "@/components/act-currency-display";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getOrCreateUser } from "@/app/actions/user";
import { prisma } from "@/lib/prisma";
import { calculateEnforcementMetrics } from "@/lib/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface NavItemProps {
    href: string;
    icon: React.ElementType;
    label: string;
    subtext: string;
}

function NavItem({ href, icon: Icon, label, subtext }: NavItemProps) {
    return (
        <Link href={href} className="group block border-b border-sidebar-border p-4 hover:bg-sidebar-accent/50 transition-colors">
            <div className="flex items-center gap-3 mb-1">
                <Icon className="h-4 w-4 text-sidebar-foreground/60 group-hover:text-sidebar-primary transition-colors" />
                <span className="text-sm font-bold tracking-widest text-sidebar-foreground/80 group-hover:text-sidebar-foreground uppercase transition-colors">
                    {label}
                </span>
            </div>
            <p className="text-[10px] text-sidebar-foreground/50 font-mono pl-7 uppercase tracking-wider">
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
    const user = await getOrCreateUser();

    if (user && !user.name) {
        // Avoid redirect loop if we are already on onboarding (but this is dashboard layout so safe)
        // Actually, we use redirect from next/navigation
        const { redirect } = await import("next/navigation");
        redirect("/onboarding/profile");
    }

    return (
        <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/30">
            {/* Sidebar (Desktop) */}
            <aside className="w-72 border-r border-sidebar-border bg-sidebar hidden md:flex flex-col">
                <div className="p-6 border-b border-sidebar-border">
                    <div className="relative w-48 h-12">
                        <Image
                            src="/actify-logo.png"
                            alt="ACTIFY"
                            fill
                            className="object-contain object-left dark:invert-0 dark:hue-rotate-0 minimal:invert-0 minimal:hue-rotate-0 invert hue-rotate-180"
                            priority
                        />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
                        <span className="text-[10px] font-mono text-sidebar-foreground/50 uppercase tracking-widest">System Armed</span>
                    </div>
                </div>

                <nav className="flex-1 flex flex-col overflow-y-auto">
                    <NavItem
                        href="/dashboard"
                        icon={LayoutDashboard}
                        label="Active Protocol"
                        subtext="Current Enforced Objective"
                    />

                    <NavItem
                        href="/dashboard/leaderboard"
                        icon={Trophy}
                        label="Leaderboard"
                        subtext="Global Rankings"
                    />

                    <NavItem
                        href="/dashboard/store"
                        icon={ShoppingBag}
                        label="Actify Store"
                        subtext="Resources & Power-ups"
                    />

                    <NavItem
                        href="/dashboard/history"
                        icon={History}
                        label="Execution Log"
                        subtext="Immutable Record"
                    />

                    <NavItem
                        href="/dashboard/profile"
                        icon={User}
                        label="Identity"
                        subtext="User Profile"
                    />

                    <div className="mt-auto">
                        <NavItem
                            href="/dashboard/settings"
                            icon={Settings}
                            label="System Parameters"
                            subtext="Limited Control"
                        />
                    </div>
                </nav>

                <div className="p-4 bg-sidebar">
                    <div className="text-[8px] text-sidebar-foreground/50 font-mono uppercase text-center mt-4">
                        Actify Enforcement Protocol v2.0
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-background">
                {/* Top Header */}
                <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background">
                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden flex items-center gap-4">
                        <MobileNav />
                        <div className="relative w-24 h-8">
                            <Image
                                src="/actify-logo.png"
                                alt="ACTIFY"
                                fill
                                className="object-contain object-left dark:invert-0 dark:hue-rotate-0 minimal:invert-0 minimal:hue-rotate-0 invert hue-rotate-180"
                                priority
                            />
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-4 md:gap-8">
                        {/* ACT Currency Display */}
                        <ActCurrencyDisplay
                            actPoints={user?.actPoints || 0}
                            actCurrency={user?.actCurrency || 0}
                        />

                        {/* Theme Switcher */}
                        <ThemeSwitcher />

                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "h-8 w-8 rounded-sm border border-border",
                                }
                            }}
                        />
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    {children}
                </div>
            </main>
        </div>
    );
}
