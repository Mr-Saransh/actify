"use client";

import { useTransition } from "react";
import { purchaseItem } from "@/app/actions/store";
import { STORE_ITEMS, StoreItem } from "@/lib/store-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Loader2, Sparkles, AlertCircle } from "lucide-react";

export default function StorePage() {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handlePurchase = (item: StoreItem) => {
        if (item.action === "NONE") {
            toast({
                title: "Coming Soon",
                description: "Physical merchandise is currently out of stock.",
            });
            return;
        }

        startTransition(async () => {
            const result = await purchaseItem(item.id);

            if (result.success) {
                toast({
                    title: "Purchase Successful",
                    description: result.message,
                    className: "border-green-500 text-green-500"
                });
            } else {
                toast({
                    title: "Transaction Failed",
                    description: result.message,
                    className: "border-destructive text-destructive"
                });
            }
        });
    };

    const powerUps = STORE_ITEMS.filter(i => i.type === "POWERUP");
    const merch = STORE_ITEMS.filter(i => i.type === "MERCH");

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Actify Supply Depot</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Exchange your hard-earned ACT Currency for system overrides and exclusive gear.
                    Resources deployed immediately upon transaction confirmation.
                </p>
            </div>

            {/* POWER UP SECTION */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <h2 className="text-xl font-bold tracking-widest uppercase">System Power-Ups</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {powerUps.map(item => (
                        <Card key={item.id} className="border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors relative overflow-hidden group flex flex-col">
                            {item.id === "beyond_01" && (
                                <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
                                    Best Seller
                                </div>
                            )}
                            <CardHeader className="flex-grow">
                                <div className="w-full h-48 mb-4 rounded-md overflow-hidden bg-muted/20 flex items-center justify-center p-4">
                                    <img
                                        src={item.icon}
                                        alt={item.name}
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <CardTitle>{item.name}</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold font-mono text-purple-400">
                                    {item.cost} <span className="text-sm text-muted-foreground">ACT</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={() => handlePurchase(item)}
                                    disabled={isPending}
                                >
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Purchase Authorization"}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

            {/* MERCH SECTION */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-blue-500" />
                    <h2 className="text-xl font-bold tracking-widest uppercase">Physical Assets</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {merch.map(item => (
                        <Card key={item.id} className="opacity-75 hover:opacity-100 transition-opacity flex flex-col">
                            <CardHeader className="flex-grow">
                                <div className="w-full h-48 mb-4 rounded-md overflow-hidden bg-muted/20 flex items-center justify-center">
                                    <img
                                        src={item.icon}
                                        alt={item.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <CardTitle>{item.name}</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold font-mono text-blue-400">
                                    {item.cost} <span className="text-sm text-muted-foreground">ACT</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="secondary" className="w-full" onClick={() => handlePurchase(item)}>
                                    Check Availability
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
