"use client";

import Image from "next/image";

interface ActCurrencyDisplayProps {
    actPoints: number;
    actCurrency: number;
}

export function ActCurrencyDisplay({ actPoints, actCurrency }: ActCurrencyDisplayProps) {
    return (
        <div className="flex items-center gap-2">
            {/* ACT Points */}
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg border border-primary/20">
                <Image src="/act-points.png" alt="ACT Points" width={18} height={18} unoptimized className="object-contain" />
                <span className="text-xs font-bold tabular-nums">{actPoints.toLocaleString()}</span>
            </div>

            {/* ACT Currency */}
            <div className="flex items-center gap-2 bg-amber-500/10 text-amber-500 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
                <Image src="/act-currency.jpg" alt="ACT Currency" width={36} height={16} unoptimized className="object-contain" />
                <span className="text-xs font-bold tabular-nums">{actCurrency.toLocaleString()}</span>
            </div>
        </div>
    );
}
