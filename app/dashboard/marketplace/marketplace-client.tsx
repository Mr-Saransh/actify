"use client";

import { useState, useTransition } from "react";
import { Store, Plus, Coins, Image as ImageIcon, CheckCircle, Tag, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createListing, purchaseListing, uploadImageToCloudinary } from "@/app/actions/marketplace";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MarketplaceClientProps {
    user: {
        id: string;
        actCurrency: number;
    };
    initialListings: any[];
}

export function MarketplaceClient({ user, initialListings }: MarketplaceClientProps) {
    const { toast } = useToast();
    const [listings, setListings] = useState(initialListings);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

    // Filter logic
    const filteredListings = initialListings.filter(l => categoryFilter === "ALL" || l.category === categoryFilter);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("RESOURCE");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateListing = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        let imageUrl = undefined;

        try {
            if (imageFile) {
                const formData = new FormData();
                formData.append("file", imageFile);
                const uploadResult = await uploadImageToCloudinary(formData);
                if (uploadResult.error) {
                    toast({ title: "Upload Failed", description: uploadResult.error, className: "bg-destructive text-destructive-foreground border-destructive" });
                    setIsUploading(false);
                    return;
                }
                imageUrl = uploadResult.url;
            }

            const result = await createListing({
                title,
                description,
                price: parseInt(price) || 0,
                category,
                imageUrl
            });

            if (result.success) {
                toast({ title: "Success", description: "Listing created successfully!" });
                setIsCreateOpen(false);
                // Reset form
                setTitle("");
                setDescription("");
                setPrice("");
                setCategory("RESOURCE");
                setImageFile(null);
                setImagePreview(null);
                // The page will revalidate and update automatically due to revalidatePath
            } else {
                toast({ title: "Error", description: result.message, className: "bg-destructive text-destructive-foreground border-destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong.", className: "bg-destructive text-destructive-foreground border-destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handlePurchase = (listingId: string) => {
        startTransition(async () => {
            const result = await purchaseListing(listingId);
            if (result.success) {
                toast({ title: "Purchase Successful", description: result.message });
            } else {
                toast({ title: "Purchase Failed", description: result.message, className: "bg-destructive text-destructive-foreground border-destructive" });
            }
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Store className="w-6 h-6 text-primary" />
                        Marketplace
                    </h1>
                    <p className="text-sm text-muted-foreground">Buy and sell execution journeys, resources, and templates.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full md:w-auto animate-scale-in">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Listing
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Marketplace Listing</DialogTitle>
                            <DialogDescription>
                                List your resource for others to purchase using ACT Currency.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateListing} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Category</label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                >
                                    <option value="RESOURCE">Resource</option>
                                    <option value="TEMPLATE">Template</option>
                                    <option value="PRODUCT">Physical Product</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Title</label>
                                <Input placeholder="e.g. Full-Stack Mastery Roadmap" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Description</label>
                                <Textarea placeholder="What will they learn? What's included?" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Price (ACT Currency)</label>
                                <div className="relative">
                                    <Coins className="absolute left-3 top-2.5 h-4 w-4 text-amber-500" />
                                    <Input type="number" min="0" placeholder="100" className="pl-9" value={price} onChange={(e) => setPrice(e.target.value)} required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cover Image (Optional)</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex-1 cursor-pointer">
                                        <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center hover:bg-secondary/50 transition-colors">
                                            <ImageIcon className="w-6 h-6 text-muted-foreground mb-2" />
                                            <span className="text-xs text-muted-foreground">Click to upload</span>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                    {imagePreview && (
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border shrink-0">
                                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isUploading}>
                                {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : 'Publish Listing'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-2 mb-4 hide-scrollbar">
                {["ALL", "JOURNEY", "RESOURCE", "TEMPLATE", "PRODUCT"].map(cat => (
                    <Button 
                        key={cat} 
                        variant={categoryFilter === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter(cat)}
                        className={`rounded-full ${categoryFilter === cat ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground border-border hover:text-foreground'}`}
                    >
                        {cat === "ALL" ? "All Items" : cat === "JOURNEY" ? "Verified Journeys" : cat === "RESOURCE" ? "Resources" : cat === "TEMPLATE" ? "Templates" : "Physical Products"}
                    </Button>
                ))}
            </div>

            {/* Listings Grid */}
            {filteredListings.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
                    <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold">No listings yet</h3>
                    <p className="text-muted-foreground text-sm">Be the first to list something in this category!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredListings.map((listing: any, index: number) => {
                        const isOwner = listing.sellerId === user.id;
                        
                        return (
                            <div key={listing.id} className="rounded-xl border border-border bg-card overflow-hidden card-hover flex flex-col animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                {/* Image Area */}
                                <div className="relative w-full h-40 bg-secondary/30 flex items-center justify-center overflow-hidden border-b border-border group cursor-pointer" onClick={() => listing.category === "JOURNEY" && listing.journeyData && alert(JSON.stringify(listing.journeyData, null, 2))}>
                                    {listing.imageUrl ? (
                                        <Image src={listing.imageUrl} alt={listing.title} fill className="object-cover transition-transform group-hover:scale-105 duration-500" />
                                    ) : (
                                        <Tag className="w-10 h-10 text-muted-foreground/30" />
                                    )}
                                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-border flex items-center gap-1.5">
                                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="text-xs font-bold">{listing.price}</span>
                                    </div>
                                    {listing.category === "JOURNEY" && (
                                        <div className="absolute top-2 left-2 bg-emerald-500/90 text-white backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-400 flex items-center gap-1.5">
                                            <span className="text-[10px] uppercase font-bold tracking-widest">Verified Journey</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Content */}
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-1">{listing.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{listing.description}</p>
                                    
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-6 h-6 border border-border">
                                                <AvatarImage src={listing.seller?.image || ""} />
                                                <AvatarFallback className="text-[10px] bg-muted"><User className="w-3 h-3" /></AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs font-medium text-muted-foreground truncate max-w-[100px]">
                                                {listing.seller?.name || 'Anonymous'}
                                            </span>
                                        </div>

                                        {isOwner ? (
                                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">Your Listing</span>
                                        ) : (
                                            <Button 
                                                size="sm" 
                                                variant="secondary" 
                                                className="h-8 hover:bg-primary hover:text-primary-foreground transition-colors"
                                                onClick={() => handlePurchase(listing.id)}
                                                disabled={isPending || user.actCurrency < listing.price}
                                            >
                                                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Buy Now'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
