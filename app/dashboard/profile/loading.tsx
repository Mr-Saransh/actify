import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Identity Header */}
            <div className="flex items-start md:items-center justify-between gap-6 flex-col md:flex-row">
                <div className="flex items-center gap-6">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Skeleton className="h-24 w-32 rounded-lg" />
                    <Skeleton className="h-24 w-32 rounded-lg" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Performance Stats */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-5 w-12" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Inventory */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-8 w-8" />
                                    <div>
                                        <Skeleton className="h-5 w-32 mb-1" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                </div>
                                <Skeleton className="h-8 w-8" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
