import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { MobileNav } from "@/components/mobile-nav";
import { ActCurrencyDisplay } from "@/components/act-currency-display";
import { BottomNav } from "@/components/bottom-nav";
import { getOrCreateUser } from "@/app/actions/user";
import { NotificationBell } from "@/components/notification-bell";
import { DesktopSidebar } from "@/components/desktop-sidebar";

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
        <div className="flex h-[100dvh] bg-background text-foreground font-sans selection:bg-primary/30">
            {/* Sidebar (Desktop) */}
            <DesktopSidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-background">
                {/* Top Header */}
                <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
                    {/* Mobile: Menu + Logo */}
                    <div className="md:hidden flex items-center gap-3">
                        <MobileNav />
                        <div className="relative w-28 h-8">
                            <Image
                                src="/brand-logo.png"
                                alt="ACTIFY"
                                fill
                                unoptimized
                                className="object-contain object-left"
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
