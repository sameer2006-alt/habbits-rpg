import { supabase } from "./supabase";
import { getTitleById, type TitleDefinition } from "../data/titles";
import type { Player, Achievement } from "../types/game";

export type { TitleDefinition };

const STORAGE_PREFIX_TITLES = "rpg_player_unlocked_titles";
const STORAGE_PREFIX_EQUIPPED = "rpg_player_equipped_title";

export function getCachedUnlockedTitles(userId: string): string[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX_TITLES}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // safe fallback
  }
  return ["title_recruit"];
}

export function setCachedUnlockedTitles(userId: string, titles: string[]): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX_TITLES}_${userId}`, JSON.stringify(titles));
  } catch {
    // safe fallback
  }
}

export function getCachedEquippedTitle(userId: string): string | null {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX_EQUIPPED}_${userId}`);
  } catch {
    return null;
  }
}

export function setCachedEquippedTitle(userId: string, titleId: string | null): void {
  try {
    if (titleId) {
      localStorage.setItem(`${STORAGE_PREFIX_EQUIPPED}_${userId}`, titleId);
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX_EQUIPPED}_${userId}`);
    }
  } catch {
    // safe fallback
  }
}

/**
 * Fetches all title IDs unlocked by the user from Supabase.
 */
export async function fetchPlayerTitles(userId: string): Promise<string[]> {
  const cached = getCachedUnlockedTitles(userId);

  try {
    const { data, error } = await supabase
      .from("player_titles")
      .select("title_id")
      .eq("user_id", userId);

    if (!error && data) {
      const titles = Array.from(new Set(["title_recruit", ...data.map((r) => r.title_id)]));
      setCachedUnlockedTitles(userId, titles);
      return titles;
    }
  } catch {
    // safe fallback
  }

  return cached;
}

/**
 * Unlocks a title for the user in Supabase.
 */
export async function unlockPlayerTitle(userId: string, titleId: string): Promise<boolean> {
  const current = await fetchPlayerTitles(userId);
  if (current.includes(titleId)) return true;

  try {
    await supabase.from("player_titles").insert({
      id: `title_${userId}_${titleId}`,
      user_id: userId,
      title_id: titleId,
    });
    setCachedUnlockedTitles(userId, [...current, titleId]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches the currently equipped title for the user.
 */
export async function fetchEquippedTitle(userId: string): Promise<TitleDefinition | undefined> {
  const cachedId = getCachedEquippedTitle(userId);

  try {
    const { data, error } = await supabase
      .from("player_title_state")
      .select("equipped_title_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data && data.equipped_title_id) {
      setCachedEquippedTitle(userId, data.equipped_title_id);
      return getTitleById(data.equipped_title_id);
    }
  } catch {
    // safe fallback
  }

  return cachedId ? getTitleById(cachedId) : getTitleById("title_recruit");
}

/**
 * Equips a title. Enforces validation: player MUST own the title!
 */
export async function equipTitle(
  userId: string,
  titleId: string
): Promise<{ success: boolean; error?: string; title?: TitleDefinition }> {
  const definition = getTitleById(titleId);
  if (!definition) {
    return { success: false, error: "Invalid title ID" };
  }

  const unlocked = await fetchPlayerTitles(userId);
  if (!unlocked.includes(titleId)) {
    return { success: false, error: "You have not unlocked this title yet" };
  }

  setCachedEquippedTitle(userId, titleId);

  try {
    await supabase.from("player_title_state").upsert({
      user_id: userId,
      equipped_title_id: titleId,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // safe fallback
  }

  return { success: true, title: definition };
}

/**
 * Automatically evaluates progression milestones and unlocks eligible titles.
 */
export async function checkAndUnlockTitlesFromProgress(
  userId: string,
  player: Player,
  achievements: Achievement[],
  bossesSlainCount: number,
  perfectDayEarned: boolean
): Promise<string[]> {
  const newlyUnlocked: string[] = [];
  const currentTitles = await fetchPlayerTitles(userId);

  // 1. Recruit title always unlocked
  if (!currentTitles.includes("title_recruit")) {
    await unlockPlayerTitle(userId, "title_recruit");
    newlyUnlocked.push("title_recruit");
  }

  // 2. Pathfinder (FIRST_QUEST)
  const hasFirstQuest = achievements.some((a) => a.id === "FIRST_QUEST" && a.unlocked);
  if (hasFirstQuest && !currentTitles.includes("title_pathfinder")) {
    await unlockPlayerTitle(userId, "title_pathfinder");
    newlyUnlocked.push("title_pathfinder");
  }

  // 3. Disciplined (QUEST_50 or tasks >= 50)
  const has50Quests = achievements.some((a) => a.id === "QUEST_50" && a.unlocked);
  if (has50Quests && !currentTitles.includes("title_disciplined")) {
    await unlockPlayerTitle(userId, "title_disciplined");
    newlyUnlocked.push("title_disciplined");
  }

  // 4. Iron Flame (WEEK_WARRIOR or bestStreak >= 7)
  const hasWeekWarrior = achievements.some((a) => a.id === "WEEK_WARRIOR" && a.unlocked) || (player.progress.bestStreak >= 7);
  if (hasWeekWarrior && !currentTitles.includes("title_iron_flame")) {
    await unlockPlayerTitle(userId, "title_iron_flame");
    newlyUnlocked.push("title_iron_flame");
  }

  // 5. Boss Slayer (bossesSlain >= 1)
  if (bossesSlainCount >= 1 && !currentTitles.includes("title_boss_slayer")) {
    await unlockPlayerTitle(userId, "title_boss_slayer");
    newlyUnlocked.push("title_boss_slayer");
  }

  // 6. Routine Master (perfectDayEarned || PERFECT_DAY achievement)
  const hasPerfectDay = perfectDayEarned || achievements.some((a) => a.id === "PERFECT_DAY" && a.unlocked);
  if (hasPerfectDay && !currentTitles.includes("title_routine_master")) {
    await unlockPlayerTitle(userId, "title_routine_master");
    newlyUnlocked.push("title_routine_master");
  }

  // 7. Shadow Monarch (LEGEND achievement or rank Monarch)
  const hasMonarch = player.progress.level >= 100 || player.progress.rank === "MONARCH";
  if (hasMonarch && !currentTitles.includes("title_shadow_monarch")) {
    await unlockPlayerTitle(userId, "title_shadow_monarch");
    newlyUnlocked.push("title_shadow_monarch");
  }

  return newlyUnlocked;
}
