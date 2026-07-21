"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

// ─── Mouse Follower ─────────────────────────────────────────────
export function MouseFollower() {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { damping: 25, stiffness: 200 });
    const springY = useSpring(y, { damping: 25, stiffness: 200 });

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            x.set(e.clientX);
            y.set(e.clientY);
        };
        window.addEventListener("mousemove", handler);
        return () => window.removeEventListener("mousemove", handler);
    }, [x, y]);

    return (
        <motion.div
            className="pointer-events-none fixed z-[9999] w-6 h-6 rounded-full mix-blend-difference hidden md:block"
            style={{
                x: springX,
                y: springY,
                translateX: "-50%",
                translateY: "-50%",
                background: "rgba(255, 122, 0, 0.4)",
                boxShadow: "0 0 40px 10px rgba(255, 122, 0, 0.15)",
            }}
        />
    );
}

// ─── Grid Background ────────────────────────────────────────────
export function GridBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                }}
            />
            <motion.div
                className="absolute inset-0 opacity-[0.015]"
                animate={{ backgroundPosition: ["0px 0px", "60px 60px"] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                }}
            />
        </div>
    );
}

// ─── Particles ──────────────────────────────────────────────────
export function Particles() {
    const [particles] = useState(() =>
        Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            duration: Math.random() * 10 + 15,
            delay: Math.random() * 5,
        }))
    );

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        background: p.id % 3 === 0 ? "rgba(255, 122, 0, 0.3)" : "rgba(255, 255, 255, 0.15)",
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0, 0.8, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

// ─── Section Reveal ─────────────────────────────────────────────
export function SectionReveal({
    children,
    className = "",
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay }}
        >
            {children}
        </motion.div>
    );
}

// ─── Magnetic Button ────────────────────────────────────────────
export function MagneticButton({
    children,
    className = "",
    href,
}: {
    children: React.ReactNode;
    className?: string;
    href?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { damping: 15, stiffness: 300 });
    const springY = useSpring(y, { damping: 15, stiffness: 300 });

    const handleMouse = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) * 0.15);
        y.set((e.clientY - centerY) * 0.15);
    };

    const reset = () => {
        x.set(0);
        y.set(0);
    };

    const Tag = href ? "a" : "div";

    return (
        <motion.div
            ref={ref}
            style={{ x: springX, y: springY }}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
        >
            <Tag href={href} className={className}>
                {children}
            </Tag>
        </motion.div>
    );
}

// ─── Counter ────────────────────────────────────────────────────
export function Counter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    let start = 0;
                    const duration = 2000;
                    const startTime = Date.now();
                    const step = () => {
                        const elapsed = Date.now() - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * target));
                        if (progress < 1) requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                }
            },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, hasAnimated]);

    return (
        <span ref={ref} className="tabular-nums">
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
}

// ─── Tilt Card ──────────────────────────────────────────────────
export function TiltCard({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springRotateX = useSpring(rotateX, { damping: 20, stiffness: 200 });
    const springRotateY = useSpring(rotateY, { damping: 20, stiffness: 200 });

    const handleMouse = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        rotateY.set(((e.clientX - centerX) / (rect.width / 2)) * 5);
        rotateX.set(-((e.clientY - centerY) / (rect.height / 2)) * 5);
    };

    const reset = () => {
        rotateX.set(0);
        rotateY.set(0);
    };

    return (
        <motion.div
            ref={ref}
            className={className}
            style={{
                rotateX: springRotateX,
                rotateY: springRotateY,
                transformPerspective: 800,
            }}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
        >
            {children}
        </motion.div>
    );
}

// ─── Typing Text ────────────────────────────────────────────────
export function TypingText({ text, className = "" }: { text: string; className?: string }) {
    const [displayed, setDisplayed] = useState("");
    const [hasStarted, setHasStarted] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted) {
                    setHasStarted(true);
                }
            },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [hasStarted]);

    useEffect(() => {
        if (!hasStarted) return;
        let i = 0;
        const interval = setInterval(() => {
            setDisplayed(text.slice(0, i + 1));
            i++;
            if (i >= text.length) clearInterval(interval);
        }, 50);
        return () => clearInterval(interval);
    }, [hasStarted, text]);

    return (
        <span ref={ref} className={className}>
            {displayed}
            {hasStarted && displayed.length < text.length && (
                <motion.span
                    className="inline-block w-[2px] h-[1em] bg-[#FF7A00] ml-[2px] align-middle"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                />
            )}
        </span>
    );
}

// ─── Glowing Border Card ────────────────────────────────────────
export function GlowCard({
    children,
    className = "",
    glowColor = "rgba(255, 122, 0, 0.15)",
}: {
    children: React.ReactNode;
    className?: string;
    glowColor?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={ref}
            className={`relative group ${className}`}
            onMouseMove={handleMouse}
        >
            <div
                className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 60%)`,
                }}
            />
            {children}
        </div>
    );
}

// ─── Staggered List ─────────────────────────────────────────────
export function StaggerReveal({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1 } },
            }}
        >
            {children}
        </motion.div>
    );
}

export const staggerChild = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

// ─── Marquee ────────────────────────────────────────────────────
export function Marquee({
    children,
    speed = 30,
    className = "",
}: {
    children: React.ReactNode;
    speed?: number;
    className?: string;
}) {
    return (
        <div className={`overflow-hidden ${className}`}>
            <motion.div
                className="flex gap-6 w-max"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
            >
                {children}
                {children}
            </motion.div>
        </div>
    );
}
