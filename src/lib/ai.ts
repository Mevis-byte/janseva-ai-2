import type { Lang } from "./i18n";
import { supabase } from "@/integrations/supabase/client";

export type Category =
  | "Roads / Infrastructure"
  | "Water Supply"
  | "Electricity"
  | "Garbage / Sanitation"
  | "Public Transport"
  | "Drainage"
  | "Public Safety"
  | "Healthcare"
  | "Sewage"
  | "Other";

export type Priority = "High" | "Medium" | "Low";

export interface AIResult {
  id: string;
  language: Lang;
  languageLabel: string;
  category: Category;
  priority: Priority;
  department: string;
  title: string;
  summary: string;
  location: string;
  timeline: string;
  impact: string;
  safetyInstructions: string[];
  nextSteps: string[];
  confidence: number;
  sentiment: "angry" | "worried" | "neutral" | "urgent";
  emergency: boolean;
}

export async function classifyComplaint(text: string, hasImage: boolean): Promise<AIResult> {
  const { data, error } = await supabase.functions.invoke("classify-grievance", {
    body: { text, hasImage },
  });
  if (error) throw new Error(error.message || "AI classification failed");
  if (data?.error) throw new Error(data.error);
  return data as AIResult;
}
