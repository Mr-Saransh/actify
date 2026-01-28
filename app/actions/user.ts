"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

export async function getOrCreateUser(): Promise<User | null> {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        return null;
    }

    const existingUser = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
    });

    if (existingUser) {
        // Sync Image if changed
        if (existingUser.image !== clerkUser.imageUrl) {
            await prisma.user.update({
                where: { id: existingUser.id },
                data: { image: clerkUser.imageUrl } as any
            });
        }
        return existingUser;
    }

    // Create new user
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) throw new Error("User has no email address");

    const newUser = await prisma.user.create({
        data: {
            clerkId: clerkUser.id,
            email: email,
            image: clerkUser.imageUrl,
            level: 1, // Start at Level 1
        } as any,
    });

    return newUser;
}
