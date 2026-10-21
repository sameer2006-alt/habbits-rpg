import { supabase, isNetworkOrMockError } from './supabase';
import { DEFAULT_REWARDS, type ItemRarity, type RewardCategory } from '../data/rewards';
import { addItemToInventory, fetchPlayerInventory, hasItem } from './inventoryData';
import { getItemById } from '../data/items';
import { unlockPlayerTitle, fetchPlayerTitles } from './titlesData';

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

export const GEAR_REWARD_MAP: Record<string, string> = {
  blade_of_focus: "wpn_shadow_dagger",
  shield_of_consistency: "arm_steel_carapace",
  ring_of_time: "acc_chronos_pendant",
  vitality_infusion: "con_vitality_elixir",
  focus_brew: "con_focus_crystal",
  cloak_of_shadows: "arm_cloak_of_shadows",
  crown_of_discipline: "acc_crown_of_discipline",
  boots_of_momentum: "arm_boots_of_momentum",
  amulet_of_insight: "acc_amulet_of_insight",
};

export async function fetchRewards(userId: string): Promise<RewardItem[]> {
  const { data: userCustomRows, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error && !isNetworkOrMockError(error)) {
    console.error('Supabase rewards fetch error:', error);
  }

  const { data: ownedRows } = await supabase
    .from('user_rewards')
    .select('reward_id')
    .eq('user_id', userId);

  const ownedIds = new Set((ownedRows ?? []).map((o) => o.reward_id));
  const localKey = `owned_rewards_${userId}`;
  try {
    const localOwned: string[] = JSON.parse(localStorage.getItem(localKey) || "[]");
    localOwned.forEach((id) => ownedIds.add(id));
  } catch {
    // safe fallback
  }

  // Synchronize title ownership from authoritative unlocked titles
  try {
    const unlockedTitles = await fetchPlayerTitles(userId);
    if (unlockedTitles.includes("title_relentless")) {
      ownedIds.add("title_relentless");
    }
    if (unlockedTitles.includes("title_monarch") || unlockedTitles.includes("title_shadow_monarch")) {
      ownedIds.add("title_monarch");
    }
  } catch (err) {
    console.warn("Could not synchronize titles in fetchRewards:", err);
  }

  // Synchronize gear ownership from authoritative player inventory
  try {
    const inventoryItems = await fetchPlayerInventory(userId);
    for (const [rewardId, mappedItemId] of Object.entries(GEAR_REWARD_MAP)) {
      const def = getItemById(mappedItemId) || getItemById(rewardId);
      if (def && def.category === "equipment") {
        const hasGear = inventoryItems.some(
          (inv) =>
            (inv.itemId === mappedItemId ||
              inv.itemId === rewardId ||
              inv.definition?.id === mappedItemId ||
              inv.definition?.id === rewardId) &&
            inv.quantity > 0
        );
        if (hasGear) {
          ownedIds.add(rewardId);
        }
      }
    }
  } catch (err) {
    console.warn("Could not synchronize gear inventory in fetchRewards:", err);
  }

  // Persist updated ownership set to local cache for resilient offline use
  try {
    localStorage.setItem(localKey, JSON.stringify(Array.from(ownedIds)));
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
  if (error && !isNetworkOrMockError(error)) {
    console.error('Failed to add reward:', error);
  }
  return !error || isNetworkOrMockError(error);
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

  // Authoritative duplicate check
  const localKey = `owned_rewards_${userId}`;
  let localOwned: string[] = [];
  try {
    const raw = localStorage.getItem(localKey);
    localOwned = raw ? JSON.parse(raw) : [];
  } catch {
    localOwned = [];
  }

  // 1. Title duplicate check
  if (rewardId === "title_relentless") {
    const titles = await fetchPlayerTitles(userId);
    if (titles.includes("title_relentless")) {
      return { success: false, error: 'Already owned' };
    }
  } else if (rewardId === "title_monarch") {
    const titles = await fetchPlayerTitles(userId);
    if (titles.includes("title_monarch") || titles.includes("title_shadow_monarch")) {
      return { success: false, error: 'Already owned' };
    }
  } else if (rewardId.startsWith("title_")) {
    const titles = await fetchPlayerTitles(userId);
    if (titles.includes(rewardId)) {
      return { success: false, error: 'Already owned' };
    }
  }

  // 2. Unique equipment gear duplicate check
  const mappedItemId = GEAR_REWARD_MAP[rewardId] || rewardId;
  const itemDef = getItemById(mappedItemId) || getItemById(rewardId);
  if (itemDef && itemDef.category === "equipment") {
    const ownsGear = (await hasItem(userId, mappedItemId)) || (await hasItem(userId, rewardId));
    if (ownsGear) {
      return { success: false, error: 'Already owned' };
    }
  }

  // 3. Custom UUID reward duplicate check
  const isCustomUuid = isUUID(rewardId);
  if (isCustomUuid) {
    try {
      const { data: existing, error: existingErr } = await supabase
        .from('user_rewards')
        .select('id')
        .eq('user_id', userId)
        .eq('reward_id', rewardId)
        .maybeSingle();

      if (!existingErr && existing) return { success: false, error: 'Already owned' };
    } catch {
      // safe fallback
    }
  }

  // 4. Local ownership cache check
  if (localOwned.includes(rewardId)) {
    return { success: false, error: 'Already owned' };
  }

  // Safe coin rollback helper that restores deducted coins without overwriting newer concurrent balances
  const rollbackCoins = async (costToRefund: number) => {
    try {
      const { data: latestRow, error: selectErr } = await supabase
        .from('player_progress')
        .select('coins')
        .eq('user_id', userId)
        .maybeSingle();

      if (!selectErr && latestRow && typeof latestRow.coins === 'number') {
        const restored = latestRow.coins + costToRefund;
        await supabase
          .from('player_progress')
          .update({ coins: restored })
          .eq('user_id', userId);
      }
    } catch (err) {
      console.warn('Supabase coins rollback exception:', err);
    }
  };

  // Deduct coins in DB
  const newCoins = authoritativeCoins - cost;
  try {
    const { error: updateError } = await supabase
      .from('player_progress')
      .update({ coins: newCoins })
      .eq('user_id', userId);

    if (updateError) {
      if (!isNetworkOrMockError(updateError)) {
        console.error('Failed to deduct coins in DB:', updateError);
        return { success: false, error: 'Purchase failed: could not deduct coins' };
      }
      console.warn('Supabase offline or placeholder URL, proceeding with local purchase');
    }
  } catch (err: any) {
    if (!isNetworkOrMockError(err)) {
      console.error('Exception deducting coins:', err);
      return { success: false, error: 'Purchase failed: could not deduct coins' };
    }
    console.warn('Supabase update coins caught exception (offline/mock):', err?.message);
  }

  // Downstream Operation 1: Record ownership in DB if custom reward (has UUID)
  if (isCustomUuid) {
    try {
      const { error: insertError } = await supabase
        .from('user_rewards')
        .insert({ user_id: userId, reward_id: rewardId });

      if (insertError && !isNetworkOrMockError(insertError)) {
        console.error('Failed to record purchase in user_rewards, rolling back coins:', insertError);
        await rollbackCoins(cost);
        return { success: false, error: 'Purchase failed: could not claim reward' };
      }
    } catch (err: any) {
      if (!isNetworkOrMockError(err)) {
        console.error('Exception recording in user_rewards, rolling back coins:', err);
        await rollbackCoins(cost);
        return { success: false, error: 'Purchase failed: could not claim reward' };
      }
      console.warn('Supabase insert user_rewards caught exception (offline/mock):', err?.message);
    }
  }

  // Downstream Operation 2: Deposit purchased gear or consumable into player inventory
  const itemIdToDeposit = GEAR_REWARD_MAP[rewardId] || (getItemById(rewardId) ? rewardId : undefined);
  if (itemIdToDeposit) {
    const invResult = await addItemToInventory(userId, itemIdToDeposit, 1);
    if (!invResult.success) {
      console.error('Failed to deposit purchased item into inventory, rolling back coins:', invResult.error);
      await rollbackCoins(cost);
      return { success: false, error: invResult.error || 'Purchase failed: could not deposit item into inventory' };
    }
  }

  // Downstream Operation 3: Authoritatively unlock purchased titles
  if (rewardId === "title_relentless") {
    const titleSuccess = await unlockPlayerTitle(userId, "title_relentless");
    if (!titleSuccess) {
      console.error('Failed to unlock title_relentless, rolling back coins');
      await rollbackCoins(cost);
      return { success: false, error: 'Purchase failed: could not unlock title' };
    }
  } else if (rewardId === "title_monarch") {
    const titleSuccess = await unlockPlayerTitle(userId, "title_monarch");
    if (!titleSuccess) {
      console.error('Failed to unlock title_monarch, rolling back coins');
      await rollbackCoins(cost);
      return { success: false, error: 'Purchase failed: could not unlock title' };
    }
    // Also unlock title_shadow_monarch for complete backward compatibility
    await unlockPlayerTitle(userId, "title_shadow_monarch");
  } else if (rewardId.startsWith("title_")) {
    const titleSuccess = await unlockPlayerTitle(userId, rewardId);
    if (!titleSuccess) {
      console.error(`Failed to unlock title ${rewardId}, rolling back coins`);
      await rollbackCoins(cost);
      return { success: false, error: 'Purchase failed: could not unlock title' };
    }
  }

  // Downstream Operation 4: Persist local backup of owned items ONLY after all downstream operations succeed
  try {
    if (!localOwned.includes(rewardId)) {
      localOwned.push(rewardId);
      localStorage.setItem(localKey, JSON.stringify(localOwned));
    }
  } catch {
    // fallback
  }

  return { success: true, newCoins };
}