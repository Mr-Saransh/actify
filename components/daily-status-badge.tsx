"use client";

import { useEffect, useState } from "react";
import { getDailyStatus } from "@/app/actions/daily-check";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";

export function DailyStatusBadge() {
    const [completedToday, setCompletedToday] = useState<boolean | null>(null);

    useEffect(() => {
        async function fetchStatus() {
            const status = await getDailyStatus();
            setCompletedToday(status.completedToday || false);
        }
        fetchStatus();
    }, []);

    // Before data loads, show neutral state (same on server and client)
    if (completedToday === null) {
        return (
            <Badge
                variant="outline"
                className="bg-muted/30 border-muted text-muted-foreground"
                suppressHydrationWarning
            >
                <Clock className="w-3 h-3 mr-1" />
                Daily Task
            </Badge>
        );
    }

    if (completedToday) {
        return (
            <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Daily Complete
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            Complete 1 Task
        </Badge>
    );
}
