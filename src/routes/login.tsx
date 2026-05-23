import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { translations } from "@/lib/i18n";
import { TopBar } from "@/components/TopBar";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Shield, Mail, ArrowRight, CheckCircle2, Loader2, Phone } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — JanSeva AI" },
      { name: "description", content: "Securely sign in to file civic grievances." },
    ],
  }),
  component: LoginPage,
});

type Method = "email" | "phone";
type Mode = "signin" | "signup";

function LoginPage() {
  const { lang, isAuthed } = useApp();
  const t = translations[lang];
  const navigate = useNavigate();

  const [method, setMethod] = useState<Method>("email");
  const [mode, setMode] = useState<Mode>("signin");

  // shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // email/password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // phone
  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);

  // Aadhaar sign-in was removed for security: a real flow requires a licensed
  // UIDAI AUA/KUA integration where the OTP is generated and validated
  // server-side. A demo flow that derives credentials from the Aadhaar number
  // is an account-takeover vulnerability and must not ship.

  useEffect(() => {
    if (isAuthed) navigate({ to: "/app" });
  }, [isAuthed, navigate]);

  const resetMessages = () => {
    setError(null);
    setInfo(null);
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { full_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        setInfo("Check your email to confirm your account, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/app" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    resetMessages();
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/app`,
      });
      if (result.error) throw result.error instanceof Error ? result.error : new Error(String(result.error));
      if (result.redirected) return;
      navigate({ to: "/app" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  };

  // ---- Phone OTP via Supabase ----
  const sendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!/^\+?\d{10,15}$/.test(phone.replace(/\s/g, ""))) {
      setError("Enter a valid phone number with country code (e.g. +919876543210).");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith("+") ? phone : `+91${phone}`,
      });
      if (error) throw error;
      setPhoneOtpSent(true);
      setInfo("OTP sent. Check your messages.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send OTP. Phone provider may not be configured.");
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.startsWith("+") ? phone : `+91${phone}`,
        token: phoneOtp,
        type: "sms",
      });
      if (error) throw error;
      navigate({ to: "/app" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Aadhaar sign-in intentionally removed — see comment above.

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
              "Sign in with Email or Phone",
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
                <h2 className="font-display font-bold text-lg leading-tight">
                  {mode === "signin" ? "Sign in" : "Create account"}
                </h2>
                <p className="text-xs text-muted-foreground">Choose how you'd like to continue</p>
              </div>
            </div>

            {/* Method tabs */}
            <div className="mt-5 grid grid-cols-2 gap-1.5 p-1 bg-secondary rounded-2xl">
              {[
                { key: "email" as const, label: "Email", icon: Mail },
                { key: "phone" as const, label: "Phone", icon: Phone },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setMethod(key);
                    resetMessages();
                  }}
                  className={`h-10 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                    method === key
                      ? "bg-card shadow-soft text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>

            {method === "email" && (
              <>
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="mt-5 w-full h-12 rounded-2xl bg-card border border-border font-semibold flex items-center justify-center gap-3 hover:bg-secondary transition-colors disabled:opacity-60"
                >
                  <GoogleIcon /> Continue with Google
                </button>

                <div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <div className="flex-1 h-px bg-border" />
                  or
                  <div className="flex-1 h-px bg-border" />
                </div>

                <form onSubmit={handleEmail} className="space-y-3">
                  {mode === "signup" && (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name (optional)"
                      className="w-full h-12 px-4 rounded-2xl bg-input border-0 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full h-12 px-4 rounded-2xl bg-input border-0 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    minLength={6}
                    className="w-full h-12 px-4 rounded-2xl bg-input border-0 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <SubmitBtn loading={loading}>
                    {mode === "signin" ? (
                      <>Sign in <ArrowRight className="h-4 w-4" /></>
                    ) : (
                      <><Mail className="h-4 w-4" /> Create account</>
                    )}
                  </SubmitBtn>
                </form>

                <p className="mt-5 text-xs text-center text-muted-foreground">
                  {mode === "signin" ? "New to JanSeva AI?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => {
                      setMode(mode === "signin" ? "signup" : "signin");
                      resetMessages();
                    }}
                    className="font-semibold text-primary hover:underline"
                  >
                    {mode === "signin" ? "Create one" : "Sign in"}
                  </button>
                </p>
              </>
            )}

            {method === "phone" && (
              <form onSubmit={phoneOtpSent ? verifyPhoneOtp : sendPhoneOtp} className="mt-5 space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Mobile number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneOtpSent(false);
                    }}
                    placeholder="+91 98765 43210"
                    required
                    className="mt-1.5 w-full h-12 px-4 rounded-2xl bg-input border-0 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                {phoneOtpSent && (
                  <div>
                    <label className="text-xs text-muted-foreground">6-digit OTP</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="••••••"
                      required
                      className="mt-1.5 w-full h-12 px-4 rounded-2xl bg-input border-0 text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                )}
                <SubmitBtn loading={loading}>
                  {phoneOtpSent ? <>Verify & Continue <ArrowRight className="h-4 w-4" /></> : <>Send OTP <ArrowRight className="h-4 w-4" /></>}
                </SubmitBtn>
                <p className="text-[11px] text-muted-foreground text-center">
                  SMS rates may apply. Requires phone provider configured in Lovable Cloud.
                </p>
              </form>
            )}

            {error && <p className="mt-3 text-xs text-destructive text-center">{error}</p>}
            {info && <p className="mt-3 text-xs text-india-green text-center">{info}</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

function SubmitBtn({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full h-12 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-glow disabled:opacity-60 transition-transform active:scale-[0.98]"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
