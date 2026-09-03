import { supabase } from './supabase';
import type { Achievement } from '../types/game';

interface AchievementRow {
  id: string;
  title: string;
  description: string;
  requirement_type: 'quests_completed' | 'streak' | 'level' | 'coins';
  requirement_value: number;
}

export async function fetchAchievements(
  userId: string
): Promise<{ achievements: Achievement[]; rows: AchievementRow[] }> {
  const { data: rows, error: achError } = await supabase
    .from('achievements')
    .select('*');

  if (achError || !rows) {
    console.error('Failed to fetch achievements:', achError);
    return { achievements: [], rows: [] };
  }

  const { data: unlocked, error: unlockedError } = await supabase
    .from('user_achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', userId);

  if (unlockedError) console.error('Failed to fetch unlocks:', unlockedError);

  const unlockedMap = new Map(
    (unlocked ?? []).map((u) => [u.achievement_id, u.unlocked_at])
  );

  const achievements: Achievement[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    unlocked: unlockedMap.has(row.id),
    unlockedAt: unlockedMap.get(row.id) ?? undefined,
  }));

  return { achievements, rows: rows as AchievementRow[] };
}

export async function unlockAchievement(userId: string, achievementId: string) {
  const { error } = await supabase
    .from('user_achievements')
    .insert({ user_id: userId, achievement_id: achievementId });

  if (error) console.error('Failed to unlock achievement:', error);
}