import { supabase } from './supabase';
import type { Quest } from '../types/game';
import { initialQuests, validateAndSanitizeQuestReward } from '../data/quests';

export async function fetchQuests(userId: string): Promise<Quest[]> {
  const { data: questRows, error: questError } = await supabase
    .from('quests')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (questError) {
    console.error('Failed to fetch quests:', questError);
  }

  // If user has 0 active quests, check if any quests ever existed before seeding
  if (!questRows || questRows.length === 0) {
    const { data: anyQuests } = await supabase
      .from('quests')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (!anyQuests || anyQuests.length === 0) {
      await seedDefaultQuests(userId);
      const { data: reloaded } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (reloaded && reloaded.length > 0) {
        return reloaded.map((q) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          category: q.category,
          xpReward: q.xp_reward,
          coinReward: q.coin_reward,
          statReward: { stat: q.stat_reward, amount: q.stat_amount },
          completed: false,
        }));
      }
    }
    // Fallback if offline/DB unavailable
    return initialQuests;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: completions, error: completionsError } = await supabase
    .from('quest_completions')
    .select('quest_id')
    .eq('user_id', userId)
    .gte('completed_at', todayStart.toISOString());

  if (completionsError) {
    console.error('Failed to fetch completions:', completionsError);
  }

  const completedIds = new Set((completions ?? []).map((c) => c.quest_id));

  // DEDUPLICATION: Group active quests by normalized title.
  // If duplicates exist in DB, keep the completed one (or first one) and deactivate the rest.
  const titleMap = new Map<string, typeof questRows[0]>();
  const duplicateIdsToDeactivate: string[] = [];

  for (const q of questRows) {
    const key = q.title.trim().toLowerCase();
    const isCompleted = completedIds.has(q.id);

    if (!titleMap.has(key)) {
      titleMap.set(key, q);
    } else {
      const existing = titleMap.get(key)!;
      const existingIsCompleted = completedIds.has(existing.id);

      if (isCompleted && !existingIsCompleted) {
        duplicateIdsToDeactivate.push(existing.id);
        titleMap.set(key, q);
      } else {
        duplicateIdsToDeactivate.push(q.id);
      }
    }
  }

  // Deactivate redundant duplicate rows in Supabase so database is cleaned up
  if (duplicateIdsToDeactivate.length > 0) {
    void supabase
      .from('quests')
      .update({ is_active: false })
      .in('id', duplicateIdsToDeactivate);
  }

  const deduplicatedRows = Array.from(titleMap.values());

  return deduplicatedRows.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    category: q.category,
    xpReward: q.xp_reward,
    coinReward: q.coin_reward,
    statReward: { stat: q.stat_reward, amount: q.stat_amount },
    completed: completedIds.has(q.id),
  }));
}

export async function seedDefaultQuests(userId: string) {
  const { data: existingQuests } = await supabase
    .from('quests')
    .select('title')
    .eq('user_id', userId);

  const existingTitles = new Set((existingQuests ?? []).map((q) => q.title.trim().toLowerCase()));

  for (const q of initialQuests) {
    if (existingTitles.has(q.title.trim().toLowerCase())) {
      continue; // Skip if quest title already exists
    }
    await supabase.from('quests').insert({
      user_id: userId,
      title: q.title,
      description: q.description,
      category: q.category,
      xp_reward: q.xpReward,
      coin_reward: q.coinReward,
      stat_reward: q.statReward.stat,
      stat_amount: q.statReward.amount,
      is_active: true,
    });
  }
}

export async function recordQuestCompletion(
  userId: string,
  questId: string,
  xpEarned: number,
  coinsEarned: number
): Promise<boolean> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 1. Direct check by quest_id
  const { data: existing } = await supabase
    .from('quest_completions')
    .select('id')
    .eq('user_id', userId)
    .eq('quest_id', questId)
    .gte('completed_at', todayStart.toISOString())
    .maybeSingle();

  if (existing) {
    console.warn('Quest already completed today, skipping.');
    return false;
  }

  // 2. Anti-exploit check: verify no quest with the same title was completed today
  const { data: currentQuest } = await supabase
    .from('quests')
    .select('title')
    .eq('id', questId)
    .maybeSingle();

  if (currentQuest?.title) {
    const normalizedTitle = currentQuest.title.trim().toLowerCase();
    const { data: todayCompletions } = await supabase
      .from('quest_completions')
      .select('quest_id')
      .eq('user_id', userId)
      .gte('completed_at', todayStart.toISOString());

    if (todayCompletions && todayCompletions.length > 0) {
      const todayQuestIds = todayCompletions.map((c) => c.quest_id);
      const { data: completedQuests } = await supabase
        .from('quests')
        .select('title')
        .in('id', todayQuestIds);

      const titleCompletedToday = (completedQuests ?? []).some(
        (q) => q.title && q.title.trim().toLowerCase() === normalizedTitle
      );

      if (titleCompletedToday) {
        console.warn('A quest with this title was already completed today, skipping.');
        return false;
      }
    }
  }

  const { error } = await supabase.from('quest_completions').insert({
    user_id: userId,
    quest_id: questId,
    xp_earned: xpEarned,
    coins_earned: coinsEarned,
  });

  if (error) {
    console.error('Failed to record quest completion:', error);
    return false;
  }

  return true;
}

export async function addQuest(
  userId: string,
  quest: {
    title: string;
    description: string;
    category: string;
    xpReward: number;
    coinReward: number;
    stat: string;
    statAmount: number;
  }
) {
  const normalizedTitle = quest.title.trim().toLowerCase();
  if (!normalizedTitle) return false;

  // Validate and sanitize reward limits (minXP: 1, maxXP: 300, minCoins: 0, maxCoins: 100, minStat: 0, maxStat: 10)
  const { sanitized } = validateAndSanitizeQuestReward(
    quest.xpReward,
    quest.coinReward,
    quest.statAmount
  );

  // Check if a quest with this title already exists for this user (active or inactive)
  const { data: existingQuests } = await supabase
    .from('quests')
    .select('id, title, is_active')
    .eq('user_id', userId);

  const existingMatch = (existingQuests ?? []).find(
    (q) => q.title && q.title.trim().toLowerCase() === normalizedTitle
  );

  if (existingMatch) {
    // If it exists, reactivate it and update properties, preserving the original id
    const { error } = await supabase
      .from('quests')
      .update({
        is_active: true,
        title: quest.title.trim(),
        description: quest.description.trim(),
        category: quest.category,
        xp_reward: sanitized.xpReward,
        coin_reward: sanitized.coinReward,
        stat_reward: quest.stat,
        stat_amount: sanitized.statAmount,
      })
      .eq('id', existingMatch.id);

    if (error) console.error('Failed to reactivate quest:', error);
    return !error;
  }

  const { error } = await supabase.from('quests').insert({
    user_id: userId,
    title: quest.title.trim(),
    description: quest.description.trim(),
    category: quest.category,
    xp_reward: sanitized.xpReward,
    coin_reward: sanitized.coinReward,
    stat_reward: quest.stat,
    stat_amount: sanitized.statAmount,
    is_active: true,
  });

  if (error) console.error('Failed to add quest:', error);
  return !error;
}

export async function deactivateQuest(userId: string, questId: string) {
  const { error } = await supabase
    .from('quests')
    .update({ is_active: false })
    .eq('id', questId)
    .eq('user_id', userId);

  if (error) console.error('Failed to remove quest:', error);
  return !error;
}

export async function fetchTotalQuestsCompleted(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('quest_completions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (!error && typeof count === 'number') {
      localStorage.setItem(`total_quests_completed_${userId}`, String(count));
      return count;
    }
  } catch (err) {
    console.warn('Failed to count completions from Supabase:', err);
  }

  const saved = localStorage.getItem(`total_quests_completed_${userId}`);
  return saved ? parseInt(saved, 10) || 0 : 0;
}
