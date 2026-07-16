"use client";

import { Star, Coins } from "lucide-react";

interface ActCurrencyDisplayProps {
    actPoints: number;
    actCurrency: number;
}

export function ActCurrencyDisplay({ actPoints, actCurrency }: ActCurrencyDisplayProps) {
    return (
        <div className="flex items-center gap-2">
            {/* ACT Points */}
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg border border-primary/20">
                <Star className="h-3.5 w-3.5 fill-primary" />
                <span className="text-xs font-bold tabular-nums">{actPoints.toLocaleString()}</span>
            </div>

            {/* ACT Currency */}
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
                <Coins className="h-3.5 w-3.5" />
                <span className="text-xs font-bold tabular-nums">{actCurrency.toLocaleString()}</span>
            </div>
        </div>
    );
}
