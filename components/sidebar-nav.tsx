"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Target, History, Settings, Trophy,
    ShoppingBag, User, MessageCircle, Store, Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
    href: string;
    icon: React.ElementType;
    label: string;
    active?: boolean;
    onClick?: () => void;
    isCollapsed?: boolean;
}

function NavItem({ href, icon: Icon, label, active, onClick, isCollapsed }: NavItemProps) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`group flex items-center py-2.5 rounded-lg mx-2 mb-1 transition-all duration-300 relative overflow-hidden
                ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'}
                ${active
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
            title={isCollapsed ? label : undefined}
        >
            {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full shadow-[0_0_8px_var(--primary)] animate-in fade-in slide-in-from-left-1" />
            )}
            
            {/* Hover background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <Icon className={`h-[18px] w-[18px] transition-all duration-300 shrink-0 relative z-10 ${active ? 'text-primary scale-110' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/90 group-hover:scale-110'}`} />
            
            {!isCollapsed && (
                <span className="text-[13px] tracking-wide truncate relative z-10">{label}</span>
            )}
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

export function SidebarNav({ onNavigate, isCollapsed = false }: { onNavigate?: () => void, isCollapsed?: boolean }) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <nav className="flex-1 flex flex-col py-4 overflow-y-auto overflow-x-hidden">
            {/* Main Section */}
            <div className={cn("px-4 mb-2 animate-in fade-in slide-in-from-left-2 duration-500", isCollapsed && "text-center px-2")}>
                <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest truncate">
                    {isCollapsed ? "•" : "Main"}
                </p>
            </div>
            <div className="space-y-0.5 mb-2">
                {mainNav.map((item, index) => (
                    <div key={item.href} className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
                        <NavItem
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            active={isActive(item.href)}
                            onClick={onNavigate}
                            isCollapsed={isCollapsed}
                        />
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div className="mx-4 my-3 border-t border-sidebar-border/50" />

            {/* Secondary Section */}
            <div className={cn("px-4 mb-2 animate-in fade-in slide-in-from-left-2 duration-500", isCollapsed && "text-center px-2")} style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest truncate">
                    {isCollapsed ? "•" : "Personal"}
                </p>
            </div>
            <div className="space-y-0.5">
                {secondaryNav.map((item, index) => (
                    <div key={item.href} className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${350 + index * 50}ms`, animationFillMode: 'both' }}>
                        <NavItem
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            active={isActive(item.href)}
                            onClick={onNavigate}
                            isCollapsed={isCollapsed}
                        />
                    </div>
                ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Settings at bottom */}
            <div className="mx-4 mb-1 border-t border-sidebar-border/50 pt-3 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <NavItem
                    href="/dashboard/settings"
                    icon={Settings}
                    label="Settings"
                    active={isActive("/dashboard/settings")}
                    onClick={onNavigate}
                    isCollapsed={isCollapsed}
                />
            </div>
        </nav>
    );
}
