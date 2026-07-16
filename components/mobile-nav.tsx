"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Target, History, Settings, Menu, Trophy,
    ShoppingBag, User, MessageCircle, BarChart2, Store
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface NavItemProps {
    href: string;
    icon: React.ElementType;
    label: string;
    active?: boolean;
}

function NavItem({ href, icon: Icon, label, active }: NavItemProps) {
    return (
        <Link
            href={href}
            className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 mb-0.5 transition-all duration-200
                ${active
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
        >
            <Icon className={`h-[18px] w-[18px] transition-colors ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
            <span className="text-[13px] tracking-wide">{label}</span>
            {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            )}
        </Link>
    );
}

export function MobileNav() {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <Button variant="ghost" size="icon" className="text-muted-foreground rounded-lg cursor-not-allowed opacity-50">
                <Menu className="h-5 w-5" />
            </Button>
        );
    }

    const navItems = [
        { href: "/dashboard/overview", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/dashboard", icon: Target, label: "Active Protocol" },
        { href: "/dashboard/history", icon: History, label: "Execution History" },
        { href: "/dashboard/leaderboard", icon: Trophy, label: "Leaderboard" },
        { href: "/dashboard/store", icon: ShoppingBag, label: "ACT Store" },
        { href: "/dashboard/marketplace", icon: Store, label: "Marketplace" },
        { href: "/dashboard/profile", icon: User, label: "Profile" },
        { href: "/dashboard/community", icon: MessageCircle, label: "Community" },
        { href: "/dashboard/analytics", icon: BarChart2, label: "Analytics" },
        { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ];

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar border-r border-sidebar-border p-0 text-sidebar-foreground">
                <SheetHeader className="px-5 pt-6 pb-4 border-b border-sidebar-border text-left">
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
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SheetDescription className="sr-only">Access ACTIFY system navigation</SheetDescription>
                    <p className="text-[10px] text-sidebar-foreground/40 font-medium tracking-widest uppercase mt-1">Execution OS</p>
                </SheetHeader>
                <nav className="flex flex-col py-3 overflow-y-auto flex-1">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            active={pathname === item.href || (item.href === "/dashboard" && pathname === "/dashboard" && item.label === "Active Protocol")}
                        />
                    ))}
                </nav>
                <div className="p-4 border-t border-sidebar-border">
                    <p className="text-[10px] text-sidebar-foreground/30 font-medium text-center tracking-wider">
                        ACTIFY v2.0 • Execution OS
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
