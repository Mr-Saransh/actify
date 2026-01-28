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
import { Upload } from "lucide-react";
import { submitProof } from "@/app/actions/proof";

interface SubmitProofDialogProps {
    taskId: string;
}

export function SubmitProofDialog({ taskId }: SubmitProofDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        const result = await submitProof(taskId, formData);
        setIsSubmitting(false);

        if (result.success) {
            setOpen(false);
        } else {
            alert(result.message); // Simple alert for MVP
            // Keep dialog open for retry
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Proof
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Submit Verification</DialogTitle>
                    <DialogDescription>
                        Provide evidence of your execution. No proof, no progress.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="content">Proof URL / Content</Label>
                            <Input
                                id="content"
                                name="content"
                                placeholder="https://github.com/... or specific text"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="image">Proof Image (Optional)</Label>
                            <Input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/*"
                            />
                            <p className="text-[10px] text-muted-foreground">Max 2MB. Supports PNG, JPG.</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="explanation">Explanation</Label>
                            <Textarea
                                id="explanation"
                                name="explanation"
                                placeholder="Briefly explain what you accomplished..."
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Verifying..." : "Submit Proof"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
