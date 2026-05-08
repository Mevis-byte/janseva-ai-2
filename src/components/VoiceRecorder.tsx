import { Mic, MicOff, Square, AlertCircle, Loader2 } from "lucide-react";
import { useSpeechRecognition } from "@/lib/use-speech";
import type { Lang } from "@/lib/i18n";
import { useEffect } from "react";

interface Props {
  lang: Lang;
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ lang, onTranscript, disabled }: Props) {
  const { status, transcript, interim, error, level, supported, start, stop } = useSpeechRecognition({
    lang,
    onFinalText: (text) => {
      if (text) onTranscript(text);
    },
  });

  // Build waveform bars from level
  const bars = Array.from({ length: 24 }, (_, i) => {
    const distance = Math.abs(i - 11.5) / 11.5;
    const h = Math.max(0.15, level * (1 - distance * 0.6) + Math.random() * 0.05 * level);
    return h;
  });

  const isLive = status === "listening";
  const isLoading = status === "requesting" || status === "processing";

  const handleClick = () => {
    if (isLive || isLoading) stop();
    else start();
  };

  if (!supported) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground p-2.5 rounded-xl bg-secondary">
        <AlertCircle className="h-4 w-4" />
        Voice not supported here. Try Chrome/Edge on desktop or Android.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={`relative h-12 w-12 rounded-full grid place-items-center transition-all active:scale-95 disabled:opacity-50 ${
            isLive
              ? "bg-destructive text-destructive-foreground shadow-[0_0_0_8px_hsl(var(--destructive)/0.15)]"
              : "bg-gradient-primary text-primary-foreground shadow-glow"
          }`}
          aria-label={isLive ? "Stop recording" : "Start voice input"}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isLive ? (
            <Square className="h-4 w-4 fill-current" />
          ) : status === "blocked" ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
          {isLive && (
            <span className="absolute inset-0 rounded-full bg-destructive/40 animate-ping" />
          )}
        </button>

        <div className="flex-1 h-12 rounded-2xl bg-secondary/60 border border-border px-3 flex items-center gap-[2px] overflow-hidden">
          {isLive ? (
            bars.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-full bg-gradient-to-t from-primary to-primary/60 transition-all"
                style={{ height: `${Math.max(8, h * 100)}%` }}
              />
            ))
          ) : (
            <span className="text-xs text-muted-foreground">
              {status === "blocked"
                ? "Mic access blocked"
                : status === "requesting"
                ? "Requesting microphone…"
                : "Tap mic to speak in your language"}
            </span>
          )}
        </div>
      </div>

      {(transcript || interim) && (
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Live transcript</div>
          <p className="text-sm leading-relaxed">
            <span>{transcript}</span>
            {interim && <span className="text-muted-foreground italic"> {interim}</span>}
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-xs text-destructive p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
