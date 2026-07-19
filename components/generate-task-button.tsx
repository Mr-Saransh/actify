"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { generateNextTask } from "@/app/actions/ai-task";
import { useToast } from "@/hooks/use-toast";

interface GenerateTaskButtonProps {
    goalId: string;
}

export function GenerateTaskButton({ goalId }: GenerateTaskButtonProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleGenerate = () => {
        startTransition(async () => {
            const result = await generateNextTask(goalId);
            if (result.success) {
                toast({ title: "Task Generated", description: "Your next objective is ready." });
            } else if (result.limitReached) {
                toast({ title: "Limit Reached", description: result.message, className: "bg-destructive text-destructive-foreground border-destructive" });
            } else if (result.completed) {
                toast({ title: "Milestones Completed", description: result.message });
            } else {
                toast({ title: "Error", description: result.message || "Failed to generate task", className: "bg-destructive text-destructive-foreground border-destructive" });
            }
        });
    };

    return (
        <div className="p-8 md:p-12 text-center rounded-xl border border-dashed border-border space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Ready for Next Objective?</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
                The AI engine will analyze your current milestone and past performance to generate your next highly-contextual task.
            </p>
            <Button 
                size="lg" 
                onClick={handleGenerate} 
                disabled={isPending}
                className="mt-4"
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Directive...
                    </>
                ) : (
                    <>
                        <Zap className="mr-2 h-5 w-5" />
                        Generate Today's Task
                    </>
                )}
            </Button>
        </div>
    );
}
