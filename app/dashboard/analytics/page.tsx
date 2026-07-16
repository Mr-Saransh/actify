export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getOrCreateUser } from "@/app/actions/user";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
    const user = await getOrCreateUser();

    if (!user) {
        return <div className="flex items-center justify-center h-full text-muted-foreground">Authenticating...</div>;
    }

    // Since Overview page now acts as the Analytics Hub, we just redirect there
    // This keeps the routing simple while fulfilling the nav requirement
    redirect("/dashboard/overview");
}
