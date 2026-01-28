import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="space-y-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-96" />
            </div>

            <div className="rounded-lg border border-border bg-card">
                <div className="overflow-x-auto">
                    <div className="w-full">
                        {/* Header */}
                        <div className="flex items-center bg-muted/50 p-4 border-b border-border">
                            <Skeleton className="h-4 w-8 mr-6" /> {/* Rank */}
                            <Skeleton className="h-4 w-32 mr-auto" /> {/* Agent */}
                            <Skeleton className="h-4 w-20 hidden md:block" /> {/* Rep */}
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-border">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="flex items-center p-4">
                                    <div className="mr-6">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                    </div>
                                    <div className="flex items-center gap-3 mr-auto">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
