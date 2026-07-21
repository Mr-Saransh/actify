"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Target, History, Settings, Trophy,
    ShoppingBag, User, MessageCircle, Store, Users
} from "lucide-react";

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
            className={`group flex items-center gap-3 px-3 py-2 rounded-lg mx-2 mb-0.5 transition-all duration-200 relative
                ${active
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
        >
            {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
            )}
            <Icon className={`h-[17px] w-[17px] transition-colors shrink-0 ${active ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80'}`} />
            <span className="text-[13px] tracking-wide truncate">{label}</span>
        </Link>
    );
}

const mainNav = [
    { href: "/dashboard/overview", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard", icon: Target, label: "Active Protocol" },
    { href: "/dashboard/history", icon: History, label: "Execution History" },
    { href: "/dashboard/leaderboard", icon: Trophy, label: "Leaderboard" },
    { href: "/dashboard/store", icon: ShoppingBag, label: "ACT Store" },
    { href: "/dashboard/marketplace", icon: Store, label: "Marketplace" },
];

const secondaryNav = [
    { href: "/dashboard/profile", icon: User, label: "Profile" },
    { href: "/dashboard/network", icon: Users, label: "Network" },
    { href: "/dashboard/chat", icon: MessageCircle, label: "Chat" },
];

export function SidebarNav() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <nav className="flex-1 flex flex-col py-3 overflow-y-auto">
            {/* Main Section */}
            <div className="px-4 mb-2">
                <p className="text-[10px] font-semibold text-sidebar-foreground/30 uppercase tracking-widest">Main</p>
            </div>
            {mainNav.map((item) => (
                <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    active={isActive(item.href)}
                />
            ))}

            {/* Divider */}
            <div className="mx-4 my-3 border-t border-sidebar-border" />

            {/* Secondary Section */}
            <div className="px-4 mb-2">
                <p className="text-[10px] font-semibold text-sidebar-foreground/30 uppercase tracking-widest">Personal</p>
            </div>
            {secondaryNav.map((item) => (
                <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    active={isActive(item.href)}
                />
            ))}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Settings at bottom */}
            <div className="mx-4 mb-1 border-t border-sidebar-border pt-3">
                <NavItem
                    href="/dashboard/settings"
                    icon={Settings}
                    label="Settings"
                    active={isActive("/dashboard/settings")}
                />
            </div>
        </nav>
    );
}
