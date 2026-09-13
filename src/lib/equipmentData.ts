import { supabase } from "./supabase";
import { getItemById, type ItemDefinition, type EquipmentSlot } from "../data/items";
import type { PlayerStats } from "../types/game";
import { hasItem } from "./inventoryData";

export interface PlayerEquipment {
  userId: string;
  weaponItemId?: string;
  armorItemId?: string;
  accessoryItemId?: string;
  weapon?: ItemDefinition;
  armor?: ItemDefinition;
  accessory?: ItemDefinition;
}

const STORAGE_PREFIX = "rpg_player_equipment";

export function getCachedEquipment(userId: string): PlayerEquipment {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // safe fallback
  }
  return { userId };
}

export function setCachedEquipment(equipment: PlayerEquipment): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}_${equipment.userId}`, JSON.stringify(equipment));
  } catch {
    // safe fallback
  }
}

/**
 * Calculates effective player stats from base stats and equipped gear.
 * BASE STATS + EQUIPMENT BONUSES = EFFECTIVE STATS
 * Base stats are NEVER permanently altered!
 */
export function calculateEffectiveStats(
  baseStats: PlayerStats,
  equipment: PlayerEquipment
): PlayerStats {
  const effective: PlayerStats = { ...baseStats };

  const equippedItems = [equipment.weapon, equipment.armor, equipment.accessory].filter(
    (item): item is ItemDefinition => Boolean(item)
  );

  for (const item of equippedItems) {
    if (!item.statModifiers) continue;
    for (const [stat, bonus] of Object.entries(item.statModifiers)) {
      const key = stat as keyof PlayerStats;
      if (effective[key] !== undefined && typeof bonus === "number") {
        effective[key] += bonus;
      }
    }
  }

  return effective;
}

/**
 * Fetches the player's equipped items from Supabase.
 */
export async function fetchPlayerEquipment(userId: string): Promise<PlayerEquipment> {
  const cached = getCachedEquipment(userId);

  try {
    const { data, error } = await supabase
      .from("player_equipment")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      const equipment: PlayerEquipment = {
        userId,
        weaponItemId: data.weapon_item_id || undefined,
        armorItemId: data.armor_item_id || undefined,
        accessoryItemId: data.accessory_item_id || undefined,
        weapon: data.weapon_item_id ? getItemById(data.weapon_item_id) : undefined,
        armor: data.armor_item_id ? getItemById(data.armor_item_id) : undefined,
        accessory: data.accessory_item_id ? getItemById(data.accessory_item_id) : undefined,
      };

      setCachedEquipment(equipment);
      return equipment;
    }
  } catch {
    // safe fallback
  }

  return {
    ...cached,
    weapon: cached.weaponItemId ? getItemById(cached.weaponItemId) : undefined,
    armor: cached.armorItemId ? getItemById(cached.armorItemId) : undefined,
    accessory: cached.accessoryItemId ? getItemById(cached.accessoryItemId) : undefined,
  };
}

/**
 * Equips an item to the specified slot.
 * Enforces ownership validation: Player MUST own the item!
 */
export async function equipItem(
  userId: string,
  itemId: string
): Promise<{ success: boolean; error?: string; equipment?: PlayerEquipment }> {
  const definition = getItemById(itemId);
  if (!definition || !definition.slot) {
    return { success: false, error: "Item is not equippable" };
  }

  const owned = await hasItem(userId, itemId);
  if (!owned) {
    return { success: false, error: "You do not own this item" };
  }

  const current = await fetchPlayerEquipment(userId);
  const updated: PlayerEquipment = { ...current };

  if (definition.slot === "weapon") {
    updated.weaponItemId = itemId;
    updated.weapon = definition;
  } else if (definition.slot === "armor") {
    updated.armorItemId = itemId;
    updated.armor = definition;
  } else if (definition.slot === "accessory") {
    updated.accessoryItemId = itemId;
    updated.accessory = definition;
  }

  setCachedEquipment(updated);

  try {
    await supabase.from("player_equipment").upsert({
      user_id: userId,
      weapon_item_id: updated.weaponItemId || null,
      armor_item_id: updated.armorItemId || null,
      accessory_item_id: updated.accessoryItemId || null,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // safe fallback
  }

  return { success: true, equipment: updated };
}

/**
 * Unequips an item from the specified slot.
 */
export async function unequipSlot(
  userId: string,
  slot: EquipmentSlot
): Promise<PlayerEquipment> {
  const current = await fetchPlayerEquipment(userId);
  const updated: PlayerEquipment = { ...current };

  if (slot === "weapon") {
    updated.weaponItemId = undefined;
    updated.weapon = undefined;
  } else if (slot === "armor") {
    updated.armorItemId = undefined;
    updated.armor = undefined;
  } else if (slot === "accessory") {
    updated.accessoryItemId = undefined;
    updated.accessory = undefined;
  }

  setCachedEquipment(updated);

  try {
    await supabase.from("player_equipment").upsert({
      user_id: userId,
      weapon_item_id: updated.weaponItemId || null,
      armor_item_id: updated.armorItemId || null,
      accessory_item_id: updated.accessoryItemId || null,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // safe fallback
  }

  return updated;
}

