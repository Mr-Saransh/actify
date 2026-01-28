
import { AlertCircle, Lock } from "lucide-react";

export function SystemRules() {
    return (
        <div className="border-t border-border mt-12 py-8">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                <Lock className="h-3 w-3" /> System Parameters (Immutable)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity">
                <div className="space-y-2">
                    <p className="text-xs text-destructive font-bold uppercase flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Zero Tolerance
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                        Failure to confirm execution by midnight results in immediate probability decay. No appeals. No retro-active logging.
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="text-xs text-destructive font-bold uppercase flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Integrity Check
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                        Proof submission requires timestamp validation. Masking or falsifying data will result in permanent protocol termination.
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="text-xs text-destructive font-bold uppercase flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Momentum Law
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                        Skipping 2 consecutive days triggers "Critical Risk" status. Access to higher functions will be restricted until consistency is restored.
                    </p>
                </div>
            </div>
        </div>
    );
}
