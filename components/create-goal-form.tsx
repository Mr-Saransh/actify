"use client";

import { useActionState } from "react";
import { createGoal, CreateGoalState } from "@/app/actions/goal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function CreateGoalForm() {
    const initialState: CreateGoalState = { message: "", errors: {} };
    const [state, formAction, isPending] = useActionState<CreateGoalState, FormData>(createGoal, initialState);

    return (
        <Card className="w-full max-w-2xl mx-auto border-destructive/20 shadow-lg shadow-destructive/5">
            <CardHeader>
                <CardTitle className="text-2xl">Initialize Objective</CardTitle>
                <CardDescription>
                    Planning is over. Define your target. Execution is mandatory.
                </CardDescription>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Goal Statement</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="e.g., Build MVP in 30 days"
                            required
                        />
                        {state.errors?.title && (
                            <p className="text-sm text-destructive">{state.errors.title.join(", ")}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select name="type" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PROJECT">Project (Build/Create)</SelectItem>
                                <SelectItem value="SKILL">Skill (Learn/Master)</SelectItem>
                                <SelectItem value="EXAM">Exam (Study/Pass)</SelectItem>
                            </SelectContent>
                        </Select>
                        {state.errors?.type && (
                            <p className="text-sm text-destructive">{state.errors.type.join(", ")}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deadline">Deadline (Non-Negotiable)</Label>
                        <Input
                            id="deadline"
                            name="deadline"
                            type="date"
                            required
                            suppressHydrationWarning
                        />
                        {state.errors?.deadline && (
                            <p className="text-sm text-destructive">{state.errors.deadline.join(", ")}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Detailed outcome..."
                        />
                    </div>

                    {state.errors?.validation && (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-2">
                            <div className="font-bold text-destructive text-sm">Goal Validation Failed</div>
                            {state.errors.validation.map((error, idx) => (
                                <p key={idx} className="text-sm text-destructive">{error}</p>
                            ))}
                        </div>
                    )}

                    {state.message && !state.errors?.validation && (
                        <div className="p-3 bg-muted text-sm border-l-2 border-primary">
                            {state.message}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Locking Target..." : "Initiate Execution Protocol"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
