import { supabase } from './supabase';

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: string;
  owned: boolean;
}

export async function fetchRewards(userId: string): Promise<RewardItem[]> {
  const { data: rewards, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error || !rewards) {
    console.error('Failed to fetch rewards:', error);
    return [];
  }

  const { data: owned } = await supabase
    .from('user_rewards')
    .select('reward_id')
    .eq('user_id', userId);

  const ownedIds = new Set((owned ?? []).map((o) => o.reward_id));

  return rewards.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    cost: r.cost,
    type: r.type,
    owned: ownedIds.has(r.id),
  }));
}

export async function addReward(
  userId: string,
  reward: { title: string; description: string; cost: number; type: string }
) {
  const { error } = await supabase.from('rewards').insert({
    user_id: userId,
    title: reward.title,
    description: reward.description,
    cost: reward.cost,
    type: reward.type,
    is_active: true,
  });
  if (error) console.error('Failed to add reward:', error);
  return !error;
}

export async function purchaseReward(
  userId: string,
  rewardId: string,
  cost: number,
  currentCoins: number
): Promise<{ success: boolean; error?: string }> {
  if (currentCoins < cost) return { success: false, error: 'Not enough coins' };

  const { data: existing } = await supabase
    .from('user_rewards')
    .select('id')
    .eq('user_id', userId)
    .eq('reward_id', rewardId)
    .maybeSingle();

  if (existing) return { success: false, error: 'Already owned' };

  const { error: insertError } = await supabase
    .from('user_rewards')
    .insert({ user_id: userId, reward_id: rewardId });

  if (insertError) return { success: false, error: 'Purchase failed' };

  const { error: updateError } = await supabase
    .from('player_progress')
    .update({ coins: currentCoins - cost })
    .eq('user_id', userId);

  if (updateError) return { success: false, error: 'Coin deduction failed' };

  return { success: true };
}