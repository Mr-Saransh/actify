// Lazy-load Prisma to prevent evaluation during Next.js config collection
import type { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | undefined;

export async function getPrisma() {
    if (!prisma) {
        const { PrismaClient } = await import("@prisma/client");

        prisma = new PrismaClient({
            log: ["error"],
        });
    }

    return prisma;
}
