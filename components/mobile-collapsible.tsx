"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileCollapsibleProps {
    title: string;
    children: React.ReactNode;
    defaultCollapsed?: boolean;
}

export function MobileCollapsible({ title, children, defaultCollapsed = true }: MobileCollapsibleProps) {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    return (
        <div className="md:contents">
            {/* Mobile Collapse Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="md:hidden flex items-center justify-between w-full py-2 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-900 mb-2"
            >
                <span>{title}</span>
                {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>

            {/* Desktop Title (Always visible) */}
            <h4 className="hidden md:block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">{title}</h4>

            {/* Content */}
            <div className={`${isCollapsed ? 'hidden md:block' : 'block'}`}>
                {children}
            </div>
        </div>
    );
}
