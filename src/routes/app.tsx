import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/app-context";
import { translations } from "@/lib/i18n";
import { TopBar } from "@/components/TopBar";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { SafetyInstructionsCard } from "@/components/SafetyInstructionsCard";
import { classifyComplaint, type AIResult } from "@/lib/ai";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import {
  ImagePlus, Send, X, Sparkles, Loader2, Hash, Languages,
  Tag, AlertTriangle, Building2, FileText, Plus, MapPin, CheckCircle2,
  Clock, Activity, Gauge, Siren,
} from "lucide-react";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "File a Grievance — JanSeva AI" },
      { name: "description", content: "Submit civic complaints by voice or text in Kannada, Hindi, or English. AI auto-categorizes, routes, and gives safety guidance." },
    ],
  }),
  component: AppPage,
});

type Phase = "input" | "analyzing" | "result";

function AppPage() {
  const { lang, isAuthed, user, loading } = useApp();
  const t = translations[lang];
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("input");
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState<AIResult | null>(null);
  const submittingRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !isAuthed) navigate({ to: "/login" });
  }, [isAuthed, loading, navigate]);

  const steps = [t.detectLang, t.classifying, t.routing];

  const handleSubmit = async () => {
    if (!text.trim() || submittingRef.current) return;
    submittingRef.current = true;
    setPhase("analyzing");
    setStepIdx(0);

    // animate steps
    const stepTimers: number[] = [];
    stepTimers.push(window.setTimeout(() => setStepIdx(1), 700));
    stepTimers.push(window.setTimeout(() => setStepIdx(2), 1400));

    try {
      const r = await classifyComplaint(text, !!image);
      stepTimers.forEach(clearTimeout);
      setResult(r);
      setPhase("result");
      if (user) {
        const { error } = await supabase.from("complaints").insert({
          user_id: user.id,
          tracking_id: r.id,
          text,
          image_url: image,
          language: r.language,
          language_label: r.languageLabel,
          category: r.category,
          priority: r.priority,
          department: r.department,
          summary: r.summary,
        });
        if (error) console.error("Save complaint failed:", error);
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "AI classification failed");
      setPhase("input");
    } finally {
      submittingRef.current = false;
    }
  };

  const reset = () => {
    setText("");
    setImage(null);
    setResult(null);
    setPhase("input");
  };

  const onFile = (f: File | null) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleVoiceTranscript = (newText: string) => {
    setText((prev) => (prev ? prev.trim() + " " + newText : newText));
  };

  return (
    <div className="min-h-screen">
      <TopBar showLogout />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        {phase !== "result" && (
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-accent text-accent-foreground">
              <Sparkles className="h-3 w-3" /> AI-assisted submission
            </div>
            <h1 className="mt-4 text-3xl sm:text-5xl font-display font-bold leading-tight">
              {t.greeting}
            </h1>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">{t.greetingSub}</p>
          </div>
        )}

        {phase === "input" && (
          <>
            <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-soft border border-border p-3 sm:p-4 focus-within:shadow-glow transition-shadow">
              <div className="px-2 sm:px-3 pt-2">
                <VoiceRecorder lang={lang} onTranscript={handleVoiceTranscript} />
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t.placeholder}
                rows={4}
                className="mt-3 w-full resize-none bg-transparent border-0 outline-none text-base sm:text-lg p-3 sm:p-4 placeholder:text-muted-foreground"
                lang={lang}
              />
              {image && (
                <div className="px-3 sm:px-4 pb-3">
                  <div className="relative inline-block">
                    <img src={image} alt="Uploaded" className="h-28 w-auto rounded-xl object-cover border border-border" />
                    <button
                      onClick={() => setImage(null)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-foreground text-background grid place-items-center shadow-soft"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 px-2 sm:px-3 pb-2">
                <div className="flex items-center gap-1.5">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="h-10 px-3 rounded-xl hover:bg-secondary flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ImagePlus className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.upload}</span>
                  </button>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className="h-11 px-5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold flex items-center gap-2 shadow-glow disabled:opacity-50 disabled:shadow-none transition-transform active:scale-95"
                >
                  <span className="hidden sm:inline">{t.submit}</span>
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {phase === "analyzing" && (
          <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-soft border border-border p-8 sm:p-12">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
                  <Sparkles className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-primary/30 animate-ping" />
              </div>
            </div>
            <h2 className="text-center font-display font-semibold text-xl mb-8">{t.analyzing}</h2>
            <div className="space-y-3 max-w-sm mx-auto">
              {steps.map((s, i) => (
                <div
                  key={s}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    i < stepIdx ? "bg-accent/50" : i === stepIdx ? "bg-secondary" : "opacity-40"
                  }`}
                >
                  <div className="h-7 w-7 rounded-full grid place-items-center bg-card border border-border">
                    {i < stepIdx ? (
                      <CheckCircle2 className="h-4 w-4 text-india-green" />
                    ) : i === stepIdx ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <span className="text-xs">{i + 1}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === "result" && result && (
          <ResultView result={result} text={text} image={image} onNew={reset} t={t} />
        )}
      </main>
    </div>
  );
}

function priorityStyles(p: AIResult["priority"]) {
  if (p === "High") return "bg-destructive/10 text-destructive ring-destructive/30";
  if (p === "Medium") return "bg-warning/15 text-foreground ring-warning/40";
  return "bg-accent text-accent-foreground ring-india-green/30";
}

function ResultView({
  result, text, image, onNew, t,
}: { result: AIResult; text: string; image: string | null; onNew: () => void; t: (typeof translations)[keyof typeof translations] }) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-center gap-2">
        <div className="h-10 w-10 rounded-full bg-india-green/15 grid place-items-center">
          <CheckCircle2 className="h-5 w-5 text-india-green" />
        </div>
        <div>
          <div className="font-display font-semibold">{t.result}</div>
          <div className="text-xs text-muted-foreground">Submitted just now</div>
        </div>
      </div>

      {result.emergency && (
        <div className="rounded-2xl bg-destructive text-destructive-foreground px-4 py-3 flex items-center gap-3 animate-pulse">
          <Siren className="h-5 w-5" />
          <div className="text-sm font-semibold">Emergency complaint — escalated for immediate attention</div>
        </div>
      )}

      <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-soft border border-border overflow-hidden">
        <div className="bg-gradient-hero p-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Hash className="h-3 w-3" /> {t.complaintId}
            </div>
            <div className="font-display font-bold text-2xl mt-0.5">{result.id}</div>
            <div className="mt-2 font-semibold text-base sm:text-lg leading-snug">{result.title}</div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ring-1 whitespace-nowrap ${priorityStyles(result.priority)}`}>
            {result.priority === "High" && <AlertTriangle className="h-3 w-3 inline -mt-0.5 mr-1" />}
            {result.priority} {t.priority}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
          <Field icon={<Languages className="h-4 w-4" />} label={t.detectedLang} value={result.languageLabel} />
          <Field icon={<Tag className="h-4 w-4" />} label={t.category} value={result.category} />
          <Field icon={<Building2 className="h-4 w-4" />} label={t.department} value={result.department} />
          <Field icon={<MapPin className="h-4 w-4" />} label="Location" value={result.location || "Auto-detected (Bengaluru)"} muted={!result.location} />
          {result.timeline && (
            <Field icon={<Clock className="h-4 w-4" />} label="Timeline" value={result.timeline} />
          )}
          <Field icon={<Gauge className="h-4 w-4" />} label="AI Confidence" value={`${Math.round(result.confidence * 100)}%`} />
        </div>

        <div className="p-5 border-t border-border">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
            <FileText className="h-3 w-3" /> {t.summary}
          </div>
          <p className="text-sm leading-relaxed">{result.summary}</p>
          {result.impact && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Public impact: </strong>{result.impact}
            </p>
          )}
        </div>

        {image && (
          <div className="px-5 pb-5">
            <img src={image} alt="Evidence" className="rounded-2xl w-full max-h-64 object-cover border border-border" />
          </div>
        )}
      </div>

      <SafetyInstructionsCard instructions={result.safetyInstructions} emergency={result.emergency} />

      {result.nextSteps?.length > 0 && (
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display font-semibold">Next Steps by {result.department}</div>
              <div className="text-xs text-muted-foreground">Estimated response actions</div>
            </div>
          </div>
          <ul className="space-y-2">
            {result.nextSteps.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={onNew}
          className="flex-1 h-11 rounded-xl bg-gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-glow active:scale-[0.98] transition-transform"
        >
          <Plus className="h-4 w-4" /> {t.newComplaint}
        </button>
        <Link
          to="/track"
          className="flex-1 h-11 rounded-xl bg-card border border-border font-semibold hover:bg-accent transition-colors flex items-center justify-center"
        >
          {t.track}
        </Link>
      </div>

      <p className="text-[11px] text-center text-muted-foreground">
        Original input: <span className="italic">"{text.slice(0, 80)}{text.length > 80 ? "…" : ""}"</span>
      </p>
    </div>
  );
}

function Field({
  icon, label, value, muted,
}: { icon: React.ReactNode; label: string; value: string; muted?: boolean }) {
  return (
    <div className="p-5">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        {icon} {label}
      </div>
      <div className={`mt-1 font-semibold ${muted ? "text-muted-foreground font-normal text-sm" : ""}`}>
        {value}
      </div>
    </div>
  );
}
