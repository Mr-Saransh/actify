"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, History, Settings, Menu, Trophy, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

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

export function MobileNav() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        // Return a stable placeholder or nothing to avoid hydration mismatch
        return (
            <Button variant="ghost" size="icon" className="text-zinc-400 rounded-none cursor-not-allowed opacity-50">
                <Menu className="h-5 w-5" />
            </Button>
        );
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-none">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar border-r border-sidebar-border p-0 text-sidebar-foreground">
                <SheetHeader className="p-6 border-b border-sidebar-border text-left">
                    <div className="relative w-32 h-8">
                        <Image
                            src="/actify-logo.png"
                            alt="ACTIFY"
                            fill
                            className="object-contain object-left dark:invert-0 dark:hue-rotate-0 minimal:invert-0 minimal:hue-rotate-0 invert hue-rotate-180"
                            priority
                        />
                    </div>
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SheetDescription className="sr-only">Access ACTIFY system navigation</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col">
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
                    <NavItem
                        href="/dashboard/settings"
                        icon={Settings}
                        label="System Parameters"
                        subtext="Limited Control"
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
