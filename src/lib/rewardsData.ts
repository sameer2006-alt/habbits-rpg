import { supabase } from './supabase';
import { DEFAULT_REWARDS, type ItemRarity, type RewardCategory } from '../data/rewards';
import { addItemToInventory } from './inventoryData';
import { getItemById } from '../data/items';

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: string;
  category: RewardCategory;
  rarity: ItemRarity;
  icon: string;
  owned: boolean;
}

export async function fetchRewards(userId: string): Promise<RewardItem[]> {
  const { data: userCustomRows, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) {
    console.error('Supabase rewards fetch error:', error);
  }

  const { data: ownedRows } = await supabase
    .from('user_rewards')
    .select('reward_id')
    .eq('user_id', userId);

  const ownedIds = new Set((ownedRows ?? []).map((o) => o.reward_id));
  try {
    const localOwned: string[] = JSON.parse(localStorage.getItem(`owned_rewards_${userId}`) || "[]");
    localOwned.forEach((id) => ownedIds.add(id));
  } catch {
    // safe fallback
  }

  // Build the catalog list starting with default 27+ rewards
  const catalogMap = new Map<string, RewardItem>();

  for (const def of DEFAULT_REWARDS) {
    catalogMap.set(def.id, {
      id: def.id,
      title: def.title,
      description: def.description,
      cost: def.cost,
      type: def.category,
      category: def.category,
      rarity: def.rarity,
      icon: def.icon,
      owned: ownedIds.has(def.id),
    });
  }

  // Merge in any custom rewards created by the user
  if (userCustomRows && Array.isArray(userCustomRows)) {
    for (const r of userCustomRows) {
      if (!catalogMap.has(r.id)) {
        catalogMap.set(r.id, {
          id: r.id,
          title: r.title,
          description: r.description,
          cost: r.cost,
          type: r.type || 'real_life',
          category: 'real_life',
          rarity: r.cost >= 1000 ? 'LEGENDARY' : r.cost >= 500 ? 'EPIC' : r.cost >= 200 ? 'RARE' : 'COMMON',
          icon: 'gift',
          owned: ownedIds.has(r.id),
        });
      }
    }
  }

  return Array.from(catalogMap.values());
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

const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export async function purchaseReward(
  userId: string,
  rewardId: string,
  cost: number,
  currentCoins: number
): Promise<{ success: boolean; newCoins?: number; error?: string }> {
  if (cost < 0) return { success: false, error: 'Invalid cost' };
  if (currentCoins < cost) return { success: false, error: 'Not enough coins' };

  // Verify authoritative coin balance from Supabase if available
  let authoritativeCoins = currentCoins;
  try {
    const { data: progressRow, error: progressError } = await supabase
      .from('player_progress')
      .select('coins')
      .eq('user_id', userId)
      .maybeSingle();

    if (!progressError && progressRow && typeof progressRow.coins === 'number') {
      authoritativeCoins = progressRow.coins;
    }
  } catch (err) {
    console.warn('Could not verify coins from DB, using current balance:', err);
  }

  if (authoritativeCoins < cost) {
    return { success: false, error: 'Not enough coins' };
  }

  // Check if already owned
  const isCustomUuid = isUUID(rewardId);
  const localKey = `owned_rewards_${userId}`;
  let localOwned: string[] = [];
  try {
    const raw = localStorage.getItem(localKey);
    localOwned = raw ? JSON.parse(raw) : [];
  } catch {
    localOwned = [];
  }

  if (localOwned.includes(rewardId)) {
    return { success: false, error: 'Already owned' };
  }

  if (isCustomUuid) {
    try {
      const { data: existing } = await supabase
        .from('user_rewards')
        .select('id')
        .eq('user_id', userId)
        .eq('reward_id', rewardId)
        .maybeSingle();

      if (existing) return { success: false, error: 'Already owned' };
    } catch {
      // safe fallback
    }
  }

  // Deduct coins in DB
  const newCoins = authoritativeCoins - cost;
  try {
    const { error: updateError } = await supabase
      .from('player_progress')
      .update({ coins: newCoins })
      .eq('user_id', userId);

    if (updateError) {
      const isNetworkOrPlaceholder =
        String(updateError.message || '').includes('fetch failed') ||
        String(updateError.details || '').includes('ENOTFOUND') ||
        String(updateError.message || '').includes('placeholder');

      if (!isNetworkOrPlaceholder) {
        console.error('Failed to deduct coins in DB:', updateError);
        return { success: false, error: 'Purchase failed: could not deduct coins' };
      }
      console.warn('Supabase offline or placeholder URL, proceeding with local purchase');
    }
  } catch (err: any) {
    console.warn('Supabase update coins caught exception (offline/mock):', err?.message);
  }

  // Record ownership in DB if custom reward (has UUID)
  if (isCustomUuid) {
    try {
      const { error: insertError } = await supabase
        .from('user_rewards')
        .insert({ user_id: userId, reward_id: rewardId });

      if (insertError) {
        const isNetworkOrPlaceholder =
          String(insertError.message || '').includes('fetch failed') ||
          String(insertError.details || '').includes('ENOTFOUND') ||
          String(insertError.message || '').includes('placeholder');

        if (!isNetworkOrPlaceholder) {
          console.error('Failed to record purchase in user_rewards, rolling back coins:', insertError);
          // Rollback coin deduction
          await supabase
            .from('player_progress')
            .update({ coins: authoritativeCoins })
            .eq('user_id', userId);
          return { success: false, error: 'Purchase failed: could not claim reward' };
        }
      }
    } catch (err: any) {
      console.warn('Supabase insert user_rewards caught exception (offline/mock):', err?.message);
    }
  }

  // Persist local backup of owned items (both default and custom)
  try {
    if (!localOwned.includes(rewardId)) {
      localOwned.push(rewardId);
      localStorage.setItem(localKey, JSON.stringify(localOwned));
    }
  } catch {
    // fallback
  }

  // Deep RPG Subsystem: Map purchased gear/consumables into player inventory
  const gearItemMap: Record<string, string> = {
    blade_of_focus: "wpn_shadow_dagger",
    shield_of_consistency: "arm_steel_carapace",
    ring_of_time: "acc_chronos_pendant",
    vitality_infusion: "con_vitality_elixir",
    focus_brew: "con_focus_crystal",
  };
  const itemIdToDeposit = gearItemMap[rewardId] || (getItemById(rewardId) ? rewardId : undefined);
  if (itemIdToDeposit) {
    void addItemToInventory(userId, itemIdToDeposit, 1);
  }

  return { success: true, newCoins };
}