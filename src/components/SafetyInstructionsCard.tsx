import { ShieldAlert, ListChecks } from "lucide-react";

interface Props {
  instructions: string[];
  emergency?: boolean;
}

export function SafetyInstructionsCard({ instructions, emergency }: Props) {
  if (!instructions?.length) return null;
  return (
    <div
      className={`rounded-3xl border p-5 backdrop-blur-md ${
        emergency
          ? "bg-destructive/10 border-destructive/30"
          : "bg-warning/10 border-warning/40"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`h-9 w-9 rounded-xl grid place-items-center ${
            emergency ? "bg-destructive text-destructive-foreground" : "bg-warning text-foreground"
          }`}
        >
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <div className="font-display font-semibold">
            {emergency ? "Emergency — Stay Safe" : "What To Do Until Help Arrives"}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <ListChecks className="h-3 w-3" /> AI safety guidance
          </div>
        </div>
      </div>
      <ul className="space-y-2">
        {instructions.map((s, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
            <span
              className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
                emergency ? "bg-destructive" : "bg-warning"
              }`}
            />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
