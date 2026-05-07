import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { TopBar } from "@/components/TopBar";
import { supabase } from "@/integrations/supabase/client";
import {
  Hash, AlertTriangle, Building2, Tag, Languages, Loader2, Plus, Inbox,
} from "lucide-react";

type Complaint = {
  id: string;
  tracking_id: string;
  text: string;
  image_url: string | null;
  language_label: string;
  category: string;
  priority: string;
  department: string;
  summary: string;
  status: string;
  created_at: string;
};

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Complaints — JanSeva AI" },
      { name: "description", content: "Track the status of your filed civic grievances." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { isAuthed, user, loading: authLoading } = useApp();
  const navigate = useNavigate();
  const [items, setItems] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthed) navigate({ to: "/login" });
  }, [isAuthed, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setItems((data as Complaint[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="min-h-screen">
      <TopBar showLogout />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold">Your complaints</h1>
            <p className="mt-1 text-sm text-muted-foreground">All grievances you've submitted</p>
          </div>
          <Link
            to="/app"
            className="h-10 px-4 rounded-xl bg-gradient-primary text-primary-foreground font-semibold flex items-center gap-2 shadow-glow text-sm"
          >
            <Plus className="h-4 w-4" /> New
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-card rounded-3xl shadow-soft border border-border p-10 text-center">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-secondary grid place-items-center">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="mt-4 font-display font-semibold text-lg">No complaints yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">File your first grievance to see it here.</p>
            <Link
              to="/app"
              className="mt-5 inline-flex h-11 px-5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold items-center gap-2 shadow-glow"
            >
              <Plus className="h-4 w-4" /> File a complaint
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((c) => (
              <div key={c.id} className="bg-card rounded-2xl shadow-soft border border-border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Hash className="h-3 w-3" /> {c.tracking_id}
                    </div>
                    <p className="mt-1 font-medium leading-snug">{c.summary}</p>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ring-1 ${priorityStyles(c.priority)}`}>
                    {c.priority === "High" && <AlertTriangle className="h-3 w-3 inline -mt-0.5 mr-1" />}
                    {c.priority}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary">
                    <Tag className="h-3 w-3" /> {c.category}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary">
                    <Building2 className="h-3 w-3" /> {c.department}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary">
                    <Languages className="h-3 w-3" /> {c.language_label}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent text-accent-foreground capitalize">
                    {c.status}
                  </span>
                  <span className="ml-auto">{new Date(c.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function priorityStyles(p: string) {
  if (p === "High") return "bg-destructive/10 text-destructive ring-destructive/30";
  if (p === "Medium") return "bg-warning/15 text-foreground ring-warning/40";
  return "bg-accent text-accent-foreground ring-india-green/30";
}
