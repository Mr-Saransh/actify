import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import {
    LayoutDashboard, Target, History, Settings, Trophy,
    ShoppingBag, User, MessageCircle, BarChart2, Store, Bell
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { MobileNav } from "@/components/mobile-nav";
import { ActCurrencyDisplay } from "@/components/act-currency-display";
import { BottomNav } from "@/components/bottom-nav";
import { getOrCreateUser } from "@/app/actions/user";
import { prisma } from "@/lib/prisma";
import { SidebarNav } from "@/components/sidebar-nav";
import { NotificationBell } from "@/components/notification-bell";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getOrCreateUser();

    if (user && !user.name) {
        const { redirect } = await import("next/navigation");
        redirect("/onboarding/profile");
    }

    return (
        <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/30">
            {/* Sidebar (Desktop) */}
            <aside className="w-[260px] border-r border-sidebar-border bg-sidebar hidden md:flex flex-col">
                {/* Logo */}
                <div className="px-5 pt-6 pb-4 border-b border-sidebar-border">
                    <div className="flex items-center gap-2.5">
                        <div className="relative w-28 h-7">
                            <Image
                                src="/actify-logo.png"
                                alt="ACTIFY"
                                fill
                                className="object-contain object-left"
                                style={{ filter: 'brightness(0) invert(1)' }}
                                priority
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-sidebar-foreground/40 font-medium tracking-widest uppercase mt-2">Execution OS</p>
                </div>

                {/* Navigation */}
                <SidebarNav />

                {/* Footer */}
                <div className="p-4 border-t border-sidebar-border mt-auto">
                    <p className="text-[10px] text-sidebar-foreground/30 font-medium text-center tracking-wider">
                        ACTIFY v2.0
                    </p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-background">
                {/* Top Header */}
                <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
                    {/* Mobile: Menu + Logo */}
                    <div className="md:hidden flex items-center gap-3">
                        <MobileNav />
                        <div className="relative w-20 h-6">
                            <Image
                                src="/actify-logo.png"
                                alt="ACTIFY"
                                fill
                                className="object-contain object-left"
                                style={{ filter: 'brightness(0) invert(1)' }}
                                priority
                            />
                        </div>
                    </div>

                    {/* Desktop: Spacer */}
                    <div className="hidden md:block" />

                    {/* Right side controls */}
                    <div className="ml-auto flex items-center gap-3">
                        <ActCurrencyDisplay
                            actPoints={user?.actPoints || 0}
                            actCurrency={user?.actCurrency || 0}
                        />

                        <NotificationBell />

                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "h-8 w-8 rounded-lg border border-border",
                                }
                            }}
                        />
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-4 md:p-6 pb-bottom-nav md:pb-6">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation (Mobile) */}
            <BottomNav />
        </div>
    );
}
