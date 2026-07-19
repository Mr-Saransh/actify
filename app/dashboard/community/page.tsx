import { CommunityClient } from "./community-client";
import { getOrCreateUser } from "@/app/actions/user";
import { getNetworkData } from "@/app/actions/network";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CommunityPage() {
    const user = await getOrCreateUser();
    if (!user) return null;

    const networkRes = await getNetworkData();
    const networkData = networkRes.success && networkRes.data ? networkRes.data : {
        pendingReceived: [],
        pendingSent: [],
        recentConnections: [],
        allFriends: []
    };

    return <CommunityClient currentUserId={user.id} networkData={networkData} />;
}
