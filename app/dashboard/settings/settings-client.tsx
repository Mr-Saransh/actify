"use client";

import { useTheme } from "next-themes";
import { Settings, Moon, Sun, Monitor, Palette, Bell, Shield, Activity, User, Laptop } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export function SettingsClient() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const themes = [
        { id: "dark", name: "Dark", icon: Moon, desc: "Default dark mode", preview: "bg-[#0d0d12] border-purple-500" },
        { id: "black", name: "Black", icon: Monitor, desc: "Pure AMOLED black", preview: "bg-black border-orange-500" },
        { id: "light", name: "Light", icon: Sun, desc: "Clean bright slate", preview: "bg-slate-50 border-blue-500" },
        { id: "modern", name: "Modern", icon: Laptop, desc: "Glass & gradients", preview: "bg-[#0c0720] border-indigo-400" },
        { id: "beautiful", name: "Beautiful", icon: Palette, desc: "Pink & lavender", preview: "bg-[#fdf4ff] border-pink-400" },
    ];

    if (!mounted) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Settings className="w-6 h-6 text-primary" />
                    System Settings
                </h1>
                <p className="text-sm text-muted-foreground">Manage your Execution OS preferences.</p>
            </div>

            {/* Account Settings */}
            <div className="space-y-4 animate-slide-up">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Account
                </h2>
                <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold">Authentication</h3>
                        <p className="text-sm text-muted-foreground">Manage your profile, email, and security settings via Clerk.</p>
                    </div>
                    <div className="transform scale-110 origin-right">
                        <UserButton />
                    </div>
                </div>
            </div>

            {/* Appearance Settings */}
            <div className="space-y-4 animate-slide-up stagger-1">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Appearance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`flex flex-col text-left rounded-xl border p-4 transition-all duration-200 card-hover ${
                                theme === t.id 
                                    ? 'border-primary ring-1 ring-primary bg-primary/5' 
                                    : 'border-border bg-card hover:border-primary/50'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 ${t.preview}`}>
                                    <t.icon className={`w-5 h-5 ${theme === t.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>
                                <div>
                                    <h3 className={`font-bold ${theme === t.id ? 'text-primary' : 'text-foreground'}`}>{t.name}</h3>
                                    <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                                </div>
                            </div>
                            {theme === t.id && (
                                <div className="mt-auto pt-2 w-full text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Active Theme</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* System Preferences (Mock) */}
            <div className="space-y-4 animate-slide-up stagger-2">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Preferences
                </h2>
                <div className="rounded-xl border border-border bg-card divide-y divide-border">
                    {[
                        { icon: Bell, title: "Push Notifications", desc: "Receive alerts for deadlines and task unlocks." },
                        { icon: Shield, title: "Strict Enforcement", desc: "Require photo proof instead of text links." },
                    ].map((item, i) => (
                        <div key={i} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                </div>
                            </div>
                            <div className="w-10 h-5 rounded-full bg-primary/20 relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-3 h-3 rounded-full bg-primary" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
