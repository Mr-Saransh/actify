"use client";

import { terminateGoal } from "@/app/actions/goal";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

interface TerminateGoalButtonProps {
    goalId: string;
}

export function TerminateGoalButton({ goalId }: TerminateGoalButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleTerminate = () => {
        if (confirm("Are you sure you want to terminate this protocol? This action cannot be undone.")) {
            startTransition(async () => {
                await terminateGoal(goalId);
            });
        }
    };

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleTerminate}
            disabled={isPending}
            className="w-full md:w-auto"
        >
            <Trash2 className="mr-2 h-4 w-4" />
            {isPending ? "Terminating..." : "Abort Goal (Permanent)"}
        </Button>
    );
}
