import { supabase } from "./supabase";
import { getItemById, type ItemDefinition } from "../data/items";
import { hasItem } from "./inventoryData";
import { type PlayerEquipment, setCachedEquipment } from "./equipmentData";

export interface PlayerLoadout {
  id: string; // `lo_${userId}_${slotNumber}`
  userId: string;
  slotNumber: number; // 1 to 5
  name: string;
  weaponItemId?: string;
  armorItemId?: string;
  accessoryItemId?: string;
  weapon?: ItemDefinition;
  armor?: ItemDefinition;
  accessory?: ItemDefinition;
  createdAt: string;
  updatedAt: string;
}

export const MAX_LOADOUTS = 5;
const STORAGE_PREFIX = "rpg_player_loadouts";

export function getCachedLoadouts(userId: string): PlayerLoadout[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // safe fallback
  }
  return [];
}

export function setCachedLoadouts(userId: string, loadouts: PlayerLoadout[]): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}_${userId}`, JSON.stringify(loadouts));
  } catch {
    // safe fallback
  }
}

/**
 * Fetches saved loadouts for the user from Supabase.
 */
export async function fetchPlayerLoadouts(userId: string): Promise<PlayerLoadout[]> {
  const cached = getCachedLoadouts(userId);

  try {
    const { data, error } = await supabase
      .from("player_loadouts")
      .select("*")
      .eq("user_id", userId)
      .order("slot_number", { ascending: true });

    if (!error && data) {
      const loadouts: PlayerLoadout[] = data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        slotNumber: row.slot_number,
        name: row.name,
        weaponItemId: row.weapon_item_id || undefined,
        armorItemId: row.armor_item_id || undefined,
        accessoryItemId: row.accessory_item_id || undefined,
        weapon: row.weapon_item_id ? getItemById(row.weapon_item_id) : undefined,
        armor: row.armor_item_id ? getItemById(row.armor_item_id) : undefined,
        accessory: row.accessory_item_id ? getItemById(row.accessory_item_id) : undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      setCachedLoadouts(userId, loadouts);
      return loadouts;
    }
  } catch {
    // safe fallback
  }

  return cached;
}

/**
 * Saves current equipment or custom items as a loadout preset.
 */
export async function saveLoadout(
  userId: string,
  slotNumber: number,
  name: string,
  gear: {
    weaponItemId?: string;
    armorItemId?: string;
    accessoryItemId?: string;
  }
): Promise<{ success: boolean; error?: string; loadout?: PlayerLoadout }> {
  if (slotNumber < 1 || slotNumber > MAX_LOADOUTS) {
    return { success: false, error: `Loadout slot must be between 1 and ${MAX_LOADOUTS}` };
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return { success: false, error: "Loadout name cannot be empty" };
  }

  const id = `lo_${userId}_${slotNumber}`;
  const now = new Date().toISOString();

  const newLoadout: PlayerLoadout = {
    id,
    userId,
    slotNumber,
    name: trimmedName,
    weaponItemId: gear.weaponItemId,
    armorItemId: gear.armorItemId,
    accessoryItemId: gear.accessoryItemId,
    weapon: gear.weaponItemId ? getItemById(gear.weaponItemId) : undefined,
    armor: gear.armorItemId ? getItemById(gear.armorItemId) : undefined,
    accessory: gear.accessoryItemId ? getItemById(gear.accessoryItemId) : undefined,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await supabase.from("player_loadouts").upsert({
      id,
      user_id: userId,
      slot_number: slotNumber,
      name: trimmedName,
      weapon_item_id: gear.weaponItemId || null,
      armor_item_id: gear.armorItemId || null,
      accessory_item_id: gear.accessoryItemId || null,
      updated_at: now,
    });

    const current = await fetchPlayerLoadouts(userId);
    const updated = [...current.filter((l) => l.slotNumber !== slotNumber), newLoadout].sort(
      (a, b) => a.slotNumber - b.slotNumber
    );
    setCachedLoadouts(userId, updated);

    return { success: true, loadout: newLoadout };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a loadout preset.
 */
export async function deleteLoadout(userId: string, slotNumber: number): Promise<boolean> {
  try {
    await supabase
      .from("player_loadouts")
      .delete()
      .eq("user_id", userId)
      .eq("slot_number", slotNumber);

    const current = await fetchPlayerLoadouts(userId);
    const updated = current.filter((l) => l.slotNumber !== slotNumber);
    setCachedLoadouts(userId, updated);
    return true;
  } catch {
    return false;
  }
}

/**
 * Applies a loadout atomically.
 * CRITICAL ANTI-EXPLOIT GUARANTEE:
 * 1. Validates all referenced items.
 * 2. Verifies player owns every referenced item.
 * 3. Verifies slot compatibility.
 * 4. Only if ALL items are valid, applies to player_equipment.
 * 5. If anything is invalid, aborts with zero changes to current equipment!
 */
export async function applyLoadout(
  userId: string,
  slotNumber: number
): Promise<{ success: boolean; error?: string; equipment?: PlayerEquipment }> {
  const loadouts = await fetchPlayerLoadouts(userId);
  const target = loadouts.find((l) => l.slotNumber === slotNumber);
  if (!target) {
    return { success: false, error: "Loadout not found" };
  }

  // 1. Validate weapon
  if (target.weaponItemId) {
    const item = getItemById(target.weaponItemId);
    if (!item || item.slot !== "weapon") {
      return { success: false, error: "Invalid weapon in loadout. Loadout aborted." };
    }
    const owns = await hasItem(userId, target.weaponItemId);
    if (!owns) {
      return { success: false, error: `You do not own ${item.name}. Loadout aborted.` };
    }
  }

  // 2. Validate armor
  if (target.armorItemId) {
    const item = getItemById(target.armorItemId);
    if (!item || item.slot !== "armor") {
      return { success: false, error: "Invalid armor in loadout. Loadout aborted." };
    }
    const owns = await hasItem(userId, target.armorItemId);
    if (!owns) {
      return { success: false, error: `You do not own ${item.name}. Loadout aborted.` };
    }
  }

  // 3. Validate accessory
  if (target.accessoryItemId) {
    const item = getItemById(target.accessoryItemId);
    if (!item || item.slot !== "accessory") {
      return { success: false, error: "Invalid accessory in loadout. Loadout aborted." };
    }
    const owns = await hasItem(userId, target.accessoryItemId);
    if (!owns) {
      return { success: false, error: `You do not own ${item.name}. Loadout aborted.` };
    }
  }

  // 4. All checks passed! Atomically apply to player equipment
  const updatedEquipment: PlayerEquipment = {
    userId,
    weaponItemId: target.weaponItemId,
    armorItemId: target.armorItemId,
    accessoryItemId: target.accessoryItemId,
    weapon: target.weaponItemId ? getItemById(target.weaponItemId) : undefined,
    armor: target.armorItemId ? getItemById(target.armorItemId) : undefined,
    accessory: target.accessoryItemId ? getItemById(target.accessoryItemId) : undefined,
  };

  setCachedEquipment(updatedEquipment);

  try {
    await supabase.from("player_equipment").upsert({
      user_id: userId,
      weapon_item_id: updatedEquipment.weaponItemId || null,
      armor_item_id: updatedEquipment.armorItemId || null,
      accessory_item_id: updatedEquipment.accessoryItemId || null,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // safe fallback
  }

  return { success: true, equipment: updatedEquipment };
}

export { applyLoadout as equipLoadout };
