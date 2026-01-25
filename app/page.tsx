
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <main className="text-center space-y-8 max-w-2xl">
        <div className="relative w-96 h-28 mx-auto mb-4">
          <Image
            src="/logo.png"
            alt="ACTIFY"
            fill
            className="object-contain"
            priority
          />
          <span className="absolute -top-4 -right-12 text-[10px] font-mono font-bold text-red-500 border border-red-500 px-1 rounded animate-pulse">SYSTEM ARMED</span>
        </div>

        <div className="space-y-4 font-mono text-sm md:text-base text-zinc-400">
          <p>
            PLANNING IS CHEAP. EXECUTION IS SCARCE.
          </p>
          <p>
            ACTIFY converts vague goals into mandatory daily protocols.
            <br />
            No skipping. No excuses. Real enforcement.
          </p>
        </div>

        <div className="pt-8">
          <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-4">
            Warning: Execution enforced. Failures permanently recorded.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-black hover:bg-zinc-200 uppercase tracking-widest font-bold px-8 py-6 text-lg rounded-none border-2 border-transparent hover:border-zinc-500 transition-all">
              Enter System
            </Button>
          </Link>
          <p className="text-[10px] text-zinc-600 font-mono uppercase mt-4">
            Initiating entry triggers enforcement protocols
          </p>
        </div>

        <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-zinc-600 uppercase tracking-widest font-bold">
          <div>
            <span className="block text-zinc-500 mb-1">01</span>
            Target Locked
          </div>
          <div>
            <span className="block text-zinc-500 mb-1">02</span>
            Daily Execution Required
          </div>
          <div>
            <span className="block text-red-900/50 mb-1">03</span>
            Failure Logged
          </div>
        </div>
      </main>

      <footer className="absolute bottom-8 text-[10px] text-zinc-800 font-mono uppercase tracking-widest">
        System_Status: Active // Monitoring_Network
      </footer>
    </div>
  );
}
