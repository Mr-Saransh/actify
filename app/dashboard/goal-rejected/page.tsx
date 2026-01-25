import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export default function GoalRejectedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-6">
            <div className="p-4 bg-red-500/10 rounded-full">
                <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>

            <div className="space-y-2 max-w-md">
                <h1 className="text-3xl font-bold tracking-tight text-white">Action Blocked</h1>
                <p className="text-muted-foreground">
                    This goal has been flagged as either <strong>infeasible, unsafe, or inappropriate</strong>.
                </p>
                <p className="text-sm text-zinc-500">
                    Actify maintains high standards for self-improvement protocols.
                    Goals involving harm, illegal activities, or physically impossible timelines (e.g., "Master C++ in 1 day") are not permitted.
                </p>
            </div>

            <Link href="/dashboard">
                <Button variant="outline" className="mt-4">Return to Dashboard</Button>
            </Link>
        </div>
    );
}
