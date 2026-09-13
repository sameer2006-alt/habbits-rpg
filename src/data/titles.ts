import type { ItemRarity } from "./items";

export interface TitleDefinition {
  id: string;
  name: string;
  description: string;
  unlockCondition: string;
  rarity: ItemRarity;
  badgeColor: string;
  glowColor: string;
}

export const TITLES_CATALOG: TitleDefinition[] = [
  {
    id: "title_recruit",
    name: "Awakened Novice",
    description: "Has awakened their inner hunter drive and taken the first step on the path.",
    unlockCondition: "Unlocked upon awakening.",
    rarity: "common",
    badgeColor: "#8b949e",
    glowColor: "rgba(139, 148, 158, 0.3)",
  },
  {
    id: "title_pathfinder",
    name: "Pathfinder",
    description: "Successfully conquered your first quest in the system.",
    unlockCondition: "Unlock the 'First Quest' achievement.",
    rarity: "uncommon",
    badgeColor: "#22c55e",
    glowColor: "rgba(34, 197, 94, 0.35)",
  },
  {
    id: "title_disciplined",
    name: "Disciplined Veteran",
    description: "Proven endurance forged across 50 completed quests.",
    unlockCondition: "Unlock the 'Veteran' achievement (50 quests).",
    rarity: "rare",
    badgeColor: "#06b6d4",
    glowColor: "rgba(6, 182, 212, 0.35)",
  },
  {
    id: "title_iron_flame",
    name: "Iron Flame",
    description: "Sustained a dedicated 7-day streak without breaking momentum.",
    unlockCondition: "Unlock the 'Week Warrior' achievement (7-day streak).",
    rarity: "rare",
    badgeColor: "#f97316",
    glowColor: "rgba(249, 115, 22, 0.35)",
  },
  {
    id: "title_boss_slayer",
    name: "Apex Vanquisher",
    description: "Struck the final blow against a weekly or monthly raid boss.",
    unlockCondition: "Defeat at least 1 Boss in the Boss Arena.",
    rarity: "epic",
    badgeColor: "#ec4899",
    glowColor: "rgba(236, 72, 153, 0.45)",
  },
  {
    id: "title_routine_master",
    name: "Master of Routine",
    description: "Completed all required daily directives and achieved a Perfect Day.",
    unlockCondition: "Achieve a Perfect Day milestone.",
    rarity: "epic",
    badgeColor: "#ffd700",
    glowColor: "rgba(255, 215, 0, 0.45)",
  },
  {
    id: "title_shadow_monarch",
    name: "Shadow Monarch",
    description: "Ascended beyond ordinary human limits to conquer the pinnacle of discipline.",
    unlockCondition: "Reach Level 100 or unlock the Legendary rank.",
    rarity: "legendary",
    badgeColor: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.5)",
  },
];

export function getTitleById(titleId: string): TitleDefinition | undefined {
  return TITLES_CATALOG.find((t) => t.id === titleId);
}

