import { useCallback, useEffect, useRef, useState } from "react";
import { langBcp47, type Lang } from "./i18n";

type SRStatus = "idle" | "requesting" | "listening" | "processing" | "error" | "blocked";

interface UseSpeechOptions {
  lang: Lang;
  onFinalText?: (text: string) => void;
}

const LANG_MAP = langBcp47;

export function useSpeechRecognition({ lang, onFinalText }: UseSpeechOptions) {
  const [status, setStatus] = useState<SRStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0); // 0..1 mic level
  const [supported, setSupported] = useState(true);

  const recRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const finalRef = useRef("");

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setLevel(0);
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {}
    cleanup();
  }, [cleanup]);

  const start = useCallback(async () => {
    setError(null);
    finalRef.current = "";
    setTranscript("");
    setInterim("");

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      setError("Speech recognition not supported in this browser. Try Chrome or Edge.");
      setStatus("error");
      return;
    }

    setStatus("requesting");

    // Request mic — for both permission UX and visualization
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      let lastVoiceAt = Date.now();
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        const lvl = Math.min(1, rms * 4);
        setLevel(lvl);
        if (lvl > 0.05) lastVoiceAt = Date.now();
        // auto-stop after 2.5s of silence (only if we have some text)
        if (Date.now() - lastVoiceAt > 2500 && finalRef.current.trim().length > 0) {
          stop();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (e: any) {
      console.error(e);
      if (e?.name === "NotAllowedError" || e?.name === "SecurityError") {
        setStatus("blocked");
        setError("Microphone permission denied. Please allow access in your browser settings.");
      } else {
        setStatus("error");
        setError("Could not access microphone.");
      }
      cleanup();
      return;
    }

    const rec = new SR();
    recRef.current = rec;
    rec.lang = LANG_MAP[lang];
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => setStatus("listening");
    rec.onerror = (e: any) => {
      console.error("SR error", e);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setStatus("blocked");
        setError("Microphone permission denied.");
      } else if (e.error === "no-speech") {
        setError("No speech detected. Please try again.");
        setStatus("error");
      } else if (e.error === "network") {
        setError("Network error during transcription. Check your connection.");
        setStatus("error");
      } else {
        setError(`Speech recognition error: ${e.error}`);
        setStatus("error");
      }
      cleanup();
    };
    rec.onend = () => {
      cleanup();
      setStatus((s) => (s === "listening" || s === "processing" ? "idle" : s));
      const finalText = finalRef.current.trim();
      if (finalText && onFinalText) onFinalText(finalText);
    };
    rec.onresult = (event: any) => {
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const t = res[0].transcript;
        if (res.isFinal) {
          finalRef.current += (finalRef.current ? " " : "") + t.trim();
        } else {
          interimChunk += t;
        }
      }
      setTranscript(finalRef.current);
      setInterim(interimChunk);
    };

    try {
      rec.start();
    } catch (e) {
      console.error(e);
      setStatus("error");
      setError("Could not start recognition.");
      cleanup();
    }
  }, [lang, cleanup, stop, onFinalText]);

  useEffect(() => () => cleanup(), [cleanup]);

  return { status, transcript, interim, error, level, supported, start, stop, setTranscript };
}
