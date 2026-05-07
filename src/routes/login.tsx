import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { translations } from "@/lib/i18n";
import { TopBar } from "@/components/TopBar";
import { Shield, Smartphone, Mail, IdCard, ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — JanSeva AI" },
      { name: "description", content: "Securely sign in to file civic grievances using Aadhaar, phone, or email." },
    ],
  }),
  component: LoginPage,
});

type Method = "aadhaar" | "phone" | "email";

function LoginPage() {
  const { lang, login, isAuthed } = useApp();
  const t = translations[lang];
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>("phone");
  const [value, setValue] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthed) navigate({ to: "/app" });
  }, [isAuthed, navigate]);

  const placeholder =
    method === "aadhaar" ? t.aadhaarPlaceholder : method === "phone" ? t.phonePlaceholder : t.emailPlaceholder;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
    }, 700);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login();
      navigate({ to: "/app" });
    }, 700);
  };

  const methods: { id: Method; label: string; icon: React.ReactNode }[] = [
    { id: "aadhaar", label: t.aadhaar, icon: <IdCard className="h-4 w-4" /> },
    { id: "phone", label: t.phone, icon: <Smartphone className="h-4 w-4" /> },
    { id: "email", label: t.email, icon: <Mail className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-16 grid lg:grid-cols-2 gap-12 items-center">
        <section className="hidden lg:block">
          <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-accent text-accent-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-india-green animate-pulse" /> AI-Powered Civic Tech
          </div>
          <h1 className="mt-5 text-5xl font-display font-bold leading-tight">
            File grievances in <span className="text-primary">your language.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-md">
            {t.tagline}. Smart routing to the right department — in seconds, not weeks.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "Type, speak, or upload a photo",
              "Auto-classified by AI in 7 categories",
              "Routed to the responsible department",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-india-green" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-card rounded-3xl shadow-soft border border-border p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-2xl bg-gradient-primary grid place-items-center">
                <Shield className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg leading-tight">{t.signIn}</h2>
                <p className="text-xs text-muted-foreground">{t.signInSub}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 p-1 bg-secondary rounded-2xl">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMethod(m.id);
                    setOtpSent(false);
                    setValue("");
                  }}
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    method === m.id
                      ? "bg-card shadow-soft text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="mt-6 space-y-3">
                <input
                  type={method === "email" ? "email" : "text"}
                  inputMode={method === "email" ? "email" : "numeric"}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  className="w-full h-12 px-4 rounded-2xl bg-input border-0 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !value.trim()}
                  className="w-full h-12 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-glow disabled:opacity-60 transition-transform active:scale-[0.98]"
                >
                  {loading ? "…" : <>{t.sendOtp} <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="mt-6 space-y-3">
                <div className="text-xs text-muted-foreground text-center">
                  OTP sent to <span className="font-medium text-foreground">{value}</span>
                </div>
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder={t.otpPlaceholder}
                  className="w-full h-14 px-4 rounded-2xl bg-input border-0 text-center text-2xl tracking-[0.5em] font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                <p className="text-[11px] text-center text-muted-foreground">{t.otpHint}</p>
                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="w-full h-12 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-glow disabled:opacity-60 transition-transform active:scale-[0.98]"
                >
                  {loading ? "…" : t.verify}
                </button>
              </form>
            )}

            <p className="mt-6 text-[11px] text-center text-muted-foreground">
              By continuing, you agree to use this service responsibly. Demo only — no real authentication.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
