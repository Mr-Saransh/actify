import { getOrCreateUser } from "@/app/actions/user";
import { STORE_ITEMS } from "@/lib/store-data";
import { Coins, Zap, Package, BookOpen } from "lucide-react";
import { StoreClient } from "./store-client";

export const runtime = "nodejs";

export default async function StorePage() {
    const user = await getOrCreateUser();

    if (!user) {
        return <div className="flex items-center justify-center h-full text-muted-foreground">Authenticating...</div>;
    }

    const powerUps = STORE_ITEMS.filter(item => item.category === "POWER-UP");
    const merch = STORE_ITEMS.filter(item => item.category === "MERCH");
    const resources = STORE_ITEMS.filter(item => item.category === "RESOURCE");

    return (
        <StoreClient
            actCurrency={user.actCurrency}
            powerUps={powerUps}
            merch={merch}
            resources={resources}
        />
    );
}
