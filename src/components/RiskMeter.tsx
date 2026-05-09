import { Gauge } from "lucide-react";

interface Props {
  score: number; // 0-100
  label?: string;
  citizensAffected?: number | null;
}

export function RiskMeter({ score, label, citizensAffected }: Props) {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  const color =
    s >= 80 ? "var(--destructive)" :
    s >= 60 ? "var(--warning)" :
    s >= 35 ? "var(--saffron)" :
    "var(--india-green)";
  const tier =
    s >= 80 ? "Critical" :
    s >= 60 ? "High" :
    s >= 35 ? "Moderate" : "Low";

  return (
    <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl grid place-items-center" style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}>
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display font-semibold">Civic Risk Score</div>
            <div className="text-xs text-muted-foreground">AI-calculated public safety index</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-display font-bold tabular-nums" style={{ color }}>{s}</div>
          <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color }}>{tier}</div>
        </div>
      </div>

      <div className="h-3 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${s}%`,
            background: `linear-gradient(90deg, var(--india-green), var(--saffron) 50%, var(--destructive))`,
          }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {label && <span>{label}</span>}
        {citizensAffected != null && (
          <span><strong className="text-foreground">{citizensAffected.toLocaleString()}+</strong> citizens potentially affected</span>
        )}
      </div>
    </div>
  );
}
