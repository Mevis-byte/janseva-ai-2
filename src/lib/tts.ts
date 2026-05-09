// Lightweight multilingual TTS using browser SpeechSynthesis (no API key needed).
import { langBcp47, type Lang } from "./i18n";

let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve([]);
  }
  if (voicesReady) return voicesReady;
  voicesReady = new Promise((resolve) => {
    const v = window.speechSynthesis.getVoices();
    if (v && v.length) return resolve(v);
    const handler = () => {
      resolve(window.speechSynthesis.getVoices());
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    // Fallback timeout
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1500);
  });
  return voicesReady;
}

function pickVoice(voices: SpeechSynthesisVoice[], bcp47: string) {
  const lc = bcp47.toLowerCase();
  const base = lc.split("-")[0];
  return (
    voices.find((v) => v.lang.toLowerCase() === lc) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(base + "-")) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(base)) ||
    null
  );
}

export async function speak(text: string, lang: Lang, opts?: { urgent?: boolean }) {
  if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const voices = await loadVoices();
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const bcp = langBcp47[lang] || "en-IN";
  u.lang = bcp;
  const v = pickVoice(voices, bcp);
  if (v) u.voice = v;
  u.rate = opts?.urgent ? 1.05 : 0.95;
  u.pitch = opts?.urgent ? 1.1 : 1;
  u.volume = 1;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function ttsSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
