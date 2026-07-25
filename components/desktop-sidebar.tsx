"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/sidebar-nav";
import { cn } from "@/lib/utils";

export function DesktopSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside 
            className={cn(
                "border-r border-sidebar-border bg-sidebar hidden md:flex flex-col transition-all duration-300 relative z-30 shadow-xl group",
                isCollapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            {/* Toggle Button */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-4 top-[76px] h-8 w-8 rounded-full border-sidebar-border bg-sidebar shadow-md z-50 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:flex"
            >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                <span className="sr-only">Toggle Sidebar</span>
            </Button>

            {/* Logo */}
            <div className="px-5 pt-6 pb-4 border-b border-sidebar-border flex flex-col items-center min-h-[92px]">
                {!isCollapsed ? (
                    <div className="flex flex-col w-full animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-2.5">
                            <div className="relative w-36 h-10 transition-transform duration-300 hover:scale-105 origin-left">
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
                        <p className="text-[10px] text-sidebar-foreground/40 font-medium tracking-widest uppercase mt-2">Execution OS</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-300">
                        <div className="relative w-8 h-10">
                            {/* We can use the icon.png when collapsed */}
                            <Image
                                src="/icon.png"
                                alt="ACTIFY"
                                fill
                                unoptimized
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <SidebarNav isCollapsed={isCollapsed} />

            {/* Footer */}
            <div className="p-4 border-t border-sidebar-border mt-auto flex justify-center">
                <p className="text-[10px] text-sidebar-foreground/30 font-medium text-center tracking-wider truncate">
                    {isCollapsed ? "v2.0" : "ACTIFY v2.0"}
                </p>
            </div>
        </aside>
    );
}
