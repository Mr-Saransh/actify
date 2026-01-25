import { PrismaClient } from "@prisma/client";

console.log("🔥 PRISMA CLIENT LOADING - Stack:", new Error().stack?.split('\n').slice(0, 5).join('\n'));

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Lazy initialization to prevent "adapter required" error in Edge
export const prisma = globalForPrisma.prisma ?? (() => {
    console.log("🔥 PRISMA CLIENT INSTANTIATING");
    const client = new PrismaClient({
        log: ["error"],
    });

    if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = client;
    }

    return client;
})();

if (process.env.NODE_ENV !== "production" && !globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma;
}
