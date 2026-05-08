// Lovable AI-powered grievance classifier (advanced)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = [
  "Roads / Infrastructure",
  "Water Supply",
  "Electricity",
  "Garbage / Sanitation",
  "Public Transport",
  "Drainage",
  "Public Safety",
  "Healthcare",
  "Sewage",
  "Other",
];

const DEPT_MAP: Record<string, string> = {
  "Roads / Infrastructure": "Municipal Roads Division",
  "Water Supply": "Water Board (BWSSB)",
  "Electricity": "BESCOM",
  "Garbage / Sanitation": "Municipal Sanitation",
  "Public Transport": "BMTC / Transport Dept",
  "Drainage": "Storm Water Drain Division",
  "Public Safety": "Police / Civic Defense",
  "Healthcare": "Public Health Department",
  "Sewage": "Sewerage Board",
  "Other": "Citizen Grievance Cell",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, hasImage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an expert AI assistant for India's public-grievance system "JanSeva AI". Citizens submit complaints in English, Hindi, or Kannada (text or transcribed voice).

Your job: produce a professional, official-sounding analysis with safety guidance.

Rules:
- Detect the language (en/hi/kn).
- Choose the most fitting category.
- Priority: High = danger to life/safety (live wire, fire, flood, accident, collapse, contaminated water, medical emergency); Medium = service disruption affecting daily life; Low = minor/cosmetic.
- Title: short formal English headline (max 12 words).
- Summary: 2-3 sentences in formal English describing issue, location (if mentioned), timeline, public impact, risk.
- Safety instructions: 3-5 short, practical, NON-DANGEROUS bullet steps the citizen and neighbours can take until authorities arrive. Avoid unsafe DIY advice.
- Next steps: 2-3 bullets describing what the assigned department will likely do.
- Confidence: 0-1 score for your classification.
- Sentiment: angry / worried / neutral / urgent.
- Always call the analyze_grievance tool.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Citizen complaint:\n"""${text}"""\nImage attached: ${hasImage ? "yes" : "no"}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_grievance",
            description: "Return structured grievance analysis with safety guidance.",
            parameters: {
              type: "object",
              properties: {
                language: { type: "string", enum: ["en", "hi", "kn"] },
                category: { type: "string", enum: CATEGORIES },
                priority: { type: "string", enum: ["High", "Medium", "Low"] },
                title: { type: "string", description: "Formal complaint title in English" },
                summary: { type: "string", description: "2-3 sentence formal English summary" },
                location: { type: "string", description: "Location mentioned by citizen, or empty" },
                timeline: { type: "string", description: "How long the issue persists, e.g. '5 days'" },
                impact: { type: "string", description: "Public impact description" },
                safety_instructions: {
                  type: "array",
                  items: { type: "string" },
                  description: "3-5 practical safety bullets for the citizen until help arrives",
                },
                next_steps: {
                  type: "array",
                  items: { type: "string" },
                  description: "2-3 bullets of what the department will do",
                },
                confidence: { type: "number", description: "0..1 classification confidence" },
                sentiment: { type: "string", enum: ["angry", "worried", "neutral", "urgent"] },
                emergency: { type: "boolean", description: "true if immediate danger to life" },
              },
              required: ["language", "category", "priority", "title", "summary", "safety_instructions", "next_steps", "confidence", "sentiment", "emergency"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "analyze_grievance" } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = call ? JSON.parse(call.function.arguments) : null;
    if (!args) throw new Error("No structured output");

    const langLabel = { en: "English", hi: "Hindi", kn: "Kannada" }[args.language as "en" | "hi" | "kn"] ?? "English";
    const id = `GRV-2026-${String(Math.floor(1000 + Math.random() * 8999))}`;

    return new Response(JSON.stringify({
      id,
      language: args.language,
      languageLabel: langLabel,
      category: args.category,
      priority: args.priority,
      department: DEPT_MAP[args.category] ?? "Citizen Grievance Cell",
      title: args.title,
      summary: args.summary,
      location: args.location ?? "",
      timeline: args.timeline ?? "",
      impact: args.impact ?? "",
      safetyInstructions: args.safety_instructions ?? [],
      nextSteps: args.next_steps ?? [],
      confidence: args.confidence ?? 0.8,
      sentiment: args.sentiment ?? "neutral",
      emergency: !!args.emergency,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("classify error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
