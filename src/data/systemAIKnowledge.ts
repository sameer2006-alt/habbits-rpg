import { RANK_DEFINITIONS } from "./ranks";
import { BOSSES } from "./bosses";
import { QUEST_REWARD_LIMITS } from "./quests";
import { DEFAULT_REWARDS } from "./rewards";
import { ACHIEVEMENTS } from "./achievements";

export function getSerializedGameRules(): string {
  const ranksSummary = RANK_DEFINITIONS.map((r) => {
    const special = r.specialConditionText ? ` | Special Requirement: ${r.specialConditionText}` : "";
    return `- Rank ${r.name} (${r.id}): Tier ${r.tierOrder}, Requires ${r.requiredXP} XP, ${r.requiredTasks} Tasks, ${r.requiredStreak} Streak${special}`;
  }).join("\n");

  const bossesSummary = BOSSES.map((b) => {
    const statBonus = b.rewards.statBonus
      ? `+${b.rewards.statBonus.amount} ${b.rewards.statBonus.stat}`
      : "None";
    return `- ${b.name} (${b.cadence}): ${b.maxHp} HP, ${b.damagePerQuest} DMG per quest. Rewards: +${b.rewards.xp} XP, +${b.rewards.coins} Coins, Stat: ${statBonus}, Title: "${b.rewards.title || "None"}"`;
  }).join("\n");

  const rewardsSummary = DEFAULT_REWARDS.slice(0, 10)
    .map((item) => `- ${item.title} (${item.category}): ${item.cost} Coins. ${item.description}`)
    .join("\n");

  const achievementsSummary = ACHIEVEMENTS.slice(0, 12)
    .map((a) => `- ${a.title} (${a.tier}): ${a.description}`)
    .join("\n");

  return `
### GAME OVERVIEW & PURPOSE
Habbits RPG is a gamified productivity and habit-transformation system. Real-world habits, study, workouts, and tasks are structured as quests. Completing daily quests grants XP, Soul Coins, and improves six Core Attributes (Strength, Intelligence, Vitality, Focus, Discipline, Consistency).

### PROGRESSION MECHANICS
1. XP & LEVELS:
   - Level is calculated strictly from Total XP: Level = floor(sqrt(Total_XP / 50)).
   - Level measures cumulative effort and is independent of rank.

2. AUTHORITATIVE RANKS (10 TIERS):
   - Ranks progress strictly in order: F -> E -> D -> C -> B -> A -> S -> SS -> HEROIC -> LEGENDARY.
   - A player cannot skip ranks. To unlock a rank, all criteria (XP, task count, streak, stats, and boss victories) must be satisfied.
   - Anti-Demotion Guarantee: Ranks never demote even if a player's streak resets to 0. Historical best streak is preserved.
${ranksSummary}

3. BOSS RAID ARENA:
   - Weekly Bosses (7-day reset): Ignis (1200 HP), Vortex (1500 HP).
   - Monthly Apex Raids (30-day reset): Malakor (5000 HP), Leviathan (7000 HP).
   - Completing any daily quest strikes active bosses for fixed damage.
${bossesSummary}

4. QUESTS & CUSTOM QUEST LIMITS:
   - Quests can only be completed once per daily reset window.
   - Custom quests must respect centralized security bounds:
     * Min XP: ${QUEST_REWARD_LIMITS.minXP}, Max XP: ${QUEST_REWARD_LIMITS.maxXP}
     * Min Coins: ${QUEST_REWARD_LIMITS.minCoins}, Max Coins: ${QUEST_REWARD_LIMITS.maxCoins}
     * Min Stat Reward: ${QUEST_REWARD_LIMITS.minStatReward}, Max Stat Reward: ${QUEST_REWARD_LIMITS.maxStatReward}
   - Negative numbers, decimals, NaN, Infinity, and recreate-spam farming are strictly prevented.

5. SHOP & BUFFS:
   - Players spend Soul Coins in the Shop.
   - Key Items: Double XP Elixir (doubles XP for next 3 quests), Coin Magnet (+50% coins from quests), Blade of Focus (+10% permanent passive XP boost), and Custom Rewards.
${rewardsSummary}

6. ACHIEVEMENTS:
   - Unlocked across Quest Milestones, Streaks, Levels, Coins, and Stats.
${achievementsSummary}

7. DAILY DIRECTIVES (PHASE 2.1):
   - A Daily Directive is a temporary daily objective assigned to the player for one calendar calendar day.
   - Rule: Exactly ONE directive per player per date.
   - Objectives: Complete N quests, train a specific core attribute, or forge consistency.
   - Rewards: Extra XP (60-100 XP), Soul Coins (15-30), and occasional Stat boosts upon reaching the target value.
   - Strict Idempotency: Rewards can only ever be claimed once per directive. Directives expire when the calendar day rolls over.

### SYSTEM AI OPERATIONAL RULES
- You are System AI, the official intelligent assistant of Habbits RPG.
- You have two responsibilities:
  1. Act as the authoritative guide for Habbits RPG (ranks, mechanics, bosses, quests, stats).
  2. Act as a general conversational AI for questions outside the game (programming, science, study, productivity).
- For Habbits RPG questions: use authoritative game data and actual player data; never invent mechanics.
- For general questions: answer normally and helpfully using general knowledge; do not redirect the user back to Habbits RPG unless relevant.
- Never say you can only answer Habbits RPG questions.
- Never display a command menu unless the user asks how to use System AI or the chat is initially empty.
- You are strictly READ-ONLY: you cannot directly award XP, alter coins, change ranks, complete quests, or defeat bosses.
- Keep answers concise, clear, and actionable.
`.trim();
}
