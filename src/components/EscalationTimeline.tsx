import { Clock, ArrowUp, Building2, Crown, CheckCircle2 } from "lucide-react";

interface Props {
  createdAt: string | Date;
  status?: string;
}

const STAGES = [
  { hours: 0, name: "Filed & Routed", office: "Department Desk", icon: CheckCircle2 },
  { hours: 24, name: "Ward Officer", office: "Ward-Level Escalation", icon: ArrowUp },
  { hours: 48, name: "Zone Office", office: "Zonal Escalation", icon: Building2 },
  { hours: 72, name: "Commissioner", office: "City/State Escalation", icon: Crown },
];

export function EscalationTimeline({ createdAt, status }: Props) {
  const created = new Date(createdAt).getTime();
  const ageHrs = Math.max(0, (Date.now() - created) / 3_600_000);
  const isResolved = status === "resolved";
  const currentStage = isResolved ? STAGES.length :
    STAGES.reduce((acc, s, i) => (ageHrs >= s.hours ? i : acc), 0);

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-primary" />
        <div className="font-display font-semibold text-sm">Escalation Timeline</div>
        <div className="ml-auto text-xs text-muted-foreground">
          {ageHrs < 1 ? "Just filed" : `${Math.floor(ageHrs)}h elapsed`}
        </div>
      </div>
      <ol className="relative ml-2 space-y-3 border-l border-border pl-5">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const reached = i <= currentStage;
          const active = !isResolved && i === currentStage;
          return (
            <li key={i} className="relative">
              <span
                className={`absolute -left-[27px] top-0.5 h-5 w-5 rounded-full grid place-items-center border-2 ${
                  reached ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground"
                } ${active ? "ring-4 ring-primary/20 animate-pulse" : ""}`}
              >
                <Icon className="h-2.5 w-2.5" />
              </span>
              <div className={`text-sm font-semibold ${reached ? "" : "text-muted-foreground"}`}>{s.name}</div>
              <div className="text-xs text-muted-foreground">
                {s.office} · {s.hours === 0 ? "immediate" : `+${s.hours}h`}
                {active && " · pending"}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
