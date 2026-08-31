import type { Player } from "../types/game";

export const initialPlayer: Player = {
  profile: {
    id: "local-player",
    name: "Player",
  },

  stats: {
    strength: 10,
    intelligence: 10,
    vitality: 10,
    focus: 10,
    discipline: 10,
    consistency: 10,
  },

  progress: {
    level: 1,
    totalXP: 0,
    coins: 0,
    currentStreak: 0,
    bestStreak: 0,
    rank: "F",
  },
};