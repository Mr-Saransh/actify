"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, History, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader } from "@/components/ui/sheet";

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
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-none">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-black border-r border-zinc-800 p-0 text-white">
                <SheetHeader className="p-6 border-b border-zinc-800 text-left">
                    <div className="relative w-32 h-8">
                        <Image
                            src="/logo.png"
                            alt="ACTIFY"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </SheetHeader>
                <div className="flex flex-col">
                    <NavItem
                        href="/dashboard"
                        icon={LayoutDashboard}
                        label="Active Protocol"
                        subtext="Current Enforced Objective"
                    />
                    <NavItem
                        href="/dashboard/history"
                        icon={History}
                        label="Execution Log"
                        subtext="Immutable Record"
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
