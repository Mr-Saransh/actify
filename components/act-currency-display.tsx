"use client";

import Image from "next/image";

interface ActCurrencyDisplayProps {
    actPoints: number;
    actCurrency: number;
}

export function ActCurrencyDisplay({ actPoints, actCurrency }: ActCurrencyDisplayProps) {
    return (
        <div className="flex items-center gap-1.5 md:gap-2">
            {/* ACT Points */}
            <div className="flex items-center gap-1 md:gap-1.5 bg-primary/10 text-primary px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg border border-primary/20 shrink-0">
                <Image src="/act-points.png" alt="ACT Points" width={16} height={16} unoptimized className="object-contain md:w-[18px] md:h-[18px]" />
                <span className="text-[10px] md:text-xs font-bold tabular-nums whitespace-nowrap">{actPoints.toLocaleString()}</span>
            </div>

            {/* ACT Currency */}
            <div className="flex items-center gap-1 md:gap-2 bg-amber-500/10 text-amber-500 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg border border-amber-500/20 shrink-0">
                <Image src="/act-currency.jpg" alt="ACT Currency" width={28} height={12} unoptimized className="object-contain md:w-[36px] md:h-[16px]" />
                <span className="text-[10px] md:text-xs font-bold tabular-nums whitespace-nowrap">{actCurrency.toLocaleString()}</span>
            </div>
        </div>
    );
}
