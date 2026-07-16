"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, ShoppingBag, Store, User } from "lucide-react";

const tabs = [
    { href: "/dashboard/overview", icon: LayoutDashboard, label: "Home" },
    { href: "/dashboard", icon: Target, label: "Protocol" },
    { href: "/dashboard/store", icon: ShoppingBag, label: "Store" },
    { href: "/dashboard/marketplace", icon: Store, label: "Market" },
    { href: "/dashboard/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
            <div className="flex items-center justify-around h-16 px-1" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href || (tab.href === "/dashboard" && pathname === "/dashboard");
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1.5 px-2 rounded-xl transition-all duration-200
                                ${isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/10' : ''}`}>
                                <tab.icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                                {isActive && (
                                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                )}
                            </div>
                            <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : ''}`}>
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
