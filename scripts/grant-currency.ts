
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function grantCurrency() {
    const target = "sonamsahoo929";
    const amount = 200;

    console.log(`Searching for user matching: ${target}...`);

    // Search by email or name
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { contains: target, mode: 'insensitive' } },
                { name: { contains: target, mode: 'insensitive' } },
                { clerkId: target } // Just in case
            ]
        }
    });

    if (!user) {
        console.error("❌ User not found!");
        return;
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current Balance: ${user.actCurrency}`);

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            actCurrency: { increment: amount }
        }
    });

    console.log(`✅ Granted ${amount} Act Currency!`);
    console.log(`New Balance: ${updatedUser.actCurrency}`);
}

grantCurrency()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
