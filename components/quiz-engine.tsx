"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface QuizEngineProps {
    proofId: string;
}

export function QuizEngine({ proofId }: QuizEngineProps) {
    const router = useRouter();
    const { toast } = useToast();
    
    const [status, setStatus] = useState<"READY" | "LOADING" | "ACTIVE" | "SUBMITTING" | "DONE">("READY");
    const [questions, setQuestions] = useState<any[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [answers, setAnswers] = useState<{ id: number, answer: string }[]>([]);
    const [result, setResult] = useState<{ passed: boolean, score: number, message?: string } | null>(null);
    
    const containerRef = useRef<HTMLDivElement>(null);

    // Enter Fullscreen & Start
    const startQuiz = async () => {
        try {
            if (containerRef.current?.requestFullscreen) {
                await containerRef.current.requestFullscreen();
            }
            setStatus("LOADING");
            
            const res = await fetch("/api/quiz/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ proofId })
            });
            
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            setQuestions(data.questions);
            setToken(data.token);
            setStatus("ACTIVE");
        } catch (error: any) {
            toast({ title: "Failed to start quiz", description: error.message, className: "bg-destructive text-destructive-foreground border-destructive" });
            setStatus("READY");
        }
    };

    // Anti-Cheat: Visibility Change (Tab Switch)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (status === "ACTIVE" && document.hidden) {
                // Instantly fail the user
                await submitQuiz(true);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [status]);

    // Anti-Cheat: Prevent Context Menu & Copy
    const preventAction = (e: any) => e.preventDefault();

    const submitQuiz = async (isAntiCheatFail = false) => {
        setStatus("SUBMITTING");
        try {
            const res = await fetch("/api/quiz/grade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    proofId,
                    userAnswers: answers,
                    token,
                    isAntiCheatFail
                })
            });
            
            const data = await res.json();
            setResult({ passed: data.passed, score: data.score, message: data.message });
            setStatus("DONE");
            
            // Exit fullscreen if possible
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(console.error);
            }
        } catch (error: any) {
            toast({ title: "Submission failed", description: error.message, className: "bg-destructive text-destructive-foreground border-destructive" });
            setStatus("ACTIVE");
        }
    };

    const selectOption = (qId: number, option: string) => {
        setAnswers(prev => {
            const existing = prev.find(a => a.id === qId);
            if (existing) {
                return prev.map(a => a.id === qId ? { ...a, answer: option } : a);
            }
            return [...prev, { id: qId, answer: option }];
        });
    };

    if (status === "DONE" && result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6">
                <div className="max-w-md w-full p-8 rounded-xl border border-border bg-card text-center space-y-6">
                    {result.passed ? (
                        <>
                            <div className="inline-flex w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground">Quiz Passed!</h2>
                        </>
                    ) : (
                        <>
                            <div className="inline-flex w-16 h-16 rounded-full bg-destructive/10 text-destructive items-center justify-center mx-auto">
                                <ShieldAlert className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground">Quiz Failed</h2>
                        </>
                    )}
                    <p className="text-xl font-mono">Score: {result.score}%</p>
                    {result.message && <p className="text-muted-foreground">{result.message}</p>}
                    
                    <Button className="w-full" onClick={() => router.push("/dashboard")}>
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div 
            ref={containerRef} 
            className="min-h-screen bg-background text-foreground flex flex-col"
            onContextMenu={preventAction}
            onCopy={preventAction}
            style={{ userSelect: "none" }}
        >
            {status === "READY" && (
                <div className="m-auto max-w-md text-center p-8 space-y-6">
                    <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
                    <h1 className="text-2xl font-bold">Anti-Cheat Quiz</h1>
                    <p className="text-muted-foreground">
                        This test will be conducted in Fullscreen Mode. 
                        Switching tabs, exiting fullscreen, or attempting to copy text will result in an immediate failure and point deduction.
                    </p>
                    <Button size="lg" className="w-full" onClick={startQuiz}>
                        Accept & Start
                    </Button>
                </div>
            )}

            {(status === "LOADING" || status === "SUBMITTING") && (
                <div className="m-auto flex flex-col items-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-xl font-bold uppercase tracking-widest animate-pulse">
                        {status === "LOADING" ? "Generating Questions..." : "Analyzing Answers..."}
                    </p>
                </div>
            )}

            {status === "ACTIVE" && (
                <div className="max-w-4xl mx-auto w-full p-6 md:p-12 overflow-y-auto space-y-12">
                    <div className="flex justify-between items-center border-b border-border pb-4 sticky top-0 bg-background z-10">
                        <h2 className="text-xl font-bold">Validation Protocol</h2>
                        <div className="text-sm font-mono bg-destructive/10 text-destructive px-3 py-1 rounded border border-destructive/20">
                            Strict Mode Active
                        </div>
                    </div>

                    <div className="space-y-12">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="space-y-4">
                                <h3 className="text-lg font-medium leading-relaxed">
                                    <span className="text-primary mr-2">{idx + 1}.</span> {q.text}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {q.options.map((opt: string, oIdx: number) => {
                                        const isSelected = answers.find(a => a.id === q.id)?.answer === opt;
                                        return (
                                            <button
                                                key={oIdx}
                                                onClick={() => selectOption(q.id, opt)}
                                                className={`p-4 text-left rounded-lg border-2 transition-all ${
                                                    isSelected 
                                                        ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.2)]' 
                                                        : 'border-border bg-secondary/30 hover:border-primary/50'
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-border flex justify-end">
                        <Button 
                            size="lg" 
                            disabled={answers.length < questions.length}
                            onClick={() => submitQuiz(false)}
                            className="w-full md:w-auto"
                        >
                            Submit Answers <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
