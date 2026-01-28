"use client";

import { Star, Coins, CreditCard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActCurrencyDisplayProps {
    actPoints: number;
    actCurrency: number;
}

export function ActCurrencyDisplay({ actPoints = 0, actCurrency = 0 }: ActCurrencyDisplayProps) {
    return (
        <div className="flex items-center gap-2 md:gap-6 font-mono">
            {/* ACT POINTS (Reputation) */}
            <div className="flex flex-col items-end">
                <span className="hidden md:block text-[10px] text-muted-foreground uppercase tracking-widest">ACT Points</span>
                <div className="flex items-center gap-1.5">
                    <img src="/act-points.png" alt="ACT Points" className="h-5 w-5 md:h-6 md:w-6 object-contain" />
                    <span className="text-sm md:text-xl font-bold text-foreground">{actPoints}</span>
                </div>
            </div>

            <div className="h-8 w-px bg-border hidden md:block" />

            {/* ACT CURRENCY (Spendable) */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative flex flex-col items-end h-auto p-0 px-2 hover:bg-transparent">
                        <span className="hidden md:block text-[10px] text-muted-foreground uppercase tracking-widest self-end">ACT Currency</span>
                        <div className="flex items-center gap-1.5">
                            <img src="/act-currency.png" alt="ACT Currency" className="h-5 w-5 md:h-6 md:w-6 object-contain" />
                            <span className="text-sm md:text-xl font-bold text-foreground">{actCurrency}</span>
                            <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Buy ACT Currency</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="justify-between cursor-pointer">
                        <span>200 ACT</span>
                        <span className="text-muted-foreground">₹20</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="justify-between cursor-pointer">
                        <span>400 ACT</span>
                        <span className="text-muted-foreground">₹40</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="justify-between cursor-pointer">
                        <span>700 ACT</span>
                        <span className="text-muted-foreground">₹60</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="justify-between cursor-pointer">
                        <span>1000 ACT</span>
                        <span className="text-muted-foreground">₹80</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="justify-between cursor-pointer bg-primary/10 text-primary font-bold">
                        <span>1500 ACT</span>
                        <span>₹100</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
