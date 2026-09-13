import { supabase } from './supabase';
import type { Achievement } from '../types/game';
import { ACHIEVEMENTS, type RequirementType } from '../data/achievements';

export interface AchievementRow {
  id: string;
  title: string;
  description: string;
  requirement_type: RequirementType | string;
  requirement_value: number;
}

export async function fetchAchievements(
  userId: string
): Promise<{ achievements: Achievement[]; rows: AchievementRow[] }> {
  // Built-in rows from local definitions as primary source
  const localRows: AchievementRow[] = ACHIEVEMENTS.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    requirement_type: def.requirementType,
    requirement_value: def.requirementValue,
  }));

  const { data: rows, error: achError } = await supabase
    .from('achievements')
    .select('*');

  if (achError) {
    console.error('Supabase achievements error (using local definitions):', achError);
  }

  const { data: unlocked, error: unlockedError } = await supabase
    .from('user_achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', userId);

  if (unlockedError) console.error('Failed to fetch unlocks:', unlockedError);

  // Read local cache of unlocked achievements
  const localCacheKey = `unlocked_achievements_${userId}`;
  const localUnlockedIds = new Set<string>();
  try {
    const raw = localStorage.getItem(localCacheKey);
    if (raw) {
      const list: string[] = JSON.parse(raw);
      list.forEach((id) => localUnlockedIds.add(id));
    }
  } catch {
    // safe fallback
  }

  // Merge DB unlocks into set
  const unlockedMap = new Map<string, string | undefined>();
  (unlocked ?? []).forEach((u) => {
    unlockedMap.set(u.achievement_id, u.unlocked_at);
    localUnlockedIds.add(u.achievement_id);
  });

  // Also include items from local cache in unlockedMap
  localUnlockedIds.forEach((id) => {
    if (!unlockedMap.has(id)) {
      unlockedMap.set(id, new Date().toISOString());
    }
  });

  // Sync merged unlocks back to local storage
  try {
    localStorage.setItem(localCacheKey, JSON.stringify(Array.from(localUnlockedIds)));
  } catch {
    // safe fallback
  }

  const defMap = new Map(ACHIEVEMENTS.map((d) => [d.id, d]));

  // Start with local achievements
  const achievements: Achievement[] = ACHIEVEMENTS.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    icon: def.icon,
    tier: def.tier,
    unlocked: unlockedMap.has(def.id),
    unlockedAt: unlockedMap.get(def.id) ?? undefined,
  }));

  // If Supabase has additional achievements not in local definitions, merge them in
  if (rows && Array.isArray(rows)) {
    for (const r of rows) {
      if (!defMap.has(r.id)) {
        achievements.push({
          id: r.id,
          title: r.title,
          description: r.description,
          icon: 'star',
          tier: 'BRONZE',
          unlocked: unlockedMap.has(r.id),
          unlockedAt: unlockedMap.get(r.id) ?? undefined,
        });
        localRows.push({
          id: r.id,
          title: r.title,
          description: r.description,
          requirement_type: r.requirement_type ?? 'quests_completed',
          requirement_value: r.requirement_value ?? 1,
        });
      }
    }
  }

  return { achievements, rows: localRows };
}

export async function unlockAchievement(userId: string, achievementId: string) {
  // Update local cache immediately
  const localCacheKey = `unlocked_achievements_${userId}`;
  try {
    const raw = localStorage.getItem(localCacheKey);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(achievementId)) {
      list.push(achievementId);
      localStorage.setItem(localCacheKey, JSON.stringify(list));
    }
  } catch {
    // safe fallback
  }

  try {
    const { error } = await supabase
      .from('user_achievements')
      .upsert(
        { user_id: userId, achievement_id: achievementId },
        { onConflict: 'user_id,achievement_id' }
      );

    if (error) {
      // If upsert failed due to no unique index, fallback to insert
      await supabase
        .from('user_achievements')
        .insert({ user_id: userId, achievement_id: achievementId });
    }
  } catch (err) {
    console.warn('Network error or duplicate achievement unlock:', err);
  }
}