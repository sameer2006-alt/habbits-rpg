export interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  xpReward: number;
  coinReward: number;
  statReward: {
    stat: "strength" | "intelligence" | "vitality" | "focus" | "discipline";
    amount: number;
  };
  completed: boolean;
}

export interface Player {
  name: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  rank: string;
  strength: number;
  intelligence: number;
  vitality: number;
  focus: number;
  discipline: number;
} 

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}