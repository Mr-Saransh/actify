import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function Loading() {
    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-12">
            <div className="text-center space-y-4">
                <Skeleton className="h-12 w-64 mx-auto" />
                <Skeleton className="h-4 w-96 mx-auto" />
            </div>

            {/* SECTIONS */}
            {[1, 2].map((section) => (
                <div key={section} className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="bg-card">
                                <CardHeader className="space-y-4">
                                    <Skeleton className="h-10 w-10 rounded-md" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-24" />
                                </CardContent>
                                <CardFooter>
                                    <Skeleton className="h-10 w-full" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
