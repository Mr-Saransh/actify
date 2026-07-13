"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

export async function getOrCreateUser(): Promise<User | null> {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        return null;
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) throw new Error("User has no email address");

    const user = await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: {
            image: clerkUser.imageUrl, // Automatically syncs image on login
        },
        create: {
            clerkId: clerkUser.id,
            email: email,
            image: clerkUser.imageUrl,
            level: 1, // Start at Level 1
        },
    });

    return user;
}
