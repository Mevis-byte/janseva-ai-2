// Lovable AI-powered grievance classifier
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
  "Other",
];

const DEPT_MAP: Record<string, string> = {
  "Roads / Infrastructure": "Municipal Roads Division",
  "Water Supply": "Water Board (BWSSB)",
  "Electricity": "BESCOM",
  "Garbage / Sanitation": "Municipal Sanitation",
  "Public Transport": "BMTC / Transport Dept",
  "Drainage": "Storm Water Drain Division",
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

    const systemPrompt = `You are an AI assistant for an Indian public-grievance system. Classify citizen complaints written in English, Hindi, or Kannada. Detect language, category, priority (High = safety/danger/accident/flood/live wire/fire; Medium = service disruption; Low = minor cosmetic issues), and write a one-sentence neutral English summary. Always call the classify_grievance tool.`;

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
          { role: "user", content: `Complaint:\n"""${text}"""\nImage attached: ${hasImage ? "yes" : "no"}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "classify_grievance",
            description: "Return structured classification.",
            parameters: {
              type: "object",
              properties: {
                language: { type: "string", enum: ["en", "hi", "kn"] },
                category: { type: "string", enum: CATEGORIES },
                priority: { type: "string", enum: ["High", "Medium", "Low"] },
                summary: { type: "string" },
              },
              required: ["language", "category", "priority", "summary"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "classify_grievance" } },
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
      summary: args.summary,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("classify error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
