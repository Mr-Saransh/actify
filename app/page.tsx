"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Flag, Target, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="text-center space-y-8 max-w-2xl">
          {/* Logo with Badge */}
          <div className="relative w-64 md:w-96 h-20 md:h-28 mx-auto mb-4">
            <Image
              src="/actify-logo.png"
              alt="ACTIFY"
              fill
              className="object-contain"
              priority
            />
            <span className="absolute -top-4 -right-8 md:-right-12 text-[10px] font-mono font-bold text-red-500 border border-red-500 px-1 rounded animate-pulse">
              SYSTEM ARMED
            </span>
          </div>

          {/* Tagline */}
          <div className="space-y-4 font-mono text-sm md:text-base text-zinc-400">
            <p className="text-lg md:text-xl text-white font-bold tracking-wider">
              EXECUTION, ENFORCED.
            </p>
            <p>PLANNING IS CHEAP. EXECUTION IS SCARCE.</p>
            <p>
              ACTIFY converts vague goals into mandatory daily protocols.
              <br className="hidden md:block" />
              No skipping. No excuses. Real enforcement.
            </p>
          </div>

          {/* CTA */}
          <div className="pt-8">
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-4">
              Warning: Execution enforced. Failures permanently recorded.
            </p>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-zinc-200 uppercase tracking-widest font-bold px-8 py-6 text-lg rounded-none border-2 border-transparent hover:border-zinc-500 transition-all"
              >
                Enter System
              </Button>
            </Link>
            <p className="text-[10px] text-zinc-600 font-mono uppercase mt-4">
              Initiating entry triggers enforcement protocols
            </p>
          </div>

          {/* Scroll hint */}
          <button
            onClick={() => document.getElementById('protocol')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1 mx-auto mt-8 uppercase tracking-widest font-mono"
          >
            View Protocol <span className="animate-bounce">↓</span>
          </button>
        </div>
      </main>

      {/* Protocol Steps */}
      <section id="protocol" className="border-t border-zinc-900 bg-zinc-950 py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 font-mono uppercase tracking-widest text-red-500">
            System Protocol
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Step 01 */}
            <div className="bg-black border border-zinc-900 p-6 md:p-8 hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-zinc-500 font-mono text-xs">01</span>
                <Flag className="w-5 h-5 text-zinc-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 uppercase tracking-wide">Target Locked</h3>
              <p className="text-zinc-500 text-sm font-mono">
                Set goal with deadline. System initializes enforcement sequence.
              </p>
            </div>

            {/* Step 02 */}
            <div className="bg-black border border-zinc-900 p-6 md:p-8 hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-zinc-500 font-mono text-xs">02</span>
                <Target className="w-5 h-5 text-zinc-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 uppercase tracking-wide">Daily Execution Required</h3>
              <p className="text-zinc-500 text-sm font-mono">
                Mandatory daily tasks assigned. Skipping prohibited.
              </p>
            </div>

            {/* Step 03 */}
            <div className="bg-black border border-zinc-900 p-6 md:p-8 hover:border-red-900/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-red-900/50 font-mono text-xs">03</span>
                <ShieldCheck className="w-5 h-5 text-red-900/50" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 uppercase tracking-wide">Failure Logged</h3>
              <p className="text-zinc-500 text-sm font-mono">
                All violations recorded. Consequences automatic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System Specs */}
      <section className="border-t border-zinc-900 py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 font-mono uppercase tracking-widest">
            System Specifications
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Features List */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-mono text-sm uppercase tracking-wider mb-1">Not a habit tracker</p>
                  <p className="text-xs text-zinc-600">Habit trackers fail. This enforces.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-mono text-sm uppercase tracking-wider mb-1">Not motivational quotes</p>
                  <p className="text-xs text-zinc-600">Motivation fades. Enforcement remains.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-mono text-sm uppercase tracking-wider mb-1">System-enforced execution</p>
                  <p className="text-xs text-zinc-600">Automated consequences. No negotiation.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-mono text-sm uppercase tracking-wider mb-1">Real accountability</p>
                  <p className="text-xs text-zinc-600">Public leaderboard. Permanent record.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 border border-red-900 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-mono text-sm uppercase tracking-wider mb-1 text-red-900">Progress with consequences</p>
                  <p className="text-xs text-zinc-600">Every action tracked. Every failure penalized.</p>
                </div>
              </div>
            </div>

            {/* System Preview */}
            <div className="bg-zinc-950 border border-zinc-900 rounded aspect-video flex items-center justify-center">
              <p className="text-zinc-700 font-mono text-xs uppercase tracking-widest">
                System Interface Preview
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-zinc-900 bg-zinc-950 py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-mono uppercase tracking-wide">
            Ready to Execute?
          </h2>
          <p className="text-zinc-500 text-sm md:text-base font-mono">
            Not just plan. Not just dream. Execute.
          </p>

          <div className="pt-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-zinc-200 uppercase tracking-widest font-bold px-8 py-6 text-lg rounded-none border-2 border-transparent hover:border-zinc-500 transition-all"
              >
                Initialize System
              </Button>
            </Link>
          </div>

          <div className="pt-8 space-y-1 text-xs text-zinc-700 font-mono uppercase tracking-wider">
            <p>Designed to eliminate procrastination</p>
            <p>Built for serious execution</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[10px] text-zinc-800 font-mono uppercase tracking-widest">
            System_Status: Active // Monitoring_Network // © 2026 ACTIFY
          </p>
        </div>
      </footer>
    </div>
  );
}
