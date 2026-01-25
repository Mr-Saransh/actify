"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
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
        return existingUser;
    }

    // Create new user
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) throw new Error("User has no email address");

    const newUser = await prisma.user.create({
        data: {
            clerkId: clerkUser.id,
            email: email,
            level: 1, // Start at Level 1
        },
    });

    return newUser;
}
