"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2 } from "lucide-react";
import { publishJourney } from "@/app/actions/marketplace";
import { useToast } from "@/hooks/use-toast";

interface PublishJourneyButtonProps {
    goalId: string;
}

export function PublishJourneyButton({ goalId }: PublishJourneyButtonProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        const price = Number(formData.get("price"));
        const description = formData.get("description") as string;
        
        const result = await publishJourney(goalId, price, description);
        setIsSubmitting(false);

        if (result.success) {
            setOpen(false);
            toast({ title: "Success", description: result.message });
        } else {
            toast({ title: "Failed", description: result.message, className: "bg-destructive text-destructive-foreground border-destructive" });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Upload className="mr-2 h-4 w-4" />
                    Publish Journey
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Publish to Marketplace</DialogTitle>
                    <DialogDescription>
                        Convert your completed goal into a Verified Journey. This bundles your entire history (tasks, proofs, AI feedback) into an immutable JSON snapshot.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price (ACT Currency)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                placeholder="e.g. 50"
                                required
                                min={0}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Explain why others should buy your roadmap..."
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {isSubmitting ? "Publishing..." : "Publish to Marketplace"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
