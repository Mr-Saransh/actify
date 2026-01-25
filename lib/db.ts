// Lazy-load Prisma to prevent evaluation during Next.js config collection
import type { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

export async function getPrisma() {
    if (!prisma) {
        try {
            const { PrismaClient } = await import("@prisma/client");
            prisma = new PrismaClient({
                log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
            });

            // Test connection
            await prisma.$connect();
        } catch (error) {
            console.error("❌ Prisma Client Error:", error);
            console.error("DATABASE_URL exists:", !!process.env.DATABASE_URL);
            console.error("DATABASE_URL preview:", process.env.DATABASE_URL?.substring(0, 20) + "...");
            throw error;
        }
    }
    return prisma;
}
