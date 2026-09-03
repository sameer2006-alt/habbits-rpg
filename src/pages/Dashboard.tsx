import { useState } from "react";
import QuestCard from "../components/QuestCard";
import XPBar from "../components/XPBar";
import AddQuestForm from "../components/AddQuestForm";
import type { Quest, Player, StatName } from "../types/game";

interface DashboardProps {
  quests: Quest[];
  player: Player;
  onComplete: (id: string) => void;
  onEndDay: () => void;
  onAddQuest: (quest: {
    title: string;
    description: string;
    category: string;
    xpReward: number;
    coinReward: number;
    stat: StatName;
    statAmount: number;
  }) => void;
  onRemoveQuest: (id: string) => void;
  allQuestsCompleted: boolean;
  level: number;
  xpIntoLevel: number;
}

function Dashboard({
  quests,
  player,
  onComplete,
  onEndDay,
  onAddQuest,
  onRemoveQuest,
  allQuestsCompleted,
  level,
  xpIntoLevel,
}: DashboardProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <main>
      <h1>System Dashboard</h1>
      <p>STREAK: {player.progress.currentStreak} 🔥</p>

      <XPBar level={level} currentXP={xpIntoLevel} />

      <p>
        STR {player.stats.strength} | INT {player.stats.intelligence} | VIT{" "}
        {player.stats.vitality} | FOC {player.stats.focus} | DIS{" "}
        {player.stats.discipline} | CON {player.stats.consistency}
      </p>
      <p>COINS: {player.progress.coins} 🔥</p>

      {quests.map((quest) => (
        <div key={quest.id}>
          <QuestCard quest={quest} onComplete={onComplete} />
          <button onClick={() => onRemoveQuest(quest.id)}>Remove</button>
        </div>
      ))}

      {showAddForm ? (
        <AddQuestForm
          onSubmit={(quest) => {
            onAddQuest(quest);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <button onClick={() => setShowAddForm(true)}>+ New Quest</button>
      )}

      <button onClick={onEndDay}>
        {allQuestsCompleted
          ? "End Day (+1 Streak)"
          : "End Day (some quests incomplete)"}
      </button>
    </main>
  );
}

export default Dashboard;