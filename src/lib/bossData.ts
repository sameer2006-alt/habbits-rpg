import { BOSSES, type BossDef } from "../data/bosses";
import { addItemToInventory } from "./inventoryData";
import { unlockPlayerTitle } from "./titlesData";

export interface BossProgress {
  bossId: string;
  currentHp: number;
  defeated: boolean;
  claimed: boolean;
  totalDamageDealt: number;
  lastResetPeriod: string; // e.g. "2026-W36" or "2026-M09"
}

function getPeriodString(cadence: "WEEKLY" | "MONTHLY"): string {
  const now = new Date();
  if (cadence === "MONTHLY") {
    return `${now.getFullYear()}-M${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  // Weekly: approximate week number of year
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

const STORAGE_KEY_V3 = "rpg_boss_progress_v3";
const LEGACY_STORAGE_KEY_V1 = "rpg_boss_progress_v1";

export function getBossProgressMap(userId: string): Record<string, BossProgress> {
  try {
    const rawV3 = localStorage.getItem(`${STORAGE_KEY_V3}_${userId}`);
    if (rawV3) {
      return JSON.parse(rawV3);
    }

    // Migrate from legacy v1 if v3 is not yet created
    const rawV1 = localStorage.getItem(`${LEGACY_STORAGE_KEY_V1}_${userId}`);
    if (rawV1) {
      const oldMap: Record<string, any> = JSON.parse(rawV1);
      const migratedMap: Record<string, BossProgress> = {};

      for (const boss of BOSSES) {
        const oldState = oldMap[boss.id];
        const currentPeriod = getPeriodString(boss.cadence);

        if (oldState && oldState.lastResetPeriod === currentPeriod) {
          const totalDmg = Math.max(
            0,
            typeof oldState.totalDamageDealt === "number"
              ? oldState.totalDamageDealt
              : typeof oldState.currentHp === "number"
              ? Math.max(0, boss.maxHp - oldState.currentHp)
              : 0
          );

          const calculatedHp = Math.max(0, Math.min(boss.maxHp, boss.maxHp - totalDmg));
          // Strict: A boss is only defeated if actual damage dealt reaches the new maxHp
          const isDefeated = calculatedHp === 0 && totalDmg >= boss.maxHp;

          migratedMap[boss.id] = {
            bossId: boss.id,
            currentHp: calculatedHp,
            defeated: isDefeated,
            claimed: isDefeated ? Boolean(oldState.claimed) : false,
            totalDamageDealt: totalDmg,
            lastResetPeriod: currentPeriod,
          };
        } else {
          migratedMap[boss.id] = {
            bossId: boss.id,
            currentHp: boss.maxHp,
            defeated: false,
            claimed: false,
            totalDamageDealt: 0,
            lastResetPeriod: currentPeriod,
          };
        }
      }

      localStorage.setItem(`${STORAGE_KEY_V3}_${userId}`, JSON.stringify(migratedMap));
      return migratedMap;
    }

    return {};
  } catch {
    return {};
  }
}

export function saveBossProgressMap(userId: string, data: Record<string, BossProgress>) {
  try {
    localStorage.setItem(`${STORAGE_KEY_V3}_${userId}`, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save boss progress:", err);
  }
}

export function getOrInitBossState(userId: string, boss: BossDef): BossProgress {
  const map = getBossProgressMap(userId);
  const currentPeriod = getPeriodString(boss.cadence);
  const existing = map[boss.id];

  // If already exists and matches current period, reconcile and return it
  if (existing && existing.lastResetPeriod === currentPeriod) {
    let needsUpdate = false;
    const totalDmg = Math.max(0, typeof existing.totalDamageDealt === "number" ? existing.totalDamageDealt : 0);
    const calculatedHp = Math.max(0, Math.min(boss.maxHp, boss.maxHp - totalDmg));
    const isDefeated = calculatedHp === 0 && totalDmg >= boss.maxHp;

    if (existing.currentHp !== calculatedHp || existing.currentHp > boss.maxHp || existing.currentHp < 0) {
      existing.currentHp = calculatedHp;
      needsUpdate = true;
    }

    if (existing.defeated !== isDefeated) {
      existing.defeated = isDefeated;
      if (!isDefeated) existing.claimed = false;
      needsUpdate = true;
    }

    if (needsUpdate) {
      map[boss.id] = existing;
      saveBossProgressMap(userId, map);
    }
    return existing;
  }

  // Otherwise reset / initialize fresh for new period
  const fresh: BossProgress = {
    bossId: boss.id,
    currentHp: boss.maxHp,
    defeated: false,
    claimed: false,
    totalDamageDealt: 0,
    lastResetPeriod: currentPeriod,
  };

  map[boss.id] = fresh;
  saveBossProgressMap(userId, map);
  return fresh;
}

export function applyDamageToBosses(
  userId: string,
  damageAmount?: number
): { defeatedBosses: BossDef[] } {
  const map = getBossProgressMap(userId);
  const newlyDefeated: BossDef[] = [];

  for (const boss of BOSSES) {
    const state = getOrInitBossState(userId, boss);
    if (state.defeated) continue;

    const dmg = damageAmount ?? boss.damagePerQuest;
    const newHp = Math.max(0, state.currentHp - dmg);
    state.currentHp = newHp;
    state.totalDamageDealt += dmg;

    if (newHp === 0 && !state.defeated) {
      state.defeated = true;
      newlyDefeated.push(boss);
      recordLifetimeBossDefeat(userId, boss.id, state.lastResetPeriod);
    }

    map[boss.id] = state;
  }

  saveBossProgressMap(userId, map);
  return { defeatedBosses: newlyDefeated };
}

export function recordLifetimeBossDefeat(userId: string, bossId: string, period?: string) {
  try {
    const keyV2 = `lifetime_bosses_defeated_v2_${userId}`;
    const rawV2 = localStorage.getItem(keyV2);
    const listV2: string[] = rawV2 ? JSON.parse(rawV2) : [];
    const entryId = period ? `${bossId}#${period}` : bossId;

    if (!listV2.includes(entryId)) {
      listV2.push(entryId);
      localStorage.setItem(keyV2, JSON.stringify(listV2));
    }

    // Maintain backward-compatible v1 record
    const keyV1 = `lifetime_bosses_defeated_${userId}`;
    const rawV1 = localStorage.getItem(keyV1);
    const listV1: string[] = rawV1 ? JSON.parse(rawV1) : [];
    if (!listV1.includes(bossId)) {
      listV1.push(bossId);
      localStorage.setItem(keyV1, JSON.stringify(listV1));
    }
  } catch (err) {
    console.error("Failed to record lifetime boss defeat:", err);
  }
}

export function claimBossReward(
  userId: string,
  bossId: string
): { success: boolean; boss?: BossDef } {
  const boss = BOSSES.find((b) => b.id === bossId);
  if (!boss) return { success: false };

  const map = getBossProgressMap(userId);
  const state = map[bossId];
  if (!state || !state.defeated || state.claimed) {
    return { success: false };
  }

  state.claimed = true;
  map[bossId] = state;
  saveBossProgressMap(userId, map);
  recordLifetimeBossDefeat(userId, bossId, state.lastResetPeriod);

  // Deep RPG Subsystem: Drop boss-exclusive equipment into player inventory
  const bossDropMap: Record<string, string> = {
    ignis: "wpn_sunfire_blade",
    vortex: "arm_obsidian_aegis",
    malakor: "wpn_voidcaller_saber",
    leviathan: "acc_monarch_sigil",
  };
  const dropItemId = bossDropMap[bossId] || "spc_ignis_ember";
  void addItemToInventory(userId, dropItemId, 1);

  // Unlock Apex Vanquisher title
  void unlockPlayerTitle(userId, "title_boss_slayer");

  return { success: true, boss };
}

export function getDefeatedBossesCount(userId: string): number {
  let v2Count = 0;
  let v1Count = 0;
  try {
    const v2Raw = localStorage.getItem(`lifetime_bosses_defeated_v2_${userId}`);
    if (v2Raw) {
      const list = JSON.parse(v2Raw);
      if (Array.isArray(list)) v2Count = list.length;
    }
    const v1Raw = localStorage.getItem(`lifetime_bosses_defeated_${userId}`);
    if (v1Raw) {
      const list = JSON.parse(v1Raw);
      if (Array.isArray(list)) v1Count = list.length;
    }
  } catch {
    // fallback
  }

  const map = getBossProgressMap(userId);
  const currentCount = Object.values(map).filter((s) => s.defeated || s.claimed).length;

  return Math.max(v2Count, v1Count, currentCount);
}



