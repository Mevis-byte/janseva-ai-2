import type { Lang } from "./i18n";
import { supabase } from "@/integrations/supabase/client";

export type Category =
  | "Roads / Infrastructure"
  | "Water Supply"
  | "Electricity"
  | "Garbage / Sanitation"
  | "Public Transport"
  | "Drainage"
  | "Other";

export type Priority = "High" | "Medium" | "Low";

export interface AIResult {
  id: string;
  language: Lang;
  languageLabel: string;
  category: Category;
  priority: Priority;
  department: string;
  summary: string;
}

export async function classifyComplaint(text: string, hasImage: boolean): Promise<AIResult> {
  const { data, error } = await supabase.functions.invoke("classify-grievance", {
    body: { text, hasImage },
  });
  if (error) throw new Error(error.message || "AI classification failed");
  if (data?.error) throw new Error(data.error);
  return data as AIResult;
}
