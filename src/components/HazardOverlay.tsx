import { useEffect, useRef, useState } from "react";
import type { HazardBox } from "@/lib/ai";
import { ScanLine, ShieldAlert } from "lucide-react";

interface Props {
  src: string;
  hazards?: HazardBox[];
  scanning?: boolean;
}

const sevColor: Record<string, string> = {
  high: "rgb(239 68 68)",
  medium: "rgb(245 158 11)",
  low: "rgb(34 197 94)",
};

export function HazardOverlay({ src, hazards = [], scanning }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const onResize = () => {
      const el = imgRef.current;
      if (el) setSize({ w: el.clientWidth, h: el.clientHeight });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [src, hazards.length]);

  return (
    <div ref={wrapRef} className="relative inline-block w-full">
      <img
        ref={imgRef}
        src={src}
        alt="Evidence"
        onLoad={(e) => {
          const el = e.currentTarget;
          setSize({ w: el.clientWidth, h: el.clientHeight });
        }}
        className="rounded-2xl w-full max-h-80 object-cover border border-border"
      />
      {/* Scanning sweep */}
      {scanning && (
        <>
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-primary/40 to-transparent animate-scan" />
          </div>
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur border border-border text-[11px] font-medium flex items-center gap-1.5">
            <ScanLine className="h-3 w-3 text-primary animate-pulse" />
            AI scanning image…
          </div>
        </>
      )}
      {/* Bounding boxes */}
      {!scanning && hazards.map((h, i) => {
        if (!h.bbox) return null;
        const { x, y, w, h: hh } = h.bbox;
        const color = sevColor[h.severity] || sevColor.medium;
        return (
          <div
            key={i}
            className="absolute pointer-events-none animate-in fade-in zoom-in-95 duration-500"
            style={{
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              width: `${w * 100}%`,
              height: `${hh * 100}%`,
              border: `2px solid ${color}`,
              boxShadow: `0 0 0 2px ${color}33, 0 0 20px ${color}66`,
              borderRadius: 8,
            }}
          >
            <div
              className="absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap"
              style={{ background: color, color: "white" }}
            >
              {h.label} · {Math.round(h.confidence * 100)}%
            </div>
          </div>
        );
      })}
      {!scanning && hazards.length > 0 && (
        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-background/85 backdrop-blur border border-border text-[11px] font-semibold flex items-center gap-1.5">
          <ShieldAlert className="h-3 w-3 text-destructive" />
          {hazards.length} hazard{hazards.length > 1 ? "s" : ""} detected
        </div>
      )}
      <style>{`
        @keyframes scan { 0% { top: -10%; } 100% { top: 110%; } }
        .animate-scan { animation: scan 2s linear infinite; }
      `}</style>
    </div>
  );
}
