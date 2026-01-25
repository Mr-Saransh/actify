import { Skeleton } from "./ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Ego / Header */}
            <div className="w-full h-12 bg-muted/20 rounded-lg"></div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Left */}
                <div className="w-full md:w-1/3 space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                </div>

                {/* Right (Map) */}
                <div className="w-full md:w-2/3 h-48 bg-muted/20 rounded-xl border border-dashed border-muted"></div>
            </div>

            {/* Task Area */}
            <div className="flex justify-center pt-8">
                <div className="w-full max-w-3xl space-y-4">
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
