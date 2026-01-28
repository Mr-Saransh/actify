"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const ProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
});

export async function completeOnboarding(prevState: unknown, formData: FormData) {
    const user = await getOrCreateUser();

    if (!user) {
        return { success: false, message: "Unauthorized", errors: {} };
    }

    const rawData = {
        name: formData.get("name"),
        email: formData.get("email"),
    };

    const validated = ProfileSchema.safeParse(rawData);

    if (!validated.success) {
        return { success: false, errors: validated.error.flatten().fieldErrors, message: "Validation failed" };
    }

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                name: validated.data.name,
                email: validated.data.email,
            } as any
        });
    } catch (error) {
        return { success: false, message: "Failed to update profile.", errors: {} };
    }

    revalidatePath("/dashboard");
    redirect("/dashboard");
}
