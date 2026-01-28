"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Paintbrush } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeSwitcher() {
    const { setTheme, theme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 border-border bg-background hover:bg-accent text-muted-foreground">
                    {theme === 'beautiful' ? <Paintbrush className="h-4 w-4 text-pink-500" /> :
                        theme === 'light-focus' ? <Sun className="h-4 w-4" /> :
                            theme === 'minimal' ? <Monitor className="h-4 w-4" /> :
                                <Moon className="h-4 w-4" />
                    }
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
                <DropdownMenuItem onClick={() => setTheme("dark")} className="hover:bg-accent focus:bg-accent cursor-pointer">
                    <Moon className="mr-2 h-3.5 w-3.5" /> Dark Modern (Default)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("light-focus")} className="hover:bg-accent focus:bg-accent cursor-pointer">
                    <Sun className="mr-2 h-3.5 w-3.5" /> Light Focus
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("minimal")} className="hover:bg-accent focus:bg-accent cursor-pointer">
                    <Monitor className="mr-2 h-3.5 w-3.5" /> Minimal Tech
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("beautiful")} className="hover:bg-accent focus:bg-accent cursor-pointer">
                    <Paintbrush className="mr-2 h-3.5 w-3.5 text-pink-400" /> Beautiful
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
