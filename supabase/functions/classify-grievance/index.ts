// JanSeva AI — Advanced multilingual grievance classifier with vision, risk scoring, and weather context
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
  "Fire / Hazard",
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
  "Fire / Hazard": "Fire & Emergency Services",
  "Other": "Citizen Grievance Cell",
};

const LANG_LABELS: Record<string, string> = {
  en: "English", hi: "Hindi", kn: "Kannada", ta: "Tamil", te: "Telugu",
  ml: "Malayalam", mr: "Marathi", bn: "Bengali", gu: "Gujarati", pa: "Punjabi",
  ur: "Urdu", or: "Odia", as: "Assamese",
};

async function fetchWeather(lat?: number, lng?: number) {
  if (lat == null || lng == null) return null;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&hourly=precipitation_probability&forecast_hours=6`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const d = await r.json();
    const precipNext6h = (d.hourly?.precipitation_probability ?? []).slice(0, 6);
    const maxPrecipProb = precipNext6h.length ? Math.max(...precipNext6h) : 0;
    return {
      temperature: d.current?.temperature_2m,
      precipitation: d.current?.precipitation,
      windSpeed: d.current?.wind_speed_10m,
      weatherCode: d.current?.weather_code,
      maxPrecipProbNext6h: maxPrecipProb,
    };
  } catch (_) { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, image, lat, lng, hintLang } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const weather = await fetchWeather(lat, lng);

    const systemPrompt = `You are JanSeva AI, India's official civic intelligence assistant. You analyze citizen grievances submitted in any Indian language (English, Hindi, Kannada, Tamil, Telugu, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Urdu, Odia, Assamese) by text, voice transcription, and/or image evidence.

Produce a complete official analysis with multilingual output, hazard detection, risk scoring, and safety guidance.

CRITICAL RULES:
- Detect the citizen's language precisely (ISO 639-1: en, hi, kn, ta, te, ml, mr, bn, gu, pa, ur, or, as).
- Generate ALL citizen-facing fields (summary, safety_instructions, voice_response) in BOTH the citizen's language AND formal English.
- official_english is the formal English version used for government routing and reports.
- title: short formal English headline (max 14 words).
- risk_score 0-100: weigh life safety, scale of impact, weather, location, sentiment. >=80 = emergency.
- emergency=true ONLY for active danger to life (fire, live wires, flood, collapse, severe accident, gas leak, sewage contamination of drinking water).
- panic: detect fear/urgency/stress in the citizen's wording.
- citizens_affected: realistic estimate of people impacted daily.
- tags: 3-6 hashtag-style markers like #FloodRisk #PotholeHazard #ElectricalHazard.
- recommended_actions: 2-4 concrete actions for the assigned department.
- safety_instructions: 3-5 practical, NON-DANGEROUS bullets in BOTH languages.
- next_steps: 2-3 bullets describing what the department will do.
- If image provided: identify visible hazards. For each hazard return type, severity (low/medium/high), confidence (0-1), and a normalized bounding box {x,y,w,h} where each value is 0-1 fraction of image. Also rate image_quality (good/blurry/dark/irrelevant).
- Use weather context to adjust risk: heavy rain + drainage/road = +risk; storm + fallen tree/electricity = +risk. Mention weather effect in summary if relevant.
- voice_response: 1-2 calm, official sentences in citizen's language for TTS playback (e.g., "Your complaint has been registered and routed to BESCOM for immediate action.").
- Always call the analyze_grievance tool.`;

    const weatherCtx = weather
      ? `\n\nLive weather at citizen location (lat=${lat}, lng=${lng}): temp=${weather.temperature}°C, precipitation=${weather.precipitation}mm, wind=${weather.windSpeed}km/h, max rain probability next 6h=${weather.maxPrecipProbNext6h}%.`
      : (lat != null && lng != null ? `\n\nCitizen GPS: ${lat}, ${lng}.` : "");

    const userContent: any[] = [
      {
        type: "text",
        text: `Citizen complaint:\n"""${text}"""${hintLang ? `\n(UI hint language: ${hintLang})` : ""}${weatherCtx}\nImage attached: ${image ? "yes" : "no"}`,
      },
    ];
    if (image && typeof image === "string") {
      userContent.push({ type: "image_url", image_url: { url: image } });
    }

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
          { role: "user", content: userContent },
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_grievance",
            description: "Return structured grievance analysis with vision, risk scoring, weather context and multilingual output.",
            parameters: {
              type: "object",
              properties: {
                language: { type: "string", description: "ISO 639-1 code of detected citizen language" },
                category: { type: "string", enum: CATEGORIES },
                priority: { type: "string", enum: ["High", "Medium", "Low"] },
                risk_score: { type: "number", description: "0-100 civic risk score" },
                emergency: { type: "boolean" },
                panic: { type: "boolean" },
                sentiment: { type: "string", enum: ["angry", "worried", "neutral", "urgent", "fearful"] },
                title: { type: "string", description: "Formal English title (<=14 words)" },
                summary: { type: "string", description: "2-3 sentence summary in citizen's language" },
                official_english: { type: "string", description: "Formal English summary (2-3 sentences) for government records" },
                location: { type: "string", description: "Location mentioned by citizen, or empty" },
                timeline: { type: "string", description: "How long the issue persists, e.g. '5 days'" },
                impact: { type: "string", description: "Public impact in English" },
                citizens_affected: { type: "number", description: "Estimated people impacted daily" },
                tags: { type: "array", items: { type: "string" }, description: "3-6 hashtag-style tags" },
                safety_instructions: { type: "array", items: { type: "string" }, description: "3-5 safety bullets in citizen's language" },
                safety_instructions_en: { type: "array", items: { type: "string" }, description: "Same safety bullets in English" },
                next_steps: { type: "array", items: { type: "string" }, description: "2-3 department action bullets in English" },
                recommended_actions: { type: "array", items: { type: "string" }, description: "Concrete repair/response actions for the authority" },
                voice_response: { type: "string", description: "Short calm spoken reply in citizen's language for TTS" },
                hazards: {
                  type: "array",
                  description: "Detected hazards in image (empty if no image or none detected)",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", description: "e.g. pothole, garbage, exposed_wire, waterlogging, fire, fallen_tree, sewage" },
                      severity: { type: "string", enum: ["low", "medium", "high"] },
                      confidence: { type: "number", description: "0-1" },
                      bbox: {
                        type: "object",
                        properties: {
                          x: { type: "number" }, y: { type: "number" },
                          w: { type: "number" }, h: { type: "number" },
                        },
                        required: ["x", "y", "w", "h"],
                        additionalProperties: false,
                      },
                      label: { type: "string", description: "Short human label" },
                    },
                    required: ["type", "severity", "confidence", "label"],
                    additionalProperties: false,
                  },
                },
                image_quality: { type: "string", enum: ["good", "blurry", "dark", "irrelevant", "none"] },
                confidence: { type: "number", description: "0-1 overall classification confidence" },
              },
              required: [
                "language", "category", "priority", "risk_score", "emergency", "panic",
                "sentiment", "title", "summary", "official_english",
                "safety_instructions", "safety_instructions_en", "next_steps",
                "recommended_actions", "voice_response", "tags", "image_quality", "confidence",
              ],
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

    const langCode = (args.language || "en").toLowerCase();
    const langLabel = LANG_LABELS[langCode] ?? "English";
    const id = `GRV-2026-${String(Math.floor(1000 + Math.random() * 8999))}`;

    return new Response(JSON.stringify({
      id,
      language: langCode,
      languageLabel: langLabel,
      category: args.category,
      priority: args.priority,
      riskScore: Math.max(0, Math.min(100, Math.round(args.risk_score ?? 50))),
      emergency: !!args.emergency,
      panic: !!args.panic,
      sentiment: args.sentiment ?? "neutral",
      department: DEPT_MAP[args.category] ?? "Citizen Grievance Cell",
      title: args.title,
      summary: args.summary,
      officialEnglish: args.official_english,
      location: args.location ?? "",
      timeline: args.timeline ?? "",
      impact: args.impact ?? "",
      citizensAffected: args.citizens_affected ?? null,
      tags: args.tags ?? [],
      safetyInstructions: args.safety_instructions ?? [],
      safetyInstructionsEn: args.safety_instructions_en ?? [],
      nextSteps: args.next_steps ?? [],
      recommendedActions: args.recommended_actions ?? [],
      voiceResponse: args.voice_response ?? "",
      hazards: args.hazards ?? [],
      imageQuality: args.image_quality ?? "none",
      confidence: args.confidence ?? 0.8,
      weather,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("classify error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
