import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { CheckSquare, Flame, Trophy, Coins, Target, Shield, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            {/* Nav */}
            <nav className="flex items-center justify-between p-6 max-w-6xl mx-auto animate-slide-up">
                <div className="relative w-32 h-8">
                    <Image
                        src="/actify-logo.png"
                        alt="ACTIFY"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </div>
                <div className="flex gap-4">
                    <SignedOut>
                        <Link href="/sign-in">
                            <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button>Get Started <ArrowRight className="w-4 h-4 ml-2" /></Button>
                        </Link>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/dashboard">
                            <Button>Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" /></Button>
                        </Link>
                    </SignedIn>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 animate-slide-up stagger-1">
                    <Shield className="w-4 h-4" />
                    <span>The Execution Operating System</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-slide-up stagger-2 leading-tight">
                    Stop Planning.<br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent animate-gradient">Start Executing.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up stagger-3">
                    ACTIFY is not a to-do list. It is an execution protocol that enforces your goals through mandatory daily tasks, permanent records, and a ruthless accountability system.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-4">
                    <SignedOut>
                        <Link href="/sign-up">
                            <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto shadow-lg shadow-primary/20">
                                Initialize Protocol
                            </Button>
                        </Link>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/dashboard">
                            <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto shadow-lg shadow-primary/20">
                                Go to Dashboard
                            </Button>
                        </Link>
                    </SignedIn>
                    <Link href="#features">
                        <Button variant="outline" size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">
                            View System Specs
                        </Button>
                    </Link>
                </div>

                {/* Dashboard Preview Graphic */}
                <div className="mt-20 relative mx-auto max-w-5xl animate-slide-up stagger-5">
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 h-full w-full" />
                    <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-2 overflow-hidden shadow-2xl relative">
                        {/* Mock Dashboard UI */}
                        <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-background rounded-xl border border-border overflow-hidden flex flex-col">
                            <div className="h-12 border-b border-border flex items-center px-4 gap-4 bg-card/50">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-destructive/80" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                </div>
                                <div className="h-6 flex-1 bg-muted/30 rounded-md max-w-sm mx-auto" />
                            </div>
                            <div className="flex-1 p-6 flex gap-6">
                                <div className="w-48 hidden md:flex flex-col gap-3">
                                    <div className="h-8 bg-primary/20 rounded-md w-full" />
                                    <div className="h-8 bg-muted/30 rounded-md w-full" />
                                    <div className="h-8 bg-muted/30 rounded-md w-full" />
                                </div>
                                <div className="flex-1 flex flex-col gap-6">
                                    <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl border border-primary/20" />
                                    <div className="flex gap-4">
                                        <div className="flex-1 h-24 bg-card border border-border rounded-xl" />
                                        <div className="flex-1 h-24 bg-card border border-border rounded-xl" />
                                        <div className="flex-1 h-24 bg-card border border-border rounded-xl hidden sm:block" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="py-24 bg-secondary/30 border-t border-border">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">The Protocol Architecture</h2>
                        <p className="text-muted-foreground">Everything you need to force execution.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Target, title: "Daily Enforcement", desc: "Missing a day records a permanent failure on your profile. No pauses. No excuses." },
                            { icon: Trophy, title: "Reputation Economy", desc: "Earn ACT Points for successful execution. Climb the global leaderboard." },
                            { icon: Coins, title: "ACT Currency", desc: "Spend earned currency on power-ups, resources, and verified marketplace items." }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-card border border-border card-hover">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Footer */}
            <footer className="py-10 border-t border-border text-center text-muted-foreground text-sm">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Image
                        src="/actify-logo.png"
                        alt="ACTIFY"
                        width={80}
                        height={20}
                        className="object-contain"
                        style={{ opacity: 0.5 }}
                    />
                </div>
                <p>© {new Date().getFullYear()} ACTIFY Execution OS. All rights reserved.</p>
            </footer>
        </div>
    );
}
