"use client";

import { useState, useTransition } from "react";
import { Coins, Zap, Package, BookOpen, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { purchaseItem } from "@/app/actions/store";
import { StoreItem } from "@/lib/store-data";

interface StoreClientProps {
    actCurrency: number;
    powerUps: StoreItem[];
    merch: StoreItem[];
    resources: StoreItem[];
}

function StoreSection({ title, icon: Icon, items, onPurchase, isPending }: {
    title: string; icon: React.ElementType; items: StoreItem[]; onPurchase: (id: string) => void; isPending: boolean;
}) {
    return (
        <div className="space-y-4 animate-slide-up">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Icon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, i) => (
                    <div key={item.id} className="rounded-xl border border-border bg-card p-5 card-hover flex flex-col" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="mb-3">
                            <span className="text-3xl mb-2 block">{item.icon}</span>
                            <h3 className="font-bold text-base leading-tight mb-1">{item.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                            <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md border border-amber-500/20">
                                <Coins className="w-3.5 h-3.5" />
                                <span className="text-sm font-bold tabular-nums">{item.cost}</span>
                            </div>
                            <Button 
                                size="sm" 
                                onClick={() => onPurchase(item.id)}
                                disabled={isPending}
                                className="h-8 transition-transform active:scale-95"
                            >
                                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Buy'}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function StoreClient({ actCurrency, powerUps, merch, resources }: StoreClientProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handlePurchase = (itemId: string) => {
        startTransition(async () => {
            const result = await purchaseItem(itemId);
            if (result.success) {
                toast({ title: "Purchase Successful", description: result.message });
            } else {
                toast({ title: "Purchase Failed", description: result.message, className: "bg-destructive text-destructive-foreground border-destructive" });
            }
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-5 rounded-2xl animate-slide-up">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1">ACT Store</h1>
                    <p className="text-sm text-muted-foreground">Exchange ACT Currency for power-ups, merch, and resources.</p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Balance</span>
                        <div className="flex items-center gap-1.5 text-amber-500">
                            <Coins className="w-5 h-5" />
                            <span className="text-2xl font-bold tabular-nums">{actCurrency.toLocaleString()}</span>
                        </div>
                    </div>
                    <Button variant="secondary" className="h-10 ml-2" onClick={() => toast({ title: "Coming Soon", description: "Purchasing ACT Currency with real money will be available soon." })}>
                        Buy Currency
                    </Button>
                </div>
            </div>

            {/* Store Sections */}
            <StoreSection 
                title="Power-Ups" 
                icon={Zap} 
                items={powerUps} 
                onPurchase={handlePurchase}
                isPending={isPending}
            />
            
            <StoreSection 
                title="Digital Resources" 
                icon={BookOpen} 
                items={resources} 
                onPurchase={handlePurchase}
                isPending={isPending}
            />
            
            <StoreSection 
                title="Merchandise" 
                icon={Package} 
                items={merch} 
                onPurchase={handlePurchase}
                isPending={isPending}
            />
        </div>
    );
}
