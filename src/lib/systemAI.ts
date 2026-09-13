import { supabase } from "./supabase";
import { RANK_DEFINITIONS, getRankDefinition, checkSpecialCondition } from "../data/ranks";
import { BOSSES } from "../data/bosses";
import { QUEST_REWARD_LIMITS } from "../data/quests";

export interface SystemAIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface SystemAIResponse {
  success: boolean;
  reply?: string;
  error?: string;
}

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 10;

export interface SystemAIPlayerContext {
  rank: string;
  level: number;
  totalXP: number;
  coins: number;
  currentStreak: number;
  bestStreak: number;
  tasksCompleted: number;
  bossesSlain: number;
  powerScore?: number;
  equippedTitle?: string;
  equippedGear?: { weapon?: string; armor?: string; accessory?: string };
  activeRandomEvent?: string;
  weeklyChallenge?: {
    title: string;
    progress: string;
    objectives: string;
    expiresAt: string;
    completed: boolean;
  };
  monthlyChallenge?: {
    title: string;
    objectives: string;
    daysRemaining: number;
    completed: boolean;
  };
  playerSeason?: {
    name: string;
    level: number;
    xp: number;
    daysRemaining: number;
  };
  personalRecords?: Record<string, number>;
  analyticsSummary?: {
    totalQuests: number;
    totalXP: number;
    mostActiveDay: string;
  };
  stats: {
    strength: number;
    intelligence: number;
    vitality: number;
    focus: number;
    discipline: number;
    consistency: number;
  };
}

/**
 * Clean client service to invoke the Supabase Edge Function `system-ai`.
 * Note: Never contains or reads GEMINI_API_KEY directly.
 */
export async function askSystemAI(
  message: string,
  history: SystemAIMessage[],
  playerContext?: SystemAIPlayerContext
): Promise<SystemAIResponse> {
  const trimmed = message.trim();
  if (!trimmed) {
    return { success: false, error: "Please enter a question or query." };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `Query exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }

  const boundedHistory = history
    .slice(-MAX_HISTORY_MESSAGES)
    .map((h) => ({ role: h.role === "assistant" ? "model" : "user", content: h.content }));

  // 1. Attempt to invoke the Supabase Edge Function
  console.log("[System AI Client] Dispatching query to Supabase Edge Function 'system-ai'...");
  try {
    const { data, error } = await supabase.functions.invoke("system-ai", {
      body: {
        message: trimmed,
        history: boundedHistory,
      },
    });

    if (!error && data?.reply) {
      console.log("[System AI Client] Edge Function succeeded. Live AI response received.");
      return { success: true, reply: data.reply };
    }

    if (error) {
      console.warn("[System AI Client] Edge Function returned error:", error.message || error);
    }
  } catch (err: any) {
    console.warn("[System AI Client] Edge Function invocation exception:", err?.message || err);
  }

  // 2. Safe Local Rule-Engine Fallback
  console.log("[System AI Client] Activating authoritative local fallback response.");
  const fallbackReply = generateAuthoritativeLocalResponse(trimmed, playerContext);
  return { success: true, reply: fallbackReply };
}

/**
 * Detects whether a query is explicitly directed at Habbits RPG mechanics or lore.
 */
export function isGameRelatedQuery(query: string): boolean {
  const q = query.toLowerCase().trim();

  // Core Habbits RPG keywords
  const gameKeywords = [
    "habbits", "habbits rpg", "life-system", "habit tracking app", "habit tracker",
    "rank", "ranks", "ranking", "tier", "ascension", "demote", "demotion",
    "xp", "exp", "level", "levels", "leveling",
    "boss", "bosses", "ignis", "vortex", "malakor", "leviathan", "raid", "raids",
    "quest", "quests", "daily quest", "custom quest", "task", "tasks",
    "soul coin", "soul coins", "coin", "coins", "shop", "double xp elixir", "coin magnet", "blade of focus",
    "streak", "streaks", "achievement", "achievements",
    "directive", "directives", "daily directive", "daily directives",
    "perfect day", "calendar", "streak calendar", "random event", "random events",
    "armory", "inventory", "equipment", "loadout", "loadouts", "power score", "title", "titles",
    "strength", "intelligence", "vitality", "focus", "discipline", "consistency", "attribute", "attributes",
    "who am i", "my stats", "my profile", "my progress", "how do i play"
  ];

  return gameKeywords.some((k) => q.includes(k));
}

/**
 * Checks if the user explicitly requested help, menu, or capabilities.
 */
export function isHelpQuery(query: string): boolean {
  const q = query.toLowerCase().trim();
  return (
    q === "help" ||
    q === "menu" ||
    q.includes("how to use system ai") ||
    q.includes("what can you do") ||
    q.includes("list commands") ||
    q.includes("help menu")
  );
}

/**
 * Classifies local intent for fallback routing.
 */
export function classifyLocalQueryIntent(query: string): "game" | "general" | "help" {
  if (isHelpQuery(query)) {
    return "help";
  }

  // Specific indicators of technical or external queries
  const generalTechnicalTerms = [
    "python", "javascript", "typescript", "linux", "git", "machine learning", "ml", "ai",
    "artificial intelligence", "data science", "algorithm", "database", "sql", "css", "html",
    "physics", "chemistry", "biology", "history", "philosophy", "psychology",
    "study tips", "book recommendation", "calculus", "linear algebra"
  ];
  const q = query.toLowerCase();
  const hasGeneral = generalTechnicalTerms.some((t) => q.includes(t));
  if (hasGeneral) {
    return "general";
  }

  if (isGameRelatedQuery(query)) {
    return "game";
  }

  return "general";
}

/**
 * Evaluates authoritative rules locally when edge runtime is unavailable.
 */
export function generateAuthoritativeLocalResponse(
  query: string,
  context?: SystemAIPlayerContext
): string {
  const intent = classifyLocalQueryIntent(query);

  if (intent === "help") {
    return `### SYSTEM AI // CAPABILITIES & DIRECTIVES
I am **System AI**, your tactical game guide and general intelligent assistant.

1. **Habbits RPG Systems**:
   - **Ascension & Ranks**: Ask *"Why am I not ranking up?"* or *"How do ranks work?"*
   - **Attributes & Profile**: Ask *"What are my current stats?"* or *"How does XP work?"*
   - **Raid Encounters**: Ask *"How do bosses work?"* or *"What boss am I fighting?"*
   - **Quests & Economy**: Ask *"How do custom quests work?"* or *"How does the shop work?"*

2. **General Knowledge & Conversational Assistant**:
   - Ask questions about coding, machine learning, mathematics, history, or science (e.g. *"What is Python?"*, *"What is machine learning?"*).
   - Ask for study habits, focus techniques, and daily productivity advice.
   - Ask mixed questions (e.g. *"How can machine learning be used in a habit tracking app?"*).

How may I assist you?`;
  }

  if (intent === "general") {
    return "General AI is temporarily unavailable. Game-system questions can still be answered from the local Habbits RPG knowledge base.";
  }

  const q = query.toLowerCase();

  // Why am I not ranking up? / Next rank query
  if (q.includes("why am i not ranking") || q.includes("why didn't i rank") || q.includes("how close am i") || q.includes("next rank")) {
    if (!context) {
      return "To analyze your rank ascension, I require your active player stats. Complete quests and check your Rank Progression page.";
    }

    const currentRankDef = getRankDefinition(context.rank);
    const nextRankIndex = currentRankDef.tierOrder + 1;
    const nextRank = RANK_DEFINITIONS.find((r) => r.tierOrder === nextRankIndex);

    if (!nextRank) {
      return `### Transcendent Rank Achieved\nYou have ascended to **${currentRankDef.name}** (${currentRankDef.id}), the pinnacle tier of Habbits RPG. There are no higher mortal ranks! Continue dominating your daily habits.`;
    }

    const missingItems: string[] = [];
    if (context.totalXP < nextRank.requiredXP) {
      missingItems.push(`- **XP**: You have ${context.totalXP} / ${nextRank.requiredXP} XP (Need **${nextRank.requiredXP - context.totalXP} more**)`);
    }
    if (context.tasksCompleted < nextRank.requiredTasks) {
      missingItems.push(`- **Completed Tasks**: You have ${context.tasksCompleted} / ${nextRank.requiredTasks} tasks (Need **${nextRank.requiredTasks - context.tasksCompleted} more**)`);
    }
    const effectiveStreak = Math.max(context.currentStreak, context.bestStreak);
    if (effectiveStreak < nextRank.requiredStreak) {
      missingItems.push(`- **Streak Consistency**: Your best streak is ${effectiveStreak} / ${nextRank.requiredStreak} days (Need **${nextRank.requiredStreak - effectiveStreak} more days**)`);
    }

    if (nextRank.specialConditionKey) {
      const conditionPassed = checkSpecialCondition(nextRank.specialConditionKey, context.stats, context.bossesSlain);
      if (!conditionPassed) {
        if (nextRank.specialConditionKey.startsWith("boss_")) {
          const reqBoss = parseInt(nextRank.specialConditionKey.split("_")[1], 10);
          missingItems.push(`- **Boss Raids (${nextRank.specialConditionText})**: Defeated ${context.bossesSlain} / ${reqBoss} Bosses (Need **${reqBoss - context.bossesSlain} more victory**)`);
        } else if (nextRank.specialConditionKey === "stat_20") {
          const maxStat = Math.max(...Object.values(context.stats));
          missingItems.push(`- **Attribute Mastery (${nextRank.specialConditionText})**: Highest stat is ${maxStat} / 20 (Need at least one stat >= 20)`);
        } else if (nextRank.specialConditionKey === "stat_35") {
          const maxStat = Math.max(...Object.values(context.stats));
          missingItems.push(`- **Attribute Mastery (${nextRank.specialConditionText})**: Highest stat is ${maxStat} / 35 (Need at least one stat >= 35)`);
        } else if (nextRank.specialConditionKey === "all_stats_50") {
          const failingStats = Object.entries(context.stats).filter(([, val]) => val < 50);
          const list = failingStats.map(([s, val]) => `${s}: ${val}/50`).join(", ");
          missingItems.push(`- **Balanced Mastery (${nextRank.specialConditionText})**: Insufficient stats in: ${list}`);
        } else {
          missingItems.push(`- **Special Requirement**: ${nextRank.specialConditionText}`);
        }
      }
    }

    if (missingItems.length === 0) {
      return `### Ascension Ready\nYou currently satisfy all requirements for **${nextRank.name} (${nextRank.id})**! Complete any pending daily task to trigger your rank promotion.`;
    }

    return `### Ascension Protocol: ${currentRankDef.name} (${currentRankDef.id}) ➔ ${nextRank.name} (${nextRank.id})\n\nYou are currently progressing toward Rank **${nextRank.id}**. Here is what is still required:\n\n${missingItems.join("\n")}\n\n*Anti-Demotion Guarantee is active: your rank is permanently locked once achieved.*`;
  }

  // What is Habbits RPG? / How do I play?
  if (q.includes("what is habbits") || q.includes("how do i play") || q.includes("how to play")) {
    return `### SYSTEM AI // PROTOCOL OVERVIEW
**Habbits RPG** transforms personal self-discipline into a dark-fantasy role-playing experience.
1. **Quests**: Real-life habits (exercise, study, hydration, reading) are your daily battle quests. Complete them daily to earn XP, Soul Coins, and increase Core Attributes.
2. **Levels & XP**: Every quest grants XP. Your Level is computed purely from your total cumulative XP: \`Level = floor(sqrt(Total_XP / 50))\`.
3. **Ranks**: 10 hierarchical tiers (F ➔ LEGENDARY) unlocked by conquering XP, task counts, streaks, attribute thresholds, and boss raids.
4. **Boss Arena**: Weekly and monthly raid bosses take fixed damage whenever you finish a daily quest. Slaying them grants massive rewards!
5. **Shop**: Spend your earned Soul Coins on buffs like Double XP Elixirs, Coin Magnets, and legendary gear.`;
  }

  // How does XP / Level work?
  if (q.includes("xp work") || q.includes("how does xp") || q.includes("level work") || q.includes("how do levels") || q.includes("how much xp")) {
    return `### XP & Level Mechanics
- **Earning XP**: Completing standard quests rewards 50–150 XP. Custom quests can grant up to **300 XP**.
- **Level Formula**: \`Level = floor(sqrt(Total_XP / 50))\`.
- **Level Independence**: Your Level measures cumulative lifetime effort and never decreases or resets.
- **Buffs**: Using a **Double XP Elixir** doubles quest XP for your next 3 tasks, and the **Blade of Focus** adds a permanent +10% passive XP multiplier!`;
  }

  // How do ranks work? / How to rank up?
  if (q.includes("rank work") || q.includes("how do ranks") || q.includes("how to rank up") || q.includes("how do i rank up")) {
    return `### The 10 Authoritative Ranks
Progression proceeds sequentially from **F ➔ LEGENDARY**:
1. **F (Awakened Recruit)**: Baseline (0 XP)
2. **E (Trainee Hunter)**: 500 XP, 8 Tasks, 2-day Streak
3. **D (Scout Vanguard)**: 1,500 XP, 25 Tasks, 4-day Streak
4. **C (Elite Striker)**: 4,500 XP, 60 Tasks, 7-day Streak + Highest Stat ≥ 20
5. **B (Shadow Blade)**: 9,000 XP, 100 Tasks, 10-day Streak
6. **A (Abyssal Conqueror)**: 14,000 XP, 150 Tasks, 12-day Streak + Highest Stat ≥ 35
7. **S (Shadow Monarch)**: 20,000 XP, 200 Tasks, 14-day Streak + Slay 1 Boss
8. **SS (Grand Sovereign)**: 32,000 XP, 300 Tasks, 21-day Streak + Slay 2 Bosses
9. **HEROIC (Paragon)**: 50,000 XP, 450 Tasks, 30-day Streak + Slay 3 Bosses
10. **LEGENDARY (Mythic God of Discipline)**: 75,000 XP, 650 Tasks, 45-day Streak + All 6 Stats ≥ 50

*Ranks are permanent: your rank will never demote even if your streak breaks.*`;
  }

  // How do bosses work?
  if (q.includes("boss work") || q.includes("how do bosses") || q.includes("boss arena") || q.includes("bosses") || q.includes("boss")) {
    const list = BOSSES.map(b => `- **${b.name}** (${b.cadence}): ${b.maxHp} HP (${b.damagePerQuest} DMG/quest) — Bounty: +${b.rewards.xp} XP, +${b.rewards.coins} Coins`).join("\n");
    return `### Boss Arena Mechanics
Every daily quest you complete strikes all active bosses in the current cycle for fixed damage:
${list}

- **Weekly Raids**: Ignis (1200 HP) and Vortex (1500 HP) cycle every 7 days.
- **Monthly Apex Raids**: Malakor (5000 HP) and Leviathan (7000 HP) cycle every 30 days.
- **Victory Spoils**: Slaying a boss unlocks large XP bounties, Soul Coins, permanent attribute bonuses, and exclusive titles!`;
  }

  // How does the shop work?
  if (q.includes("shop work") || q.includes("how does the shop") || q.includes("rewards work") || q.includes("shop")) {
    return `### Shop & Marketplace
Redeem your earned **Soul Coins** for powerful tactical consumables:
- **Double XP Elixir** (75 Coins): Doubles XP reward for the next 3 completed quests.
- **Coin Magnet** (60 Coins): Increases coin yield by +50% for 24 hours.
- **Blade of Focus** (350 Coins): Permanent passive gear granting +10% XP on all quests.
- **Custom Rewards**: Set your own real-world rewards (e.g. cheat meal, gaming session) to keep motivation high!`;
  }

  // How do custom quests work?
  if (q.includes("custom quest") || q.includes("create quest") || q.includes("quest limits") || q.includes("quests work")) {
    return `### Custom Quests & Security Economy
You can create custom quests with tailored goals. To prevent game exploits, the System enforces strict centralized limits:
- **XP Reward**: Min ${QUEST_REWARD_LIMITS.minXP} XP, Max ${QUEST_REWARD_LIMITS.maxXP} XP
- **Coin Reward**: Min ${QUEST_REWARD_LIMITS.minCoins} Coins, Max ${QUEST_REWARD_LIMITS.maxCoins} Coins
- **Stat Reward**: Min ${QUEST_REWARD_LIMITS.minStatReward}, Max ${QUEST_REWARD_LIMITS.maxStatReward} Points
- **Once-Per-Day Rule**: A quest can only be completed once per day. Deleting and recreating the same task cannot bypass this limit.`;
  }

  // What are my current stats?
  if (q.includes("my stats") || q.includes("current stats") || q.includes("my profile") || q.includes("who am i")) {
    if (!context) {
      return "Your player profile is currently synchronizing with the neural mainframe. Please complete a quest or refresh.";
    }
    return `### ACTIVE PLAYER STATUS REPORT
- **Current Rank**: **${context.rank}**
- **Honorary Title**: **${context.equippedTitle || "Awakened Novice"}**
- **Power Score**: **${(context.powerScore || 0).toLocaleString()}** ⚡
- **Level**: Level **${context.level}** (${context.totalXP} Total XP)
- **Soul Coins**: **${context.coins}** 🪙
- **Completed Quests**: **${context.tasksCompleted}**
- **Daily Streak**: **${context.currentStreak}** days (Historical Best: **${context.bestStreak}** days)
- **Boss Victories**: **${context.bossesSlain}** Bosses Slain
${context.equippedGear ? `- **Equipped Gear**: Weapon: ${context.equippedGear.weapon || "None"} | Armor: ${context.equippedGear.armor || "None"} | Accessory: ${context.equippedGear.accessory || "None"}\n` : ""}${context.activeRandomEvent ? `- **Active Event**: ${context.activeRandomEvent}\n` : ""}- **Core Attributes**:
  - Strength: **${context.stats.strength}**
  - Intelligence: **${context.stats.intelligence}**
  - Vitality: **${context.stats.vitality}**
  - Focus: **${context.stats.focus}**
  - Discipline: **${context.stats.discipline}**
  - Consistency: **${context.stats.consistency}**`;
  }

  // How does Power Score work?
  if (q.includes("power score") || q.includes("power")) {
    return `### Power Score Formula (Phase 3)
Power Score is a single dynamic composite rating representing your total hunter combat effectiveness:
- **Level**: +100 pts per Level
- **Rank Tier**: +500 pts per Rank Tier (F = 0, E = 500, up to LEGENDARY = 4,500)
- **Effective Stats**: +10 pts per Stat point (including equipped gear bonuses)
- **Completed Quests**: +15 pts per Completed Quest
- **Best Streak**: +25 pts per Best Streak Day
- **Boss Victories**: +150 pts per Slayed Boss
- **Achievements**: +50 pts per Unlocked Achievement

*Power Score is 100% deterministic and automatically recalculates when stats or equipment change.*`;
  }

  // Monthly Challenge Query (Phase 4.2)
  if (q.includes("monthly") || q.includes("monthly challenge")) {
    if (context?.monthlyChallenge) {
      const mc = context.monthlyChallenge;
      return `### Active Monthly Campaign: ${mc.title}
- **Status**: ${mc.completed ? "CAMPAIGN CONQUERED ✦" : `In Progress (${mc.daysRemaining} days remaining)`}
- **Objectives**: ${mc.objectives}
- **Tactical Directive**: Monthly campaigns reward massive XP (+2,000–3,000), Soul Coins (+400–600), and Epic armory gear!`;
    }
    return `### Monthly Challenges (Phase 4.2)
Monthly Challenges are sector-wide campaigns running across the calendar month:
- **Major Objectives**: Requires completing 60–90 quests, acquiring 3,500–4,500 XP, conquering boss raids, and attaining multiple Perfect Days.
- **Apex Rewards**: Grants top-tier XP (+2,000–3,000), Soul Coins (+400–600), and guaranteed Epic Armory equipment upon completing all criteria.`;
  }

  // 15-Day Season Query (Phase 4.3)
  if (q.includes("season") || q.includes("seasonal")) {
    if (context?.playerSeason) {
      const ps = context.playerSeason;
      return `### Current 15-Day Season: ${ps.name}
- **Season Number**: Sequential season progression (Season 01, Season 02, etc.)
- **Season Level**: Level ${ps.level} / 10
- **Season XP**: ${ps.xp.toLocaleString()} XP
- **Time Remaining**: ${ps.daysRemaining} days remaining
- **Note**: Permanent progression (Level, Rank, permanent XP, base stats, inventory, equipment) never resets when the season rolls over! Only seasonal XP and season level refresh.`;
    }
    return `### 15-Day Seasonal Trials (Phase 4.3)
Seasons run in repeating 15-day windows (Days 1–15, Days 16–End of month), numbered sequentially starting from **Season 01**, **Season 02**, **Season 03**, etc.:
- **Level 1 to 10**: Advance through bounded levels by completing quests, directives, and bosses.
- **Milestone Rewards**: Unlock coins, XP, and rare gear at levels 2, 4, 6, 8, and the exclusive Season Champion Title at Level 10!
- **Zero Loss**: Permanent stats, gear, and lifetime rank are preserved across seasons.`;
  }

  // Personal Records & Lifetime Statistics Query (Phase 4.4)
  if (q.includes("record") || q.includes("personal record") || q.includes("lifetime") || q.includes("longest streak") || q.includes("highest power")) {
    if (context?.personalRecords) {
      const pr = context.personalRecords;
      return `### Personal Records & Lifetime Statistics (Phase 4.4)
**Personal Records (High-Water Marks)**:
- **Longest Streak**: ${pr.longest_streak || 0} days
- **Highest Power Score**: ${(pr.highest_power_score || 0).toLocaleString()} PWR
- **Most Quests in One Day**: ${pr.most_quests_one_day || 0} quests
- **Most XP in One Day**: ${(pr.most_xp_one_day || 0).toLocaleString()} XP
- **Peak Season Level**: Level ${pr.highest_season_level || 1}

**Lifetime Statistics (Cumulative Totals)**:
- **Total Quests Completed**: ${pr.total_quests_completed || context.tasksCompleted} quests
- **Total XP Earned**: ${(pr.total_xp_earned || context.totalXP).toLocaleString()} XP
- **Bosses Defeated**: ${pr.total_bosses_defeated || context.bossesSlain} bosses
- **Total Perfect Days**: ${pr.total_perfect_days || 0} days

*Note: Personal Records strictly increase and never decrease, while Lifetime Statistics represent cumulative counters.*`;
    }
    return `### Personal Records vs Lifetime Statistics (Phase 4.4)
- **Personal Records**: High-water marks representing your all-time peaks (Longest Streak, Highest Power Score, Single-Day Quest & XP records). These strictly increase and never degrade.
- **Lifetime Statistics**: Cumulative career counters (Total Quests, Total XP, Bosses Defeated, Perfect Days) that increment as you play.`;
  }

  // Analytics Query (Phase 4.5)
  if (q.includes("analytics") || q.includes("intelligence") || q.includes("most active") || q.includes("how many quests")) {
    if (context?.analyticsSummary) {
      const an = context.analyticsSummary;
      return `### Player Telemetry & Intelligence Summary
- **Quests Completed (Recent Window)**: ${an.totalQuests} quests
- **XP Earned**: ${an.totalXP.toLocaleString()} XP
- **Most Active Day**: ${an.mostActiveDay}
- **Neural Insight**: Consistent daily quest completion reliably elevates your weekly and monthly sector progression.`;
    }
    return `### Player Intelligence & Analytics (Phase 4.5)
Available on your Profile & Stats page: Inspect 7-day, 30-day, 90-day, and all-time telemetry to see quest averages, XP trends, consistency rates, and peak activity days.`;
  }

  // What is my Weekly Challenge?
  if (q.includes("weekly") || q.includes("weekly challenge")) {
    if (context?.weeklyChallenge) {
      const wk = context.weeklyChallenge;
      return `### Active Weekly Challenge: ${wk.title}
- **Status**: ${wk.completed ? "COMPLETED ✦" : `In Progress (${wk.progress})`}
- **Objectives**: ${wk.objectives}
- **Expiration**: Ends Sunday at midnight (${wk.expiresAt}).
- **Tactical Advice**: Completing quests, defeating raid bosses, earning Perfect Days, and training stats directly power your weekly objectives!`;
    }
    return `### Weekly Challenges (Phase 4.1)
Weekly Challenges are multi-objective trials spanning Monday through Sunday:
- **Diverse Objectives**: Track quests completed, XP earned, Soul Coins gained, Boss victories, Perfect Days, and stat gains.
- **High-Tier Rewards**: Earn massive XP (+700–1000 XP), Soul Coins (+200–350), and rare gear loot upon completing all objectives.
- **Idempotent & Expirable**: Rewards are granted once upon completing all objectives. Once the week concludes on Sunday night, the challenge expires and a fresh challenge begins Monday!`;
  }

  // How does Equipment & Loadouts work?
  // How does the Armory, Equipment, Inventory & Loadouts work?
  if (q.includes("equipment") || q.includes("gear") || q.includes("loadout") || q.includes("armory") || q.includes("inventory")) {
    return `### Armory, Equipment & Loadouts (Phase 3)
- **3 Equipment Slots**: Equip one Weapon, one Armor, and one Accessory.
- **Effective Combat Stats**: Equipped items grant stat bonuses (e.g. +8 STR, +4 DIS). Your base stats are never permanently modified, preventing corruption.
- **Inventory**: Stores all acquired items grouped by Equipment, Consumables, and Special Trophies.
- **Loadout Presets (Max 5)**: Save up to 5 complete equipment configurations in the Armory. Loadout activation atomically verifies that you own all assigned gear before equipping.`;
    return `### Armory Architecture (Phase 3 & Phase 4 Polish)
The Armory manages what you own, what you equip, and how your Hunter is built:
- **INVENTORY**: Things you own (Equipment, Consumables, and Special Trophies).
- **EQUIPMENT**: Things you're currently using across 3 slots (Weapon, Armor, Accessory). Equipment bonuses are non-destructive and never corrupt your base attributes.
- **LOADOUTS**: Saved equipment combinations (up to 5 presets). Equipping a loadout replaces your current gear with the saved setup.
- **TITLES**: Achievements and honorary identities you've unlocked to broadcast across your profile.
- **POWER SCORE**: A calculated composite rating representing your overall progression strength derived from level, rank, effective stats, streak, and gear.`;
  }

  // How do Titles work?
  if (q.includes("title") || q.includes("titles")) {
    return `### Hunter Prestige Titles (Phase 3)
Titles are honorary designations unlocked through major discipline milestones:
- **Awakened Novice**: Default awakening title.
- **Pathfinder**: Unlocked upon conquering your first quest.
- **Disciplined Veteran**: Unlocked after 50 completed quests.
- **Iron Flame**: Unlocked by maintaining a 7-day streak.
- **Apex Vanquisher**: Awarded upon striking down a Raid Boss.
- **Master of Routine**: Awarded for achieving a Perfect Day.
- **Shadow Monarch**: Awarded upon reaching Level 100 or ascending to Monarch rank.
Equipping a title broadcasts your prestige across your hunter profile!`;
  }

  // How does the Streak Calendar work?
  if (q.includes("calendar") || q.includes("streak calendar") || q.includes("history")) {
    return `### Historical Streak Calendar (Phase 2.3)
Located in your **Profile & Stats** page:
- Displays your complete monthly activity history with intuitive month navigation.
- Color-coded cells indicate: Complete Day (Green), Partial Day (Orange), Inactive Day (Muted), and Perfect Day (Golden Star).
- Click any calendar date cell to inspect exact quests completed, XP earned, and Perfect Day status.`;
  }

  // How do Random Events work?
  if (q.includes("random event") || q.includes("event") || q.includes("random events")) {
    return `### Controlled Daily Random Events (Phase 2.4)
Random events bring emergent tactical variety to daily routines:
- **Deterministic Assignment**: Generated once per user per calendar day. Anti-reroll safeguards guarantee page refreshes never roll a different event.
- **Bounded Progress**: Tasks advance event objectives up to a fixed target.
- **Expiring & Idempotent**: Events expire at midnight and rewards can only ever be claimed once per cycle.`;
  }

  // How do streaks work?
  if (q.includes("streak") || q.includes("how do streaks")) {
    return `### Streak Mechanics
- Completing your daily habit quota increments your current streak by 1.
- Failing to complete daily quests within the reset period resets current streak to 0.
- **Anti-Demotion Protection**: Your rank and achievements are locked to your **Historical Best Streak**, so a broken streak will never demote your rank!`;
  }

  // How do achievements work?
  if (q.includes("achievement")) {
    return `### Achievements System
Achievements represent milestone accomplishments across 5 categories:
1. **Quest Count**: 1, 10, 25, 50, 100, 250, 500, 1000 completed quests.
2. **Streak Consistency**: 3, 7, 14, 30, 60, 90, 100, 365-day streaks.
3. **Levels**: Level 5, 10, 25, 50, 100.
4. **Soul Coins**: 50, 100, 500, 1000, 5000 coins accumulated.
5. **Core Stats**: Achieving 25, 50, or 75 points in specific attributes.
Unlocking achievements grants prestige badges and rewards!`;
  }

  // How do daily directives work?
  if (q.includes("directive") || q.includes("daily directive")) {
    return `### Daily Directives System (Phase 2.1)
A **Daily Directive** is a temporary tactical mission assigned to you each calendar day:
- **One Directive per Day**: Generated deterministically for each hunter each calendar date.
- **Mission Types**: Complete a target number of quests (e.g. 3 or 5 quests), train a specific Core Attribute (e.g. Focus, Discipline, Strength), or maintain consistency.
- **Bonus Rewards**: Accomplishing today's directive awards bonus XP (+60 to +100 XP), Soul Coins (+15 to +30 Coins), and occasional Stat points!
- **Strict Idempotency**: Directive rewards can only be claimed once per day and expire naturally when the new calendar day begins.`;
  }

  // Fallback for general Habbits RPG questions
  return `### Habbits RPG Sovereign Guide
You can ask about:
- **Ranks**: 10 sequential tiers from F (Awakened Recruit) to LEGENDARY (Mythic God of Discipline).
- **Boss Arena**: 4 raid encounters (Ignis 1200 HP, Vortex 1500 HP, Malakor 5000 HP, Leviathan 7000 HP).
- **Quests & Armory**: Quests, equipment, loadouts, titles, and Power Score calculation.
- **Daily Systems**: Daily Directives, Perfect Day milestones, and Controlled Random Events.
- **Progression**: Inquire about *"Why am I not ranking up?"* or *"What are my current stats?"*`;
}
