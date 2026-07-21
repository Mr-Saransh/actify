import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/app/actions/user";
import { getNetworkData } from "@/app/actions/network";
import { NetworkClient } from "./network-client";

export default async function NetworkPage() {
    const user = await getOrCreateUser();
    if (!user) redirect("/sign-in");

    const networkData = await getNetworkData();
    const fallbackData = {
        pendingReceived: [],
        pendingSent: [],
        recentConnections: [],
        allFriends: []
    };

    return <NetworkClient currentUserId={user.id} networkData={networkData.data || fallbackData} />;
}
