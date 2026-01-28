"use client";

import { useEffect, useState } from "react";
import { getPowerUpCounts, useBeyondAct, useLiquidFreeze } from "@/app/actions/powerups";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function PowerUpDisplay() {
    const [freezeCount, setFreezeCount] = useState(0);
    const [beyondCount, setBeyondCount] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        async function fetchCounts() {
            const counts = await getPowerUpCounts();
            setFreezeCount(counts.freezeCount);
            setBeyondCount(counts.beyondCount);
        }
        fetchCounts();

        // Refresh every 5 seconds
        const interval = setInterval(fetchCounts, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleUseBeyondAct = async () => {
        const result = await useBeyondAct();
        alert(result.message);
    };

    const handleUseLiquidFreeze = async () => {
        const result = await useLiquidFreeze();
        alert(result.message);
    };

    // Prevent hydration mismatch - show consistent UI on server and initial client render
    if (!mounted) {
        return (
            <div className="flex items-center gap-2" suppressHydrationWarning>
                <Badge variant="outline" className="bg-muted/30">
                    <span className="w-3 h-3 mr-1 inline-block"></span>
                    0
                </Badge>
                <Badge variant="outline" className="bg-muted/30">
                    <span className="w-3 h-3 mr-1 inline-block"></span>
                    0
                </Badge>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {/* Liquid Freeze */}
            <div className="flex items-center gap-1">
                <Badge
                    variant="outline"
                    className="bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400"
                >
                    <Image src="/liquid-freeze.png" alt="Freeze" width={12} height={12} className="mr-1" />
                    {freezeCount}
                </Badge>
                {freezeCount > 0 && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px]"
                        onClick={handleUseLiquidFreeze}
                    >
                        Info
                    </Button>
                )}
            </div>

            {/* Beyond Act */}
            <div className="flex items-center gap-1">
                <Badge
                    variant="outline"
                    className="bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400"
                >
                    <Image src="/beyond-act.png" alt="Beyond" width={12} height={12} className="mr-1" />
                    {beyondCount}
                </Badge>
                {beyondCount > 0 && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px]"
                        onClick={handleUseBeyondAct}
                    >
                        Info
                    </Button>
                )}
            </div>
        </div>
    );
}
