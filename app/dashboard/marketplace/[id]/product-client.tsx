"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Coins, Tag, Star, User, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { purchaseListing, addReview } from "@/app/actions/marketplace";
import Link from "next/link";

interface ProductClientProps {
    listing: any;
    currentUser: {
        id: string;
        actCurrency: number;
    };
}

export function ProductClient({ listing, currentUser }: ProductClientProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [isReviewing, setIsReviewing] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    
    const isOwner = listing.sellerId === currentUser.id;
    const hasReviewed = listing.reviews?.some((r: any) => r.userId === currentUser.id);

    // Calculate Average Rating
    const averageRating = listing.reviews && listing.reviews.length > 0 
        ? listing.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / listing.reviews.length 
        : 0;

    const handlePurchase = () => {
        startTransition(async () => {
            const result = await purchaseListing(listing.id);
            if (result.success) {
                toast({ title: "Purchase Successful", description: result.message });
            } else {
                toast({ title: "Purchase Failed", description: result.message, className: "bg-destructive text-destructive-foreground border-destructive" });
            }
        });
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsReviewing(true);
        
        try {
            const result = await addReview(listing.id, rating, comment);
            if (result.success) {
                toast({ title: "Review Added", description: "Your review has been successfully posted." });
                setComment("");
                setRating(5);
            } else {
                toast({ title: "Failed to add review", description: result.message, className: "bg-destructive text-destructive-foreground border-destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong.", className: "bg-destructive text-destructive-foreground border-destructive" });
        } finally {
            setIsReviewing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-4">
            <Link href="/dashboard/marketplace" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                {/* Image Section */}
                <div className="relative w-full aspect-square md:aspect-[4/3] bg-secondary/30 rounded-xl overflow-hidden border border-border flex items-center justify-center">
                    {listing.imageUrl ? (
                        <Image src={listing.imageUrl} alt={listing.title} fill className="object-cover" priority />
                    ) : (
                        <Tag className="w-20 h-20 text-muted-foreground/30" />
                    )}
                    {listing.category === "JOURNEY" && (
                        <div className="absolute top-4 left-4 bg-emerald-500/90 text-white backdrop-blur-md px-3 py-1.5 rounded-md border border-emerald-400 flex items-center gap-2 shadow-lg">
                            <span className="text-xs uppercase font-bold tracking-widest">Verified Journey</span>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="flex flex-col">
                    <div className="mb-2">
                        <span className="text-xs font-semibold uppercase tracking-widest text-primary/80 bg-primary/10 px-2.5 py-1 rounded-full">
                            {listing.category}
                        </span>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-4 mb-2">{listing.title}</h1>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-5 h-5 ${star <= Math.round(averageRating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                            ))}
                            <span className="ml-2 text-sm font-medium">{averageRating.toFixed(1)}</span>
                            <span className="ml-1 text-sm text-muted-foreground">({listing.reviews?.length || 0} reviews)</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 py-4 border-y border-border/50 mb-6">
                        <Avatar className="w-10 h-10 border border-border">
                            <AvatarImage src={listing.seller?.image || ""} />
                            <AvatarFallback className="bg-muted"><User className="w-5 h-5" /></AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Seller</p>
                            <p className="text-sm font-medium">{listing.seller?.name || 'Anonymous'}</p>
                        </div>
                    </div>

                    <div className="mt-auto bg-secondary/20 p-6 rounded-xl border border-border/50">
                        <div className="flex items-end gap-2 mb-4">
                            <Coins className="w-8 h-8 text-amber-500 mb-1" />
                            <span className="text-4xl font-black text-amber-500 tracking-tight">{listing.price}</span>
                            <span className="text-sm font-medium text-muted-foreground mb-2">ACT Currency</span>
                        </div>

                        {isOwner ? (
                            <Button className="w-full h-12 text-lg font-semibold" disabled>
                                You own this listing
                            </Button>
                        ) : (
                            <Button 
                                className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all active:scale-[0.98]"
                                onClick={handlePurchase}
                                disabled={isPending || currentUser.actCurrency < listing.price}
                            >
                                {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                {currentUser.actCurrency < listing.price ? 'Insufficient ACT Currency' : 'Buy Now'}
                            </Button>
                        )}
                        {!isOwner && currentUser.actCurrency < listing.price && (
                            <p className="text-xs text-destructive mt-2 text-center font-medium">You need {listing.price - currentUser.actCurrency} more ACT Currency to purchase.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Description & Reviews Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold tracking-tight mb-4">Product Description</h2>
                        <div className="prose prose-sm dark:prose-invert max-w-none bg-card p-6 rounded-xl border border-border whitespace-pre-wrap leading-relaxed">
                            {listing.description}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold tracking-tight border-b border-border pb-2">Customer Reviews</h2>
                        
                        {listing.reviews && listing.reviews.length > 0 ? (
                            <div className="space-y-4">
                                {listing.reviews.map((review: any) => (
                                    <div key={review.id} className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={review.user?.image || ""} />
                                                    <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-semibold">{review.user?.name || 'Anonymous'}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star key={star} className={`w-4 h-4 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground/90">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-secondary/20 p-8 rounded-xl border border-dashed border-border text-center">
                                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                            </div>
                        )}
                    </section>
                </div>

                <div className="lg:col-span-1">
                    <section className="bg-card p-6 rounded-xl border border-border sticky top-24 shadow-sm">
                        <h3 className="text-lg font-bold mb-4">Write a Review</h3>
                        {!isOwner ? (
                            hasReviewed ? (
                                <div className="text-center p-4 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20">
                                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-sm font-semibold">You've already reviewed this product.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleReviewSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Rating</label>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                    onClick={() => setRating(star)}
                                                >
                                                    <Star className={`w-8 h-8 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30 hover:text-yellow-500/50"}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Comment</label>
                                        <Textarea 
                                            placeholder="What did you think of this product?" 
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                            rows={4}
                                            className="resize-none"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isReviewing || comment.trim() === ""}>
                                        {isReviewing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Review"}
                                    </Button>
                                </form>
                            )
                        ) : (
                            <div className="text-center p-4 bg-secondary/50 rounded-lg text-sm text-muted-foreground">
                                You cannot review your own listing.
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

// Added this icon as it was missing from imports
function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
