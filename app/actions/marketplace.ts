"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageToCloudinary(formData: FormData): Promise<{ url?: string; error?: string }> {
    try {
        const file = formData.get("file") as File;
        if (!file) return { error: "No file provided" };

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary using a Promise
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "actify_marketplace" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        return { url: (result as any).secure_url };
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return { error: "Failed to upload image" };
    }
}

export async function createListing(data: { title: string; description: string; price: number; imageUrl?: string }) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized" };

    if (!data.title || !data.description || data.price < 0) {
        return { success: false, message: "Invalid listing data" };
    }

    try {
        await prisma.marketplaceListing.create({
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                imageUrl: data.imageUrl,
                sellerId: user.id,
            }
        });

        revalidatePath("/dashboard/marketplace");
        return { success: true, message: "Listing created successfully!" };
    } catch (error) {
        console.error("Create listing error:", error);
        return { success: false, message: "Failed to create listing" };
    }
}

export async function getListings() {
    try {
        const listings = await prisma.marketplaceListing.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                seller: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    }
                }
            }
        });
        return { success: true, data: listings };
    } catch (error) {
        console.error("Get listings error:", error);
        return { success: false, message: "Failed to fetch listings", data: [] };
    }
}

export async function purchaseListing(listingId: string) {
    const user = await getOrCreateUser() as any;
    if (!user) return { success: false, message: "Unauthorized" };

    try {
        const listing = await prisma.marketplaceListing.findUnique({
            where: { id: listingId }
        });

        if (!listing) return { success: false, message: "Listing not found" };
        if (listing.sellerId === user.id) return { success: false, message: "You cannot buy your own listing" };
        if (user.actCurrency < listing.price) {
            return { success: false, message: `Insufficient ACT Currency. Need ${listing.price - user.actCurrency} more.` };
        }

        // Perform transaction
        await prisma.$transaction(async (tx) => {
            // Deduct from buyer
            await tx.user.update({
                where: { id: user.id },
                data: { actCurrency: { decrement: listing.price } } as any
            });

            // Add to seller
            await tx.user.update({
                where: { id: listing.sellerId },
                data: { actCurrency: { increment: listing.price } } as any
            });

            // Normally we'd record the transaction/ownership here, but we'll keep it simple for now
        });

        revalidatePath("/dashboard/marketplace");
        revalidatePath("/dashboard");
        return { success: true, message: `Purchased ${listing.title} successfully!` };
    } catch (error) {
        console.error("Purchase error:", error);
        return { success: false, message: "Transaction failed" };
    }
}
