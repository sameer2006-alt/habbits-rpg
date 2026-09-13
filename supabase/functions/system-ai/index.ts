// Supabase Edge Function: system-ai
// Runtime: Deno
// Purpose: Authenticated, trusted AI assistant for Habbits RPG powered by Gemini API.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 10;

const AUTHORITATIVE_GAME_RULES = `
### HABBITS RPG AUTHORITATIVE GAME RULES & KNOWLEDGE BASE
- **Purpose**: Transform real-life discipline, productivity, and study into an epic dark-fantasy RPG.
- **Attributes**: Strength, Intelligence, Vitality, Focus, Discipline, Consistency.
- **Level Formula**: Level = floor(sqrt(Total_XP / 50)). Level is purely XP-driven and never demotes.
- **10 Authoritative Ranks**:
  0. F (The Novice): 0 XP, 0 Tasks, 0 Streak
  1. E (The Apprentice): 100 XP, 5 Tasks, 2 Streak
  2. D (The Practitioner): 500 XP, 15 Tasks, 5 Streak
  3. C (The Specialist): 1,500 XP, 35 Tasks, 7 Streak
  4. B (The Adept): 4,000 XP, 75 Tasks, 14 Streak
  5. A (The Master): 10,000 XP, 150 Tasks, 21 Streak
  6. S (The Grandmaster): 25,000 XP, 300 Tasks, 30 Streak. Special Condition: Slay 1 Boss & have at least one attribute >= 35.
  7. SS (The Ascendant): 60,000 XP, 500 Tasks, 45 Streak. Special Condition: Slay 2 Bosses & have all 6 core attributes >= 25.
  8. HEROIC (The Sovereign): 120,000 XP, 750 Tasks, 60 Streak. Special Condition: Slay 3 Bosses & have all 6 core attributes >= 40.
  9. LEGENDARY (The Transcendent): 250,000 XP, 1,000 Tasks, 90 Streak. Special Condition: Slay 4 Bosses & have all 6 core attributes >= 50.
- **Anti-Demotion Guarantee**: Ranks are permanent milestones; players NEVER demote even if current streak resets to 0. Historical best streak is honored.
- **Boss Arena**:
  - Weekly Bosses (7-day reset): Ignis, Flame of Lethargy (1200 HP, 45 DMG/quest, ~27 quests), Vortex, Mind Fog (1500 HP, 50 DMG/quest, 30 quests).
  - Monthly Apex Raids (30-day reset): Malakor, Procrastination Monarch (5000 HP, 50 DMG/quest, 100 quests), Leviathan of Chaos (7000 HP, 60 DMG/quest, 117 quests).
  - Quests deal fixed damage to all active bosses in the current period.
- **Quests & Reward Security**:
  - Max 1 completion per quest per daily reset window.
  - Custom Quest Limits: Max 300 XP, Max 100 Coins, Max 10 Stat Points per quest. Negative, decimal, or infinite values are blocked.
- **Daily Directives (Phase 2.1)**:
  - Temporary daily objectives assigned to each player for one calendar day (ONE player + ONE date = ONE directive).
  - Rewards: Balanced bonus XP (60-100 XP), Soul Coins (15-30), and occasional +1 Stat point upon achieving the objective.
  - Strict Idempotency: Rewards can only be claimed once per directive.
- **Shop**: Players spend Soul Coins on Double XP Elixir (next 3 quests), Coin Magnet (+50% coins), Blade of Focus (+10% passive XP), and custom rewards.
`.trim();

function classifyQueryIntent(query: string, history: any[]): "game" | "mixed" | "general" | "help" {
  const q = query.toLowerCase().trim();

  if (
    q === "help" ||
    q === "menu" ||
    q.includes("how to use system ai") ||
    q.includes("what can you do") ||
    q.includes("list commands") ||
    q.includes("help menu")
  ) {
    return "help";
  }

  const gameTerms = [
    "habbits", "habbits rpg", "life-system", "habit tracking app", "habit tracker",
    "rank", "ranks", "ranking", "tier", "ascension", "demote", "demotion",
    "xp", "exp", "level", "levels", "leveling",
    "boss", "bosses", "ignis", "vortex", "malakor", "leviathan", "raid", "raids",
    "quest", "quests", "daily quest", "custom quest", "task", "tasks",
    "soul coin", "soul coins", "coin", "coins", "shop", "double xp elixir", "coin magnet", "blade of focus",
    "streak", "streaks", "achievement", "achievements",
    "directive", "directives", "daily directive", "daily directives",
    "strength", "intelligence", "vitality", "focus", "discipline", "consistency",
    "who am i", "my stats", "my profile", "my progress", "how do i play"
  ];

  const generalTerms = [
    "python", "javascript", "typescript", "linux", "git", "machine learning", "ml", "ai",
    "artificial intelligence", "data science", "algorithm", "database", "sql", "css", "html",
    "physics", "chemistry", "biology", "history", "philosophy", "psychology",
    "study tips", "book recommendation", "calculus", "linear algebra"
  ];

  const hasGame = gameTerms.some((t) => q.includes(t));
  const hasGeneral = generalTerms.some((t) => q.includes(t));

  if (hasGame && hasGeneral) {
    return "mixed";
  }
  if (hasGame) {
    return "game";
  }

  const recentHistoryText = history.slice(-2).map((h) => (h.parts?.[0]?.text || "").toLowerCase()).join(" ");
  if (recentHistoryText && gameTerms.some((t) => recentHistoryText.includes(t))) {
    const followUpPatterns = ["why", "how", "what about", "more", "next", "explain", "when"];
    if (followUpPatterns.some((w) => q.includes(w)) && !hasGeneral) {
      return "game";
    }
  }

  return "general";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("[System AI] Function invoked:", req.method, new Date().toISOString());

  try {
    // 1. Authentication Check (Accepts user JWT, Authorization Bearer token, or project apikey)
    const authHeader = req.headers.get("Authorization");
    const apiKeyHeader = req.headers.get("apikey") || req.headers.get("x-api-key");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    let token = authHeader ? authHeader.replace(/^Bearer\s+/i, "").trim() : "";
    if (!token && apiKeyHeader) {
      token = apiKeyHeader.trim();
    }

    if (!token) {
      console.warn("[System AI] Missing Authorization or apikey header in request.");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Active player session or API key required." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let user: any = null;
    if (token !== supabaseAnonKey) {
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data } = await supabaseAuth.auth.getUser();
      user = data?.user || null;
    }

    const isAnonClient = token === supabaseAnonKey || apiKeyHeader === supabaseAnonKey;
    if (!user && !isAnonClient) {
      console.warn("[System AI] Auth validation failed. Invalid token/session.");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid or expired player session." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (user) {
      console.log("[System AI] Authenticated player verified. User ID:", user.id);
    } else {
      console.log("[System AI] Authorized client session verified via project anon key.");
    }

    // 2. Validate Request Body
    let body: any;
    try {
      body = await req.json();
    } catch {
      console.warn("[System AI] Malformed JSON payload received.");
      return new Response(
        JSON.stringify({ error: "Bad Request: Malformed JSON payload." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawMessage = body?.message;
    if (typeof rawMessage !== "string" || !rawMessage.trim()) {
      return new Response(
        JSON.stringify({ error: "Bad Request: Message must be a non-empty string." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const message = rawMessage.trim();
    if (message.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({
          error: `Bad Request: Message exceeds maximum allowed length of ${MAX_MESSAGE_LENGTH} characters.`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Validate & Bound History
    const rawHistory = Array.isArray(body?.history) ? body.history : [];
    const boundedHistory = rawHistory
      .slice(-MAX_HISTORY_MESSAGES)
      .filter((h: any) => h && typeof h.content === "string" && (h.role === "user" || h.role === "model" || h.role === "assistant"))
      .map((h: any) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: String(h.content).slice(0, MAX_MESSAGE_LENGTH) }],
      }));

    const intent = classifyQueryIntent(message, boundedHistory);
    console.log("[System AI] Request received. Intent:", intent, "Message length:", message.length, "History items:", boundedHistory.length);

    // 4. Fetch Authoritative Player Context from Supabase (if user is present)
    let playerContext = {
      rank: "F",
      level: 1,
      totalXP: 0,
      coins: 0,
      currentStreak: 0,
      bestStreak: 0,
      tasksCompleted: 0,
      stats: {
        strength: 10,
        intelligence: 10,
        vitality: 10,
        focus: 10,
        discipline: 10,
        consistency: 10,
      },
    };

    if (user) {
      const [{ data: progress }, { data: stats }, { count: questCount }] = await Promise.all([
        supabase.from("player_progress").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("player_stats").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("quest_completions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      if (progress) {
        playerContext.rank = progress.rank ?? "F";
        playerContext.level = progress.level ?? 1;
        playerContext.totalXP = progress.total_xp ?? 0;
        playerContext.coins = progress.coins ?? 0;
        playerContext.currentStreak = progress.current_streak ?? 0;
        playerContext.bestStreak = progress.best_streak ?? 0;
      }
      if (stats) {
        playerContext.stats = {
          strength: stats.strength ?? 10,
          intelligence: stats.intelligence ?? 10,
          vitality: stats.vitality ?? 10,
          focus: stats.focus ?? 10,
          discipline: stats.discipline ?? 10,
          consistency: stats.consistency ?? 10,
        };
      }
      playerContext.tasksCompleted = questCount ?? 0;
    }

    const playerContextPrompt = `
### ACTIVE PLAYER AUTHORITATIVE PROFILE
- Rank: ${playerContext.rank}
- Level: ${playerContext.level}
- Total XP: ${playerContext.totalXP} XP
- Soul Coins: ${playerContext.coins} 🪙
- Current Streak: ${playerContext.currentStreak} days (Historical Best: ${playerContext.bestStreak} days)
- Total Completed Quests: ${playerContext.tasksCompleted}
- Core Attributes: Strength ${playerContext.stats.strength}, Intelligence ${playerContext.stats.intelligence}, Vitality ${playerContext.stats.vitality}, Focus ${playerContext.stats.focus}, Discipline ${playerContext.stats.discipline}, Consistency ${playerContext.stats.consistency}
`.trim();

    // 5. Build System Instruction with Intent Directives
    let roleDirective = "";
    if (intent === "game") {
      roleDirective = `The user is inquiring about Habbits RPG. Ground your answer strictly in the AUTHORITATIVE GAME RULES and ACTIVE PLAYER AUTHORITATIVE PROFILE below. Evaluate missing criteria precisely and never invent rules.`;
    } else if (intent === "mixed") {
      roleDirective = `The user is asking a mixed question combining external concepts (e.g. computer science, machine learning, productivity methodologies) with Habbits RPG or habit mechanics. Answer comprehensively: explain the general concept naturally and clearly apply it to Habbits RPG or habit progression.`;
    } else if (intent === "help") {
      roleDirective = `The user is asking how to use System AI or what you can do. Explain your dual responsibilities: (1) Official authoritative guide for Habbits RPG progression, and (2) Helpful general conversational AI for programming, study tips, science, and general knowledge.`;
    } else {
      roleDirective = `The user is asking a general question outside Habbits RPG. Answer normally, helpfully, and articulately using your broad general knowledge. Do NOT refuse the question. Do NOT state that you only answer Habbits RPG questions. Do NOT display a game command menu. Do NOT force a connection to Habbits RPG unless directly relevant to the user's question.`;
    }

    const systemInstructionText = `
You are System AI, the intelligent assistant inside Habbits RPG.
Tone: Immersive, articulate, helpful, authoritative yet approachable, and focused on personal mastery and growth.

You have two primary responsibilities:
1. Act as the authoritative guide for Habbits RPG.
2. Act as a general conversational AI for questions outside the game.

CORE OPERATIONAL RULES:
- For Habbits RPG questions:
  * Use the supplied AUTHORITATIVE GAME RULES.
  * Never invent game mechanics, bosses, items, or ranks not defined in the rules.
  * Use actual player data when relevant from the ACTIVE PLAYER AUTHORITATIVE PROFILE.
  * If the player asks "Why am I not ranking up?" or "How close am I to next rank?", evaluate their exact stats, tasks, XP, streak, and boss victories against the next rank's exact requirements.
- For general questions:
  * Answer normally using your general knowledge.
  * Do not redirect the user back to Habbits RPG unless it is relevant.
- Never say that you can only answer Habbits RPG questions.
- Never display a command menu unless the user asks how to use System AI or the chat is initially empty.
- Never claim to have game data that was not supplied.
- You are strictly READ-ONLY: you cannot directly modify player data, award XP, grant coins, change ranks, or complete quests.

CURRENT CONTEXT DIRECTIVE:
${roleDirective}

${AUTHORITATIVE_GAME_RULES}

${playerContextPrompt}
`.trim();

    // 6. Gemini API Key Detection & Normalization
    let geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    let keySource = "GEMINI_API_KEY";

    if (!geminiApiKey) {
      const allEnv = Deno.env.toObject();
      for (const [k, v] of Object.entries(allEnv)) {
        if (k.includes("GEMINI_API_KEY") && v) {
          geminiApiKey = v.trim();
          keySource = k.replace(/[\r\n]/g, "\\n");
          break;
        }
      }
    }

    console.log(
      "[System AI] API key status:",
      geminiApiKey ? `PRESENT (length=${geminiApiKey.length}, source="${keySource}")` : "MISSING"
    );

    if (!geminiApiKey) {
      console.warn("[System AI] Fallback activated. Reason: GEMINI_API_KEY secret is not set in environment.");
      return new Response(
        JSON.stringify({
          error: "System AI is currently unavailable (GEMINI_API_KEY secret is not set on the server).",
          keyStatus: "MISSING",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

        // Query available models to select supported model
    let modelName = "gemini-2.0-flash";
    let apiVersion = "v1beta";

    let candidateModels: string[] = [];
    try {
      const listRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + geminiApiKey);
      if (listRes.ok) {
        const listData = await listRes.json();
        candidateModels = (listData.models || [])
          .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"))
          .map((m: any) => m.name.replace("models/", ""));

        console.log("[System AI] Supported generateContent models:", candidateModels.join(", "));
      }
    } catch (err: any) {
      console.warn("[System AI] Could not list models:", err?.message);
    }
    // Prioritize models that are actually reported as supported by the Google Generative Language API
    let modelsToTry: string[] = [];
    if (candidateModels.length > 0) {
      // Prioritize flash models from candidateModels
      const flashModels = candidateModels.filter((m: string) => m.includes("flash"));
      const otherModels = candidateModels.filter((m: string) => !m.includes("flash"));
      modelsToTry = [...flashModels, ...otherModels];
    } else {
      modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
    }

    let lastErrorStatus = 500;
    let lastErrorSnippet = "";
    let geminiData: any = null;

    for (const currentModel of modelsToTry) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${geminiApiKey}`;
      console.log(`[System AI] Attempting Gemini API call. Model: ${currentModel}.`);

      const geminiPayload = {
        systemInstruction: {
          parts: [{ text: systemInstructionText }],
        },
        contents: [
          ...boundedHistory,
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      };

      try {
        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiPayload),
        });

        if (geminiRes.ok) {
          geminiData = await geminiRes.json();
          console.log(`[System AI] Gemini response SUCCESS with model: ${currentModel}.`);
          break;
        } else {
          lastErrorStatus = geminiRes.status;
          const errorText = await geminiRes.text();
          lastErrorSnippet = errorText.slice(0, 300).replace(/key=([^&"'\s]+)/g, "key=[REDACTED]");
          console.warn(`[System AI] Model ${currentModel} returned HTTP ${lastErrorStatus}. Trying next model if available... Snippet: ${lastErrorSnippet}`);
        }
      } catch (fetchErr: any) {
        lastErrorSnippet = fetchErr?.message || "Fetch network error";
        console.warn(`[System AI] Network error calling ${currentModel}:`, lastErrorSnippet);
      }
    }

    if (!geminiData) {
      console.error("[System AI] All Gemini candidate models failed. Last status:", lastErrorStatus);
      console.warn("[System AI] Fallback activated. Reason: Gemini API HTTP " + lastErrorStatus);
      return new Response(
        JSON.stringify({
          error: `System AI encountered a transmission failure with Gemini (HTTP ${lastErrorStatus}).`,
          details: lastErrorSnippet,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[System AI] Gemini response SUCCESS. Status: 200.");

    const replyText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "System AI core received your query, but could not generate a response. Please rephrase.";

    return new Response(
      JSON.stringify({
        reply: replyText,
        intent,
        playerContext: {
          rank: playerContext.rank,
          level: playerContext.level,
          totalXP: playerContext.totalXP,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[System AI] Unhandled internal error:", err?.message || err);
    console.warn("[System AI] Fallback activated. Reason: unhandled exception");
    return new Response(
      JSON.stringify({ error: "System AI internal error. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

