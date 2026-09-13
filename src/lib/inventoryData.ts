import { supabase } from "./supabase";
import { getItemById, type ItemDefinition } from "../data/items";

export interface PlayerInventoryItem {
  id: string; // `inv_${userId}_${itemId}`
  userId: string;
  itemId: string;
  quantity: number;
  acquiredAt: string;
  definition?: ItemDefinition;
}

const STORAGE_PREFIX = "rpg_player_inventory";

export function getCachedInventory(userId: string): PlayerInventoryItem[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // safe fallback
  }
  return [];
}

export function setCachedInventory(userId: string, items: PlayerInventoryItem[]): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}_${userId}`, JSON.stringify(items));
  } catch {
    // safe fallback
  }
}

/**
 * Fetches the user's complete inventory from Supabase, joined with item metadata.
 */
export async function fetchPlayerInventory(userId: string): Promise<PlayerInventoryItem[]> {
  const cached = getCachedInventory(userId);

  try {
    const { data, error } = await supabase
      .from("player_inventory")
      .select("*")
      .eq("user_id", userId)
      .order("acquired_at", { ascending: false });

    if (!error && data) {
      const items: PlayerInventoryItem[] = data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        itemId: row.item_id,
        quantity: row.quantity,
        acquiredAt: row.acquired_at,
        definition: getItemById(row.item_id),
      }));

      setCachedInventory(userId, items);
      return items;
    }
  } catch {
    // safe fallback
  }

  // Fallback to cached items
  return cached.map((c) => ({
    ...c,
    definition: getItemById(c.itemId),
  }));
}

/**
 * Adds an item to the player's inventory, adhering to stack limits and unique constraints.
 */
export async function addItemToInventory(
  userId: string,
  itemId: string,
  amount: number = 1
): Promise<{ success: boolean; error?: string }> {
  const definition = getItemById(itemId);
  if (!definition) {
    return { success: false, error: `Invalid item ID: ${itemId}` };
  }

  const addCount = Math.max(1, Math.min(amount, definition.maxStack));
  const id = `inv_${userId}_${itemId}`;

  try {
    // Check if player already owns row
    const { data } = await supabase
      .from("player_inventory")
      .select("*")
      .eq("user_id", userId)
      .eq("item_id", itemId)
      .maybeSingle();

    if (data) {
      const newQty = Math.min(definition.maxStack, data.quantity + addCount);
      await supabase
        .from("player_inventory")
        .update({ quantity: newQty })
        .eq("id", data.id);
    } else {
      await supabase.from("player_inventory").insert({
        id,
        user_id: userId,
        item_id: itemId,
        quantity: addCount,
      });
    }

    // Update local cache synchronously
    const cached = getCachedInventory(userId);
    const existing = cached.find((i) => i.itemId === itemId);
    let updatedList: PlayerInventoryItem[];
    if (existing) {
      const newQty = Math.min(definition.maxStack, existing.quantity + addCount);
      updatedList = cached.map((i) => (i.itemId === itemId ? { ...i, quantity: newQty } : i));
    } else {
      updatedList = [
        ...cached,
        {
          id,
          userId,
          itemId,
          quantity: addCount,
          acquiredAt: new Date().toISOString(),
          definition,
        },
      ];
    }
    setCachedInventory(userId, updatedList);

    return { success: true };
  } catch {
    // Even if Supabase is offline, preserve cached inventory
    const cached = getCachedInventory(userId);
    const existing = cached.find((i) => i.itemId === itemId);
    let updatedList: PlayerInventoryItem[];
    if (existing) {
      const newQty = Math.min(definition.maxStack, existing.quantity + addCount);
      updatedList = cached.map((i) => (i.itemId === itemId ? { ...i, quantity: newQty } : i));
    } else {
      updatedList = [
        ...cached,
        {
          id,
          userId,
          itemId,
          quantity: addCount,
          acquiredAt: new Date().toISOString(),
          definition,
        },
      ];
    }
    setCachedInventory(userId, updatedList);
    return { success: true };
  }
}

/**
 * Decrements or removes an item from inventory.
 */
export async function removeItemFromInventory(
  userId: string,
  itemId: string,
  amount: number = 1
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("player_inventory")
      .select("*")
      .eq("user_id", userId)
      .eq("item_id", itemId)
      .maybeSingle();

    if (!data) return false;

    if (data.quantity <= amount) {
      await supabase.from("player_inventory").delete().eq("id", data.id);
    } else {
      await supabase
        .from("player_inventory")
        .update({ quantity: data.quantity - amount })
        .eq("id", data.id);
    }

    void fetchPlayerInventory(userId);
    return true;
  } catch {
    return false;
  }
}

export async function hasItem(userId: string, itemId: string): Promise<boolean> {
  const items = await fetchPlayerInventory(userId);
  return items.some((i) => i.itemId === itemId && i.quantity > 0);
}
