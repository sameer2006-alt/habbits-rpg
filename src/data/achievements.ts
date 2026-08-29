import type { Achievement } from "../types/game";

export const initialAchievements: Achievement[] = [
  {
    id: "first-quest",
    title: "First Quest",
    description: "Complete your first quest.",
    unlocked: false,
  },
  {
    id: "week-one",
    title: "Week One",
    description: "Maintain a 7-day streak.",
    unlocked: false,
  },
  {
    id: "level-five",
    title: "Ascension",
    description: "Reach Level 5.",
    unlocked: false,
  },
  {
    id: "rich",
    title: "Coin Collector",
    description: "Earn 100 total coins.",
    unlocked: false,
  },
];