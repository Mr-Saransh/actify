"use client";

import { useActionState } from "react";
import { completeOnboarding } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type ProfileFormProps = {
    userEmail: string;
};

const initialState = {
    success: false,
    message: "",
    errors: {} as Record<string, string[] | undefined>
};

export function ProfileForm({ userEmail }: ProfileFormProps) {
    const [state, action, isPending] = useActionState(completeOnboarding, initialState);

    return (
        <form action={action}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name / Codename</Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="e.g. John Doe or Agent 47"
                        required
                        minLength={2}
                        defaultValue=""
                    />
                    {state.errors?.name && (
                        <p className="text-sm text-red-500">{state.errors.name[0]}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={userEmail}
                        required
                    />
                    {state.errors?.email && (
                        <p className="text-sm text-red-500">{state.errors.email[0]}</p>
                    )}
                </div>
                {state.message && !state.success && (
                    <p className="text-sm text-red-500">{state.message}</p>
                )}
            </CardContent>
            <CardFooter>
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Initializing...
                        </>
                    ) : (
                        "Initialize Profile"
                    )}
                </Button>
            </CardFooter>
        </form>
    );
}
