import type { Quest } from "../types/game";

export const initialQuests: Quest[] = [
  {
    id: "water",
    title: "Hydration",
    description: "Reach your personal daily water target.",
    category: "VITALITY",
    xpReward: 50,
    coinReward: 10,
    statReward: { stat: "vitality", amount: 2 },
    completed: false,
  },
  {
    id: "exercise",
    title: "Physical Training",
    description: "Complete your planned exercise session.",
    category: "STRENGTH",
    xpReward: 100,
    coinReward: 20,
    statReward: { stat: "strength", amount: 5 },
    completed: false,
  },
  {
    id: "study",
    title: "Knowledge Expansion",
    description: "Complete your planned study session.",
    category: "INTELLIGENCE",
    xpReward: 150,
    coinReward: 10,
    statReward: { stat: "intelligence", amount: 5 },
    completed: false,
  },
  {
    id: "reading",
    title: "Read",
    description: "Spend some time reading.",
    category: "FOCUS",
    xpReward: 50,
    coinReward: 5,
    statReward: { stat: "focus", amount: 2 },
    completed: false,
  },
];