"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

export async function getOrCreateUser(): Promise<User | null> {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    // Fast path: find user in DB with just the local token ID
    let user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (user) {
        return user;
    }

    // Slow path: fetch from Clerk API to get email/image for creation
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("User has no email address");

    // Create user since they don't exist
    user = await prisma.user.create({
        data: {
            clerkId: clerkUser.id,
            email: email,
            image: clerkUser.imageUrl,
            level: 1, // Start at Level 1
        },
    });

    return user;
}
