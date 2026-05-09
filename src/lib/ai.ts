import type { Lang } from "./i18n";
import { supabase } from "@/integrations/supabase/client";

export type Category =
  | "Roads / Infrastructure" | "Water Supply" | "Electricity"
  | "Garbage / Sanitation" | "Public Transport" | "Drainage"
  | "Public Safety" | "Healthcare" | "Sewage" | "Fire / Hazard" | "Other";

export type Priority = "High" | "Medium" | "Low";

export interface HazardBox {
  type: string;
  label: string;
  severity: "low" | "medium" | "high";
  confidence: number;
  bbox?: { x: number; y: number; w: number; h: number };
}

export interface WeatherSnap {
  temperature?: number;
  precipitation?: number;
  windSpeed?: number;
  weatherCode?: number;
  maxPrecipProbNext6h?: number;
}

export interface AIResult {
  id: string;
  language: Lang | string;
  languageLabel: string;
  category: Category;
  priority: Priority;
  riskScore: number;
  emergency: boolean;
  panic: boolean;
  sentiment: "angry" | "worried" | "neutral" | "urgent" | "fearful";
  department: string;
  title: string;
  summary: string;
  officialEnglish: string;
  location: string;
  timeline: string;
  impact: string;
  citizensAffected: number | null;
  tags: string[];
  safetyInstructions: string[];
  safetyInstructionsEn: string[];
  nextSteps: string[];
  recommendedActions: string[];
  voiceResponse: string;
  hazards: HazardBox[];
  imageQuality: "good" | "blurry" | "dark" | "irrelevant" | "none";
  confidence: number;
  weather: WeatherSnap | null;
}

export async function classifyComplaint(opts: {
  text: string;
  image?: string | null;
  lat?: number | null;
  lng?: number | null;
  hintLang?: string;
}): Promise<AIResult> {
  const { data, error } = await supabase.functions.invoke("classify-grievance", {
    body: {
      text: opts.text,
      image: opts.image ?? null,
      lat: opts.lat ?? null,
      lng: opts.lng ?? null,
      hintLang: opts.hintLang,
    },
  });
  if (error) throw new Error(error.message || "AI classification failed");
  if (data?.error) throw new Error(data.error);
  return data as AIResult;
}
