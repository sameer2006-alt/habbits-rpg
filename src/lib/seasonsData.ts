import { supabase } from "./supabase";
import {
  SEASON_LEVEL_THRESHOLDS,
  SEASON_MILESTONES,
  type SeasonDefinition,
  type PlayerSeason,
} from "../data/seasons";
import { addItemToInventory } from "./inventoryData";

export function getCurrentSeasonWindow(customDate?: Date): SeasonDefinition {
  const now = customDate ? new Date(customDate) : new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();
  const curDay = now.getDate();

  // Anchor: 2026-09-01 (Launch date of Habbits RPG)
  // We use UTC midnight to calculate exact calendar days elapsed independent of DST
  const currentMidnightUTC = Date.UTC(curYear, curMonth, curDay);
  const anchorMidnightUTC = Date.UTC(2026, 8, 1); // 2026-09-01

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((currentMidnightUTC - anchorMidnightUTC) / MS_PER_DAY);

  // Continuous 15-day season index (0-indexed, clamped to 0 for pre-launch dates)
  const seasonIndex = Math.max(0, Math.floor(diffDays / 15));
  const seasonNumber = seasonIndex + 1;

  // Exact 15-day start and end dates (inclusive: day 0 to 14 = exactly 15 calendar days)
  const seasonStartMs = anchorMidnightUTC + (seasonIndex * 15 * MS_PER_DAY);
  const seasonEndMs = seasonStartMs + (14 * MS_PER_DAY);

  const sStartDate = new Date(seasonStartMs);
  const sEndDate = new Date(seasonEndMs);

  const startYear = sStartDate.getUTCFullYear();
  const startMonth = String(sStartDate.getUTCMonth() + 1).padStart(2, "0");
  const startDay = String(sStartDate.getUTCDate()).padStart(2, "0");
  const startDate = `${startYear}-${startMonth}-${startDay}`;

  const endYear = sEndDate.getUTCFullYear();
  const endMonth = String(sEndDate.getUTCMonth() + 1).padStart(2, "0");
  const endDay = String(sEndDate.getUTCDate()).padStart(2, "0");
  const endDate = `${endYear}-${endMonth}-${endDay}`;

  // Countdown to the end of the final day (23:59:59.999 local)
  const endDateTime = new Date(sEndDate.getUTCFullYear(), sEndDate.getUTCMonth(), sEndDate.getUTCDate(), 23, 59, 59, 999);
  const diffMs = Math.max(0, endDateTime.getTime() - now.getTime());
  const daysRemaining = Math.max(1, Math.ceil(diffMs / MS_PER_DAY));

  // Preserve legacy IDs for early seasons, generate standard unique IDs thereafter
  let seasonId: string;
  if (seasonNumber === 1) {
    seasonId = "SEASON_2026_09_A";
  } else if (seasonNumber === 2) {
    seasonId = "SEASON_2026_09_B";
  } else if (seasonNumber === 3) {
    seasonId = "SEASON_2026_10_A";
  } else if (seasonNumber === 4) {
    seasonId = "SEASON_2026_10_B";
  } else {
    seasonId = `SEASON_${startYear}_${startMonth}_${startDay}`;
  }

  const themes = [
    "The Hunter's Awakening",
    "Cybernetic Resurgence",
    "The Neon Crucible",
    "Titan Suppression Cycle",
    "Apex Resonance",
    "The Void Incursion",
    "Quantum Vanguard",
    "Protocol Zenith",
  ];
  const theme = themes[(seasonNumber - 1) % themes.length];

  return {
    id: seasonId,
    seasonNumber,
    name: `SEASON ${String(seasonNumber).padStart(2, "0")}: "${theme}"`,
    theme,
    startDate,
    endDate,
    daysRemaining,
    milestones: SEASON_MILESTONES,
  };
}

export function calculateSeasonLevel(seasonXP: number): number {
  for (let lvl = SEASON_LEVEL_THRESHOLDS.length; lvl >= 1; lvl--) {
    if (seasonXP >= SEASON_LEVEL_THRESHOLDS[lvl - 1]) {
      return lvl;
    }
  }
  return 1;
}

const SEASON_STORAGE_KEY_PREFIX = "habbits_rpg_player_season_";

export async function getOrCreatePlayerSeason(
  userId: string,
  customDate?: Date
): Promise<PlayerSeason> {
  const season = getCurrentSeasonWindow(customDate);
  const storageKey = `${SEASON_STORAGE_KEY_PREFIX}${userId}_${season.id}`;

  try {
    const { data, error } = await supabase
      .from("player_seasons")
      .select("*")
      .eq("user_id", userId)
      .eq("season_id", season.id)
      .maybeSingle();

    if (!error && data) {
      const ps: PlayerSeason = {
        id: data.id,
        userId: data.user_id,
        seasonId: data.season_id,
        seasonXP: data.season_xp,
        seasonLevel: data.season_level,
        milestonesClaimed: Array.isArray(data.milestones_claimed) ? (data.milestones_claimed as number[]) : [],
        completed: data.completed,
        rewardClaimed: data.reward_claimed,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      localStorage.setItem(storageKey, JSON.stringify(ps));
      return ps;
    }
  } catch (err) {
    console.warn("Supabase player season fetch fallback:", err);
  }

  const cached = localStorage.getItem(storageKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as PlayerSeason;
      if (parsed.seasonId === season.id && parsed.userId === userId) {
        return parsed;
      }
    } catch {
      // invalid cache
    }
  }

  const newPs: PlayerSeason = {
    id: `ps_${userId}_${season.id}`,
    userId,
    seasonId: season.id,
    seasonXP: 0,
    seasonLevel: 1,
    milestonesClaimed: [],
    completed: false,
    rewardClaimed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await supabase.from("player_seasons").insert({
      id: newPs.id,
      user_id: newPs.userId,
      season_id: newPs.seasonId,
      season_xp: newPs.seasonXP,
      season_level: newPs.seasonLevel,
      milestones_claimed: newPs.milestonesClaimed as any,
      completed: newPs.completed,
      reward_claimed: newPs.rewardClaimed,
      created_at: newPs.createdAt,
      updated_at: newPs.updatedAt,
    });
  } catch (insertErr) {
    console.warn("Supabase player season insert fallback:", insertErr);
  }

  localStorage.setItem(storageKey, JSON.stringify(newPs));
  return newPs;
}

export async function addSeasonXP(
  userId: string,
  amount: number,
  customDate?: Date
): Promise<{
  playerSeason: PlayerSeason;
  leveledUp: boolean;
  newLevel: number;
}> {
  const current = await getOrCreatePlayerSeason(userId, customDate);
  const newXP = current.seasonXP + Math.max(0, amount);
  const newLevel = calculateSeasonLevel(newXP);
  const leveledUp = newLevel > current.seasonLevel;
  const completed = newLevel >= 10;

  const updated: PlayerSeason = {
    ...current,
    seasonXP: newXP,
    seasonLevel: newLevel,
    completed: completed || current.completed,
    updatedAt: new Date().toISOString(),
  };

  const storageKey = `${SEASON_STORAGE_KEY_PREFIX}${userId}_${current.seasonId}`;
  localStorage.setItem(storageKey, JSON.stringify(updated));

  try {
    await supabase
      .from("player_seasons")
      .update({
        season_xp: updated.seasonXP,
        season_level: updated.seasonLevel,
        completed: updated.completed,
        updated_at: updated.updatedAt,
      })
      .eq("id", updated.id)
      .eq("user_id", userId);
  } catch (err) {
    console.warn("Supabase season xp update error:", err);
  }

  return {
    playerSeason: updated,
    leveledUp,
    newLevel,
  };
}

export async function claimSeasonMilestone(
  userId: string,
  milestoneLevel: number,
  customDate?: Date
): Promise<{
  success: boolean;
  reward?: { xp: number; coins: number; itemId?: string; titleId?: string };
  playerSeason: PlayerSeason;
}> {
  const playerSeason = await getOrCreatePlayerSeason(userId, customDate);
  const milestone = SEASON_MILESTONES.find((m) => m.level === milestoneLevel);

  if (!milestone) return { success: false, playerSeason };
  if (playerSeason.seasonLevel < milestoneLevel) return { success: false, playerSeason };
  if (playerSeason.milestonesClaimed.includes(milestoneLevel)) return { success: false, playerSeason };

  playerSeason.milestonesClaimed.push(milestoneLevel);
  if (milestoneLevel === 10) {
    playerSeason.rewardClaimed = true;
  }
  playerSeason.updatedAt = new Date().toISOString();

  if (milestone.rewardItemId) {
    await addItemToInventory(userId, milestone.rewardItemId, 1);
  }

  const storageKey = `${SEASON_STORAGE_KEY_PREFIX}${userId}_${playerSeason.seasonId}`;
  localStorage.setItem(storageKey, JSON.stringify(playerSeason));

  try {
    await supabase
      .from("player_seasons")
      .update({
        milestones_claimed: playerSeason.milestonesClaimed as any,
        reward_claimed: playerSeason.rewardClaimed,
        updated_at: playerSeason.updatedAt,
      })
      .eq("id", playerSeason.id)
      .eq("user_id", userId);
  } catch (err) {
    console.warn("Supabase milestone claim update error:", err);
  }

  return {
    success: true,
    reward: {
      xp: milestone.rewardXP,
      coins: milestone.rewardCoins,
      itemId: milestone.rewardItemId,
      titleId: milestone.rewardTitleId,
    },
    playerSeason,
  };
}
