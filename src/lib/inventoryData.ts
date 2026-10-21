import { supabase, isNetworkOrMockError } from "./supabase";
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

    if (error) {
      if (!isNetworkOrMockError(error)) {
        console.error("Supabase fetchPlayerInventory error:", error);
      }
    } else if (data) {
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
  } catch (err) {
    if (!isNetworkOrMockError(err)) {
      console.error("Supabase fetchPlayerInventory exception:", err);
    }
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
    const { data, error: selectError } = await supabase
      .from("player_inventory")
      .select("*")
      .eq("user_id", userId)
      .eq("item_id", itemId)
      .maybeSingle();

    if (selectError && !isNetworkOrMockError(selectError)) {
      console.error("Supabase select player_inventory error:", selectError);
      return { success: false, error: selectError.message || "Database error selecting inventory" };
    }

    if (data) {
      const newQty = Math.min(definition.maxStack, data.quantity + addCount);
      const { error: updateError } = await supabase
        .from("player_inventory")
        .update({ quantity: newQty })
        .eq("id", data.id);

      if (updateError && !isNetworkOrMockError(updateError)) {
        console.error("Supabase update player_inventory error:", updateError);
        return { success: false, error: updateError.message || "Database error updating inventory" };
      }
    } else if (!selectError) {
      const { error: insertError } = await supabase.from("player_inventory").insert({
        id,
        user_id: userId,
        item_id: itemId,
        quantity: addCount,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          // Concurrently inserted row; idempotent update
          const { data: retryData } = await supabase
            .from("player_inventory")
            .select("id, quantity")
            .eq("user_id", userId)
            .eq("item_id", itemId)
            .maybeSingle();
          if (retryData) {
            const newQty = Math.min(definition.maxStack, retryData.quantity + addCount);
            await supabase.from("player_inventory").update({ quantity: newQty }).eq("id", retryData.id);
          }
        } else if (!isNetworkOrMockError(insertError)) {
          console.error("Supabase insert player_inventory error:", insertError);
          return { success: false, error: insertError.message || "Database error inserting inventory" };
        }
      }
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
  } catch (err: any) {
    if (!isNetworkOrMockError(err)) {
      console.error("addItemToInventory unexpected exception:", err);
      return { success: false, error: err?.message || "Unexpected inventory persistence error" };
    }

    // Offline / Mock fallback: preserve cached inventory
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
    const { data, error: selectError } = await supabase
      .from("player_inventory")
      .select("*")
      .eq("user_id", userId)
      .eq("item_id", itemId)
      .maybeSingle();

    if (selectError && !isNetworkOrMockError(selectError)) {
      console.error("Supabase select error in removeItemFromInventory:", selectError);
      return false;
    }

    if (!data) {
      // Check local cache if offline
      const cached = getCachedInventory(userId);
      const existing = cached.find((i) => i.itemId === itemId);
      if (!existing) return false;
      let updated: PlayerInventoryItem[];
      if (existing.quantity <= amount) {
        updated = cached.filter((i) => i.itemId !== itemId);
      } else {
        updated = cached.map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity - amount } : i));
      }
      setCachedInventory(userId, updated);
      return true;
    }

    if (data.quantity <= amount) {
      const { error: deleteError } = await supabase.from("player_inventory").delete().eq("id", data.id);
      if (deleteError && !isNetworkOrMockError(deleteError)) {
        console.error("Supabase delete error in removeItemFromInventory:", deleteError);
        return false;
      }
    } else {
      const { error: updateError } = await supabase
        .from("player_inventory")
        .update({ quantity: data.quantity - amount })
        .eq("id", data.id);
      if (updateError && !isNetworkOrMockError(updateError)) {
        console.error("Supabase update error in removeItemFromInventory:", updateError);
        return false;
      }
    }

    void fetchPlayerInventory(userId);
    return true;
  } catch (err: any) {
    if (!isNetworkOrMockError(err)) {
      console.error("removeItemFromInventory exception:", err);
    }
    return false;
  }
}

export async function hasItem(userId: string, itemId: string): Promise<boolean> {
  const items = await fetchPlayerInventory(userId);
  return items.some(
    (i) =>
      (i.itemId === itemId ||
        i.definition?.id === itemId ||
        i.itemId === `arm_${itemId}` ||
        i.itemId === `acc_${itemId}` ||
        i.itemId === `wpn_${itemId}` ||
        i.itemId === `con_${itemId}` ||
        itemId === `arm_${i.itemId}` ||
        itemId === `acc_${i.itemId}` ||
        itemId === `wpn_${i.itemId}` ||
        itemId === `con_${i.itemId}`) &&
      i.quantity > 0
  );
}
