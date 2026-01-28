import { Skeleton } from "./ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="space-y-4 md:space-y-8 max-w-6xl mx-auto pb-6 md:pb-12 animate-pulse">

            {/* 0. HEADER CONTEXT (Goal Intelligence) */}
            <div className="bg-background">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 border-b">
                    <div className="space-y-2 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                        <div className="flex gap-1">
                            <Skeleton className="h-1 w-full md:w-64" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. TOP SECTION: ACTIVE PROTOCOL (TaskView) */}
            <div className="w-full">
                <div className="w-full border-2 border-muted bg-card rounded-lg overflow-hidden">
                    {/* Active Header */}
                    <div className="bg-muted/30 p-4 md:p-6 border-b border-muted flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-24 rounded-full" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                            <Skeleton className="h-10 w-64 md:w-96" />
                        </div>
                        <Skeleton className="h-12 w-32" />
                    </div>

                    {/* Active Content */}
                    <div className="p-4 md:p-6 space-y-8">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-6 w-full border-l-4 border-muted pl-4" />
                        </div>
                        <div className="flex flex-col items-center gap-4 py-4">
                            <Skeleton className="h-12 w-48 rounded-md" />
                            <Skeleton className="h-3 w-64" />
                        </div>
                        <div className="bg-muted/10 p-4 border border-muted/20 rounded space-y-2">
                            <Skeleton className="h-3 w-32 mb-2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. MIDDLE SECTION: PRESSURE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Ego Panel */}
                <div className="hidden md:block space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-40 w-full rounded-lg" />
                </div>
                {/* Enforcement Data (Center) */}
                <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-24 w-full rounded-md" />
                        <Skeleton className="h-24 w-full rounded-md" />
                        <Skeleton className="h-24 w-full col-span-2 rounded-md" />
                    </div>
                </div>
                {/* Risk Forecast */}
                <div className="hidden md:block space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-40 w-full rounded-lg" />
                </div>
            </div>

            {/* 3. BOTTOM SECTION: EXECUTION PATH */}
            <div className="space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex gap-3 md:gap-4 overflow-x-hidden pt-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-sm" />
                    ))}
                </div>
                <Skeleton className="h-3 w-48 mx-auto" />
            </div>
        </div>
    );
}
