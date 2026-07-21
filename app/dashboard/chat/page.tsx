import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/app/actions/user";
import { getNetworkData } from "@/app/actions/network";
import { getGroups } from "@/app/actions/chat";
import { ChatClient } from "./chat-client";

export default async function ChatPage() {
    const user = await getOrCreateUser();
    if (!user) redirect("/sign-in");

    const networkData = await getNetworkData();
    const groupsResponse = await getGroups();

    return (
        <ChatClient 
            currentUserId={user.id} 
            friends={networkData.data?.allFriends || []} 
            groups={groupsResponse.data || []}
        />
    );
}
