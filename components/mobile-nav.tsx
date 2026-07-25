"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";

export function MobileNav() {
    const [isMounted, setIsMounted] = useState(false);
    const [open, setOpen] = useState(false);

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

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] bg-sidebar border-r border-sidebar-border p-0 text-sidebar-foreground flex flex-col h-full">
                <SheetHeader className="px-5 pt-6 pb-4 border-b border-sidebar-border text-left">
                    <div className="flex items-center gap-2.5">
                        <div className="relative w-36 h-10">
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
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SheetDescription className="sr-only">Access ACTIFY system navigation</SheetDescription>
                    <p className="text-[10px] text-sidebar-foreground/40 font-medium tracking-widest uppercase mt-2">Execution OS</p>
                </SheetHeader>
                
                <SidebarNav onNavigate={() => setOpen(false)} />

                <div className="p-4 border-t border-sidebar-border">
                    <p className="text-[10px] text-sidebar-foreground/30 font-medium text-center tracking-wider">
                        ACTIFY v2.0
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
