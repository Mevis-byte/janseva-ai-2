import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/app-context";
import { TopBar } from "@/components/TopBar";
import { CommandSkeleton } from "@/components/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, AlertTriangle, Siren, MapPin, Tag, Building2, Flame, TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/command")({
  head: () => ({ meta: [{ title: "Command Center — JanSeva AI" }] }),
  component: CommandPage,
});

type Row = {
  id: string; tracking_id: string; category: string; priority: string;
  risk_score: number; emergency: boolean; status: string; lat: number | null; lng: number | null;
  tags: string[]; created_at: string; department: string; title: string | null; summary: string;
};

function CommandPage() {
  const { isAuthed, user, loading: authLoading } = useApp();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isStaff, setIsStaff] = useState<boolean | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthed) navigate({ to: "/login" });
  }, [isAuthed, authLoading, navigate]);

  // Server-side role check via RLS-protected user_roles table.
  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["officer", "admin", "superadmin"])
      .then(({ data }) => setIsStaff((data?.length ?? 0) > 0));
  }, [user]);

  useEffect(() => {
    if (isStaff === false) navigate({ to: "/app" });
  }, [isStaff, navigate]);

  if (authLoading || isStaff === null) return <CommandSkeleton />;
  if (isStaff === false) return null;

  useEffect(() => {
    if (!user || !isStaff) return;
    setDataLoading(true);
    supabase.from("complaints").select("*").order("created_at", { ascending: false }).limit(500)
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setRows((data as Row[]) ?? []);
        setDataLoading(false);
      });
  }, [user, isStaff]);

  const stats = useMemo(() => {
    const total = rows.length;
    const emergencies = rows.filter((r) => r.emergency).length;
    const avgRisk = total ? Math.round(rows.reduce((a, r) => a + (r.risk_score ?? 0), 0) / total) : 0;
    const open = rows.filter((r) => r.status !== "resolved").length;
    return { total, emergencies, avgRisk, open };
  }, [rows]);

  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r) => m.set(r.category, (m.get(r.category) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const clusters = useMemo(() => {
    // Simple grid clustering by 0.01° (~1.1km) per category
    const m = new Map<string, { lat: number; lng: number; count: number; category: string; items: Row[] }>();
    rows.forEach((r) => {
      if (r.lat == null || r.lng == null) return;
      const key = `${r.category}|${r.lat.toFixed(2)}|${r.lng.toFixed(2)}`;
      const ex = m.get(key);
      if (ex) { ex.count += 1; ex.items.push(r); }
      else m.set(key, { lat: r.lat, lng: r.lng, count: 1, category: r.category, items: [r] });
    });
    return [...m.values()].filter((c) => c.count >= 2).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [rows]);

  const topTags = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r) => (r.tags || []).forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [rows]);

  return (
    <div className="min-h-screen">
      <TopBar showLogout />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Activity className="h-3 w-3" /> Live
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold">Command Center</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time civic intelligence dashboard</p>
          </div>
          <Link to="/app" className="h-10 px-4 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-glow grid place-items-center">New report</Link>
        </div>

        {dataLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-border bg-card/80 backdrop-blur p-4 space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-secondary animate-pulse" />
                  <div className="h-7 w-12 rounded bg-secondary animate-pulse" />
                  <div className="h-3 w-20 rounded bg-secondary animate-pulse" />
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-border bg-card/80 backdrop-blur p-5 space-y-3">
                <div className="h-5 w-40 rounded bg-secondary animate-pulse" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/60">
                    <div className="h-9 w-9 rounded-lg bg-secondary animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-32 rounded bg-secondary animate-pulse" />
                      <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
                    </div>
                    <div className="h-5 w-14 rounded bg-secondary animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="rounded-3xl border border-border bg-card/80 backdrop-blur p-5 space-y-3">
                <div className="h-5 w-40 rounded bg-secondary animate-pulse" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between">
                      <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
                      <div className="h-3 w-6 rounded bg-secondary animate-pulse" />
                    </div>
                    <div className="h-2 rounded-full bg-secondary animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Stat icon={<Activity />} label="Total complaints" value={stats.total} />
              <Stat icon={<Siren />} label="Emergencies" value={stats.emergencies} accent="destructive" />
              <Stat icon={<TrendingUp />} label="Avg risk score" value={stats.avgRisk} />
              <Stat icon={<AlertTriangle />} label="Open cases" value={stats.open} accent="warning" />
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-border bg-card/80 backdrop-blur p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-4 w-4 text-destructive" />
                  <h2 className="font-display font-semibold">Hotspot Clusters</h2>
                </div>
                {clusters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No clusters detected yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {clusters.map((c, i) => (
                      <li key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/60">
                        <div className="h-9 w-9 rounded-lg bg-destructive/15 text-destructive grid place-items-center font-bold text-sm">{c.count}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{c.category}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {c.lat.toFixed(2)}, {c.lng.toFixed(2)}
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-1 rounded bg-destructive/10 text-destructive">Hotspot</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-3xl border border-border bg-card/80 backdrop-blur p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h2 className="font-display font-semibold">Issues by Category</h2>
                </div>
                <div className="space-y-2">
                  {byCategory.map(([cat, n]) => {
                    const max = byCategory[0][1];
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">{cat}</span>
                          <span className="text-muted-foreground">{n}</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-gradient-primary" style={{ width: `${(n / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card/80 backdrop-blur p-5 lg:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-saffron" />
                  <h2 className="font-display font-semibold">Trending AI Tags</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topTags.length === 0 ? <p className="text-sm text-muted-foreground">No tags yet.</p> :
                    topTags.map(([tag, n]) => (
                      <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-md bg-secondary">
                        {tag} <span className="text-muted-foreground ml-1">{n}</span>
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: "destructive" | "warning" }) {
  const color = accent === "destructive" ? "text-destructive" : accent === "warning" ? "text-warning" : "text-primary";
  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur p-4">
      <div className={`h-8 w-8 rounded-lg grid place-items-center ${color} bg-current/10`}>{icon}</div>
      <div className="mt-2 text-2xl font-display font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
