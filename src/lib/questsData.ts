import { supabase } from './supabase';
import type { Quest } from '../types/game';

export async function fetchQuests(userId: string): Promise<Quest[]> {
  const { data: questRows, error: questError } = await supabase
    .from('quests')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (questError || !questRows) {
    console.error('Failed to fetch quests:', questError);
    return [];
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

  return questRows.map((q) => ({
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

export async function recordQuestCompletion(
  userId: string,
  questId: string,
  xpEarned: number,
  coinsEarned: number
): Promise<boolean> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

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
  const { error } = await supabase.from('quests').insert({
    user_id: userId,
    title: quest.title,
    description: quest.description,
    category: quest.category,
    xp_reward: quest.xpReward,
    coin_reward: quest.coinReward,
    stat_reward: quest.stat,
    stat_amount: quest.statAmount,
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