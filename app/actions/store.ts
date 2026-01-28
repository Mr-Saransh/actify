"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";
import { revalidatePath } from "next/cache";
import { STORE_ITEMS } from "@/lib/store-data";

export async function purchaseItem(itemId: string) {
    const user = await getOrCreateUser() as any;
    if (!user) return { success: false, message: "Unauthorized" };

    const item = STORE_ITEMS.find(i => i.id === itemId);
    if (!item) return { success: false, message: "Item not found" };

    // Check Balance
    if (user.actCurrency < item.cost) {
        return { success: false, message: `Insufficient ACT Currency. Need ${item.cost - user.actCurrency} more.` };
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Deduct Currency
            await tx.user.update({
                where: { id: user.id },
                data: { actCurrency: { decrement: item.cost } } as any
            });

            // 2. Grant Item (Inventory)
            if (item.action === "FREEZE") {
                await tx.user.update({
                    where: { id: user.id },
                    data: { freezeActCount: { increment: 1 } } as any
                });
            } else if (item.action === "BEYOND") {
                await tx.user.update({
                    where: { id: user.id },
                    data: { beyondActCount: { increment: 1 } } as any
                });
            }
            // Merch/Resources are just logic-less for now
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/store");
        return { success: true, message: `Purchased ${item.name}!` };

    } catch (error) {
        console.error("Purchase error:", error);
        return { success: false, message: "Transaction Failed." };
    }
}
