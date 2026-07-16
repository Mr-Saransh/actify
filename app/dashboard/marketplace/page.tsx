export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getOrCreateUser } from "@/app/actions/user";
import { getListings } from "@/app/actions/marketplace";
import { MarketplaceClient } from "./marketplace-client";

export default async function MarketplacePage() {
    const user = await getOrCreateUser();

    if (!user) {
        return <div className="flex items-center justify-center h-full text-muted-foreground">Authenticating...</div>;
    }

    const { data: listings } = await getListings();

    return (
        <MarketplaceClient
            user={{
                id: user.id,
                actCurrency: user.actCurrency,
            }}
            initialListings={listings || []}
        />
    );
}
