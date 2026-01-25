"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EgoFeedbackProps {
    failureDetected: boolean;
    streak: number;
}

export function EgoFeedback({ failureDetected, streak }: EgoFeedbackProps) {
    if (!failureDetected) return null;

    return (
        <div className="mb-6 animate-in slide-in-from-top duration-500">
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 text-destructive-foreground">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-lg font-bold uppercase tracking-widest">Execution Failure Detected</AlertTitle>
                <AlertDescription className="mt-2 text-sm font-mono">
                    <p>You missed a deadline. Progress has been halted.</p>
                    <p className="mt-1">Streak reset to {streak}. Probability of success has dropped.</p>
                    <p className="mt-4 font-bold">"Comfort creates procrastination. Get back to work."</p>
                </AlertDescription>
            </Alert>
        </div>
    );
}
