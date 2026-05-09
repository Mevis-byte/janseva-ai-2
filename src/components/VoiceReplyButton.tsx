import { Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { speak, stopSpeaking, ttsSupported } from "@/lib/tts";
import type { Lang } from "@/lib/i18n";

export function VoiceReplyButton({ text, lang, urgent }: { text: string; lang: Lang; urgent?: boolean }) {
  const [playing, setPlaying] = useState(false);
  if (!text || !ttsSupported()) return null;

  const toggle = async () => {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    await speak(text, lang, { urgent });
    // SpeechSynthesis doesn't reliably fire 'end' across browsers; fall back to estimate.
    setTimeout(() => setPlaying(false), Math.max(2500, text.length * 70));
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-secondary hover:bg-accent text-xs font-medium transition-colors"
      aria-label={playing ? "Stop voice playback" : "Listen to AI reply"}
    >
      {playing ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-primary" />}
      {playing ? "Stop" : "Listen"}
    </button>
  );
}
