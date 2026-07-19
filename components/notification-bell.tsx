"use client";

import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNotifications, markNotificationsRead } from "@/app/actions/network";

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchNotifs = async () => {
            const res = await getNotifications();
            if (res.success && res.data) {
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.unreadCount);
            }
        };
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const handleOpen = async (open: boolean) => {
        if (open && unreadCount > 0) {
            setUnreadCount(0); // Optimistic clear
            await markNotificationsRead();
            
            // Mark visually read
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    return (
        <DropdownMenu onOpenChange={handleOpen}>
            <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground outline-none">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 border-border bg-card backdrop-blur-xl">
                <DropdownMenuLabel className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                            No notifications yet.
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <DropdownMenuItem key={notif.id} className={`p-3 focus:bg-secondary/50 cursor-default flex flex-col items-start gap-1 border-b border-border/30 last:border-0 ${!notif.read ? 'bg-primary/5' : ''}`}>
                                <span className="text-sm font-medium">{notif.content}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
