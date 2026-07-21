import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/app/actions/user";
import { ProductClient } from "./product-client";

// Required for dynamic routes in Next.js 15+ if you are awaiting params
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getOrCreateUser();
    if (!user) redirect("/sign-in");

    // Await params per Next.js 15 changes for dynamic routes
    const { id } = await params;

    const listing = await prisma.marketplaceListing.findUnique({
        where: { id: id },
        include: {
            seller: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                }
            },
            reviews: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    if (!listing) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Product not found</h2>
                    <p className="text-muted-foreground mt-2">The listing you are looking for does not exist.</p>
                </div>
            </div>
        );
    }

    return (
        <ProductClient 
            listing={listing} 
            currentUser={{ id: user.id, actCurrency: user.actCurrency }} 
        />
    );
}
