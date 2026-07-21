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

export async function createListing(data: { title: string; description: string; price: number; category: string; imageUrl?: string }) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized" };

    if (!data.title || !data.description || data.price < 0 || !data.category) {
        return { success: false, message: "Invalid listing data" };
    }

    try {
        await prisma.marketplaceListing.create({
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                category: data.category,
                imageUrl: data.imageUrl,
                sellerId: user.id,
            } as any
        });

        revalidatePath("/dashboard/marketplace");
        return { success: true, message: "Listing created successfully!" };
    } catch (error) {
        console.error("Create listing error:", error);
        return { success: false, message: "Failed to create listing" };
    }
}

export async function publishJourney(goalId: string, price: number, description: string) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized" };

    // Fetch Goal with everything
    const rawGoal = await prisma.goal.findUnique({
        where: { id: goalId },
        include: {
            milestones: { orderBy: { order: "asc" } },
            tasks: { 
                orderBy: { date: "asc" },
                include: { proof: true }
            }
        } as any
    });
    const goal = rawGoal as any;

    if (!goal || goal.userId !== user.id) {
        return { success: false, message: "Goal not found or unauthorized." };
    }

    if (goal.status !== "COMPLETED") {
        return { success: false, message: "Only completed goals can be published as verified journeys." };
    }

    // Check if already published
    const existing = await prisma.marketplaceListing.findFirst({
        where: { sellerId: user.id, title: goal.title, category: "JOURNEY" } as any
    });

    if (existing) {
        return { success: false, message: "You have already published this journey." };
    }

    // Create JSON Snapshot
    const journeyData = {
        goal: {
            title: goal.title,
            category: goal.category,
            experienceLevel: goal.experienceLevel,
            estimatedHours: goal.estimatedHours,
            difficulty: goal.difficulty,
            timePerDay: goal.timePerDay,
        },
        milestones: goal.milestones.map((m: any) => ({ title: m.title, description: m.description, duration: m.duration })),
        tasks: goal.tasks.filter((t: any) => t.state === "ACCEPTED").map((t: any) => ({
            title: t.title,
            objective: t.objective,
            expectedOutput: t.expectedOutput,
            resources: t.resources,
            hints: t.hints,
            proof: t.proof ? { content: t.proof.content, aiFeedback: t.proof.aiFeedback } : null
        }))
    };

    try {
        // Publish to Marketplace
        await prisma.marketplaceListing.create({
            data: {
                sellerId: user.id,
                title: goal.title,
                description: description || `A verified journey from my completion of ${goal.title}.`,
                price: price,
                category: "JOURNEY",
                journeyData: journeyData
            } as any
        });

        revalidatePath("/dashboard/marketplace");
        revalidatePath("/dashboard/history");
        return { success: true, message: "Journey published successfully!" };
    } catch (error) {
        console.error("Publish journey error:", error);
        return { success: false, message: "Failed to publish journey" };
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

export async function updateListing(id: string, data: { title?: string; description?: string; price?: number; category?: string; imageUrl?: string | null }) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized" };

    try {
        const listing = await prisma.marketplaceListing.findUnique({ where: { id } });
        if (!listing) return { success: false, message: "Listing not found" };
        if (listing.sellerId !== user.id) return { success: false, message: "Unauthorized" };

        await prisma.marketplaceListing.update({
            where: { id },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description && { description: data.description }),
                ...(data.price !== undefined && { price: data.price }),
                ...(data.category && { category: data.category }),
                ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
            } as any
        });

        revalidatePath("/dashboard/marketplace");
        revalidatePath(`/dashboard/marketplace/${id}`);
        return { success: true, message: "Listing updated successfully!" };
    } catch (error) {
        console.error("Update listing error:", error);
        return { success: false, message: "Failed to update listing" };
    }
}

export async function deleteListing(id: string) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized" };

    try {
        const listing = await prisma.marketplaceListing.findUnique({ where: { id } });
        if (!listing) return { success: false, message: "Listing not found" };
        if (listing.sellerId !== user.id) return { success: false, message: "Unauthorized" };

        await prisma.marketplaceListing.delete({ where: { id } });

        revalidatePath("/dashboard/marketplace");
        return { success: true, message: "Listing deleted successfully!" };
    } catch (error) {
        console.error("Delete listing error:", error);
        return { success: false, message: "Failed to delete listing" };
    }
}

export async function addReview(listingId: string, rating: number, comment: string) {
    const user = await getOrCreateUser();
    if (!user) return { success: false, message: "Unauthorized" };

    if (rating < 1 || rating > 5) {
        return { success: false, message: "Rating must be between 1 and 5" };
    }
    if (!comment || comment.trim() === "") {
        return { success: false, message: "Comment cannot be empty" };
    }

    try {
        const existingReview = await (prisma as any).review.findFirst({
            where: { listingId, userId: user.id }
        });
        
        if (existingReview) {
            return { success: false, message: "You have already reviewed this product." };
        }
        const pointsEarned = rating >= 4 ? 2 : 1;
        
        await prisma.$transaction([
            (prisma as any).review.create({
                data: {
                    listingId,
                    userId: user.id,
                    rating,
                    comment
                }
            }),
            prisma.user.update({
                where: { id: user.id },
                data: { actPoints: { increment: pointsEarned } }
            })
        ]);
        revalidatePath(`/dashboard/marketplace/${listingId}`);
        revalidatePath("/dashboard/marketplace");
        return { success: true, message: `Review added successfully! You earned ${pointsEarned} ACT points.` };
    } catch (error) {
        console.error("Add review error:", error);
        return { success: false, message: "Failed to add review" };
    }
}
