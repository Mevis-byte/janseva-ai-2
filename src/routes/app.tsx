import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/app-context";
import { translations, examples } from "@/lib/i18n";
import { TopBar } from "@/components/TopBar";
import { classifyComplaint, type AIResult } from "@/lib/ai";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import {
  ImagePlus, Mic, Send, X, Sparkles, Loader2, Hash, Languages,
  Tag, AlertTriangle, Building2, FileText, Plus, MapPin, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "File a Grievance — JanSeva AI" },
      { name: "description", content: "Submit civic complaints in Kannada, Hindi, or English. AI auto-categorizes and routes to the correct department." },
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
  const [listening, setListening] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !isAuthed) navigate({ to: "/login" });
  }, [isAuthed, loading, navigate]);

  const steps = [t.detectLang, t.classifying, t.routing];

  const handleSubmit = () => {
    if (!text.trim()) return;
    setPhase("analyzing");
    setStepIdx(0);
    let i = 0;
    const tick = () => {
      i++;
      if (i < steps.length) {
        setStepIdx(i);
        setTimeout(tick, 700);
      } else {
        classifyComplaint(text, !!image)
          .then((r) => {
            setResult(r);
            setPhase("result");
          })
          .catch((err) => {
            console.error(err);
            alert(err?.message ?? "AI classification failed");
            setPhase("input");
          });
      }
    };
    setTimeout(tick, 700);
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

  const simulateVoice = () => {
    if (listening) return;
    setListening(true);
    setTimeout(() => {
      setText((prev) => (prev ? prev + " " : "") + examples[lang][0]);
      setListening(false);
    }, 1600);
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
            <div className="bg-card rounded-3xl shadow-soft border border-border p-3 sm:p-4 focus-within:shadow-glow transition-shadow">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={listening ? t.listening : t.placeholder}
                rows={4}
                className="w-full resize-none bg-transparent border-0 outline-none text-base sm:text-lg p-3 sm:p-4 placeholder:text-muted-foreground"
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
                    <div className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded-md bg-foreground/80 text-background backdrop-blur-sm flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" /> AI vision ready
                    </div>
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
                  <button
                    onClick={simulateVoice}
                    className={`h-10 px-3 rounded-xl flex items-center gap-2 text-sm transition-colors ${
                      listening
                        ? "bg-destructive/10 text-destructive"
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Mic className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`} />
                    <span className="hidden sm:inline">{listening ? t.listening : t.voice}</span>
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

            <div className="mt-8">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 text-center">
                {t.suggestions}
              </div>
              <div className="grid sm:grid-cols-3 gap-2.5">
                {examples[lang].map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setText(ex)}
                    className="text-left p-3.5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-soft transition-all text-sm text-muted-foreground hover:text-foreground"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {phase === "analyzing" && (
          <div className="bg-card rounded-3xl shadow-soft border border-border p-8 sm:p-12">
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
          <ResultCard result={result} text={text} image={image} onNew={reset} t={t} />
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

function ResultCard({
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

      <div className="bg-card rounded-3xl shadow-soft border border-border overflow-hidden">
        <div className="bg-gradient-hero p-5 flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Hash className="h-3 w-3" /> {t.complaintId}
            </div>
            <div className="font-display font-bold text-2xl mt-0.5">{result.id}</div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ring-1 ${priorityStyles(result.priority)}`}>
            {result.priority === "High" && <AlertTriangle className="h-3 w-3 inline -mt-0.5 mr-1" />}
            {result.priority} {t.priority}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
          <Field icon={<Languages className="h-4 w-4" />} label={t.detectedLang} value={result.languageLabel} />
          <Field icon={<Tag className="h-4 w-4" />} label={t.category} value={result.category} />
          <Field icon={<Building2 className="h-4 w-4" />} label={t.department} value={result.department} />
          <Field icon={<MapPin className="h-4 w-4" />} label="Location" value="Auto-detected (Bengaluru)" muted />
        </div>

        <div className="p-5 border-t border-border">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
            <FileText className="h-3 w-3" /> {t.summary}
          </div>
          <p className="text-sm leading-relaxed">{result.summary}</p>
        </div>

        {image && (
          <div className="px-5 pb-5">
            <img src={image} alt="Evidence" className="rounded-2xl w-full max-h-64 object-cover border border-border" />
          </div>
        )}

        <div className="p-4 bg-secondary/50 border-t border-border flex flex-col sm:flex-row gap-2">
          <button
            onClick={onNew}
            className="flex-1 h-11 rounded-xl bg-gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-glow active:scale-[0.98] transition-transform"
          >
            <Plus className="h-4 w-4" /> {t.newComplaint}
          </button>
          <button className="flex-1 h-11 rounded-xl bg-card border border-border font-semibold hover:bg-accent transition-colors">
            {t.track}
          </button>
        </div>
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
