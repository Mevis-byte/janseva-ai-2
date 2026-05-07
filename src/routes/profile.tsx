import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { TopBar } from "@/components/TopBar";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Calendar, Shield, ArrowLeft, Loader2, Save } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — JanSeva AI" },
      { name: "description", content: "View and update your JanSeva AI profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isAuthed, loading } = useApp();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [complaintCount, setComplaintCount] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !isAuthed) navigate({ to: "/login" });
  }, [isAuthed, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setDisplayName(data?.display_name ?? (user.user_metadata?.full_name as string) ?? "");
        setAvatarUrl(data?.avatar_url ?? (user.user_metadata?.avatar_url as string) ?? "");
      });
    supabase
      .from("complaints")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => setComplaintCount(count ?? 0));
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSavedMsg(null);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, avatar_url: avatarUrl || null })
      .eq("user_id", user.id);
    setSaving(false);
    setSavedMsg(error ? `Error: ${error.message}` : "Profile saved");
    setTimeout(() => setSavedMsg(null), 3000);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <div className="grid place-items-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const initials = (displayName || user.email || "C")
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen">
      <TopBar showLogout />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
        <Link to="/app" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="bg-card rounded-3xl shadow-soft border border-border p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-semibold">
                {initials || "C"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-2xl truncate">{displayName || "Citizen"}</h1>
              <p className="text-sm text-muted-foreground truncate">{user.email || user.phone}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1.5 w-full h-11 px-4 rounded-xl bg-input border-0 text-base focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Avatar URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
                className="mt-1.5 w-full h-11 px-4 rounded-xl bg-input border-0 text-base focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-11 px-5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold flex items-center gap-2 shadow-glow disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </button>
            {savedMsg && <p className="text-xs text-india-green">{savedMsg}</p>}
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <InfoCard icon={<Mail className="h-4 w-4" />} label="Email" value={user.email || "—"} />
          <InfoCard icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phone || "—"} />
          <InfoCard
            icon={<Shield className="h-4 w-4" />}
            label="Complaints filed"
            value={complaintCount === null ? "…" : String(complaintCount)}
          />
          <InfoCard
            icon={<Calendar className="h-4 w-4" />}
            label="Member since"
            value={new Date(user.created_at).toLocaleDateString()}
          />
        </div>
      </main>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        {icon} {label}
      </div>
      <div className="mt-1 font-semibold truncate">{value}</div>
    </div>
  );
}
