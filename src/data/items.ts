import type { StatName } from "../types/game";

export type ItemCategory = "equipment" | "consumable" | "special";
export type EquipmentSlot = "weapon" | "armor" | "accessory";
export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  slot?: EquipmentSlot;
  rarity: ItemRarity;
  icon: string;
  stackable: boolean;
  maxStack: number;
  statModifiers?: Partial<Record<StatName, number>>;
  source: string;
  sellPrice?: number;
}

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: "#9ca3af",
  uncommon: "#22c55e",
  rare: "#06b6d4",
  epic: "#a855f7",
  legendary: "#ffd700",
};

/**
 * Authoritative Master Catalog of Items.
 * Powers Inventory, Equipment, Loadouts, Shop, and Boss Drops.
 */
export const ITEMS_CATALOG: ItemDefinition[] = [
  // ── WEAPONS ──
  {
    id: "wpn_iron_broadsword",
    name: "Initiate's Iron Blade",
    description: "A balanced, dependable steel blade standard issue to newly awakened hunters.",
    category: "equipment",
    slot: "weapon",
    rarity: "common",
    icon: "Sword",
    stackable: false,
    maxStack: 1,
    statModifiers: { strength: 3, consistency: 1 },
    source: "starter",
  },
  {
    id: "wpn_shadow_dagger",
    name: "Shadowstalker Dagger",
    description: "Weighted for rapid, precision strikes in low light. Quickens the reflexes.",
    category: "equipment",
    slot: "weapon",
    rarity: "uncommon",
    icon: "Sword",
    stackable: false,
    maxStack: 1,
    statModifiers: { focus: 5, discipline: 2 },
    source: "shop",
  },
  {
    id: "wpn_sunfire_blade",
    name: "Sunfire Cleaver",
    description: "Forged in embers of morning sunlight. Burnishes determination.",
    category: "equipment",
    slot: "weapon",
    rarity: "rare",
    icon: "Flame",
    stackable: false,
    maxStack: 1,
    statModifiers: { strength: 8, discipline: 4 },
    source: "boss_drop",
  },
  {
    id: "wpn_voidcaller_saber",
    name: "Voidcaller Saber",
    description: "An apex relic humming with chaotic energy. Pierces through procrastination fog.",
    category: "equipment",
    slot: "weapon",
    rarity: "epic",
    icon: "Sparkles",
    stackable: false,
    maxStack: 1,
    statModifiers: { strength: 12, focus: 10, consistency: 6 },
    source: "boss_drop",
  },

  // ── ARMOR ──
  {
    id: "arm_hunter_tunic",
    name: "Hunter Trainee Tunic",
    description: "Reinforced leather vest offering minimal protection and maximum mobility.",
    category: "equipment",
    slot: "armor",
    rarity: "common",
    icon: "Shield",
    stackable: false,
    maxStack: 1,
    statModifiers: { vitality: 3, consistency: 1 },
    source: "starter",
  },
  {
    id: "arm_steel_carapace",
    name: "Disciplined Steel Carapace",
    description: "Solid interlocking iron plates engraved with mantras of perseverance.",
    category: "equipment",
    slot: "armor",
    rarity: "uncommon",
    icon: "Shield",
    stackable: false,
    maxStack: 1,
    statModifiers: { vitality: 6, discipline: 3 },
    source: "shop",
  },
  {
    id: "arm_obsidian_aegis",
    name: "Obsidian Vanguard Cuirass",
    description: "Dense volcanic rock layered over hardened leather. Unyielding to daily friction.",
    category: "equipment",
    slot: "armor",
    rarity: "rare",
    icon: "Shield",
    stackable: false,
    maxStack: 1,
    statModifiers: { vitality: 10, strength: 5, discipline: 5 },
    source: "boss_drop",
  },
  {
    id: "arm_astral_plate",
    name: "Astral Monarch Aegis",
    description: "Woven from crystallized starlight. Grants supreme psychological resilience.",
    category: "equipment",
    slot: "armor",
    rarity: "legendary",
    icon: "Shield",
    stackable: false,
    maxStack: 1,
    statModifiers: { vitality: 16, consistency: 12, discipline: 10 },
    source: "boss_drop",
  },

  // ── ACCESSORIES ──
  {
    id: "acc_band_of_focus",
    name: "Band of Concentration",
    description: "A polished silver ring that calms racing thoughts during deep study sessions.",
    category: "equipment",
    slot: "accessory",
    rarity: "common",
    icon: "Ring",
    stackable: false,
    maxStack: 1,
    statModifiers: { focus: 3 },
    source: "starter",
  },
  {
    id: "acc_chronos_pendant",
    name: "Chronos Rhythm Pendant",
    description: "Keeps time with uncanny rhythmic perfection. Protects the daily cadence.",
    category: "equipment",
    slot: "accessory",
    rarity: "rare",
    icon: "Watch",
    stackable: false,
    maxStack: 1,
    statModifiers: { consistency: 7, focus: 5 },
    source: "shop",
  },
  {
    id: "acc_monarch_sigil",
    name: "Monarch Sovereign Sigil",
    description: "Embossed seal of an awakened hunter who has conquered the supreme self.",
    category: "equipment",
    slot: "accessory",
    rarity: "legendary",
    icon: "Crown",
    stackable: false,
    maxStack: 1,
    statModifiers: { strength: 8, intelligence: 8, focus: 8, discipline: 8, vitality: 8, consistency: 8 },
    source: "boss_drop",
  },

  // ── CONSUMABLES & SPECIAL ──
  {
    id: "con_vitality_elixir",
    name: "Vigor Infusion",
    description: "Instantly re-energizes mind and spirit. Used for recovery during intense grinds.",
    category: "consumable",
    rarity: "uncommon",
    icon: "FlaskConical",
    stackable: true,
    maxStack: 99,
    source: "shop",
  },
  {
    id: "con_focus_crystal",
    name: "Hyperfocus Crystal",
    description: "A resonant crystal that heightens deep concentration and attention span.",
    category: "consumable",
    rarity: "rare",
    icon: "Gem",
    stackable: true,
    maxStack: 99,
    source: "shop",
  },
  {
    id: "spc_ignis_ember",
    name: "Cinder of Lethargy",
    description: "Trophy harvested from the defeat of Ignis, the Flame of Lethargy.",
    category: "special",
    rarity: "epic",
    icon: "Flame",
    stackable: true,
    maxStack: 10,
    source: "boss_drop",
  },
];

export function getItemById(itemId: string): ItemDefinition | undefined {
  return ITEMS_CATALOG.find((item) => item.id === itemId);
}

