import QuestCard from "../components/QuestCard";
import XPBar from "../components/XPBar";
import { calculateLevel, getXPIntoCurrentLevel } from "../utils/levelSystem";
import type { Quest, Player } from "../types/game";

interface DashboardProps {
  quests: Quest[];
  player: Player;
  onComplete: (id: string) => void;
  onEndDay: () => void;
  allQuestsCompleted: boolean;
}

function Dashboard({
  quests,
  player,
  onComplete,
  onEndDay,
  allQuestsCompleted,
}: DashboardProps) {
  const totalXP = quests
    .filter((quest) => quest.completed)
    .reduce((total, quest) => total + quest.xpReward, 0);

  const level = calculateLevel(totalXP);
  const xpIntoLevel = getXPIntoCurrentLevel(totalXP);

  return (
    <main>
      <h1>System Dashboard</h1>

      <p>STREAK: {player.streak} 🔥</p>

      <XPBar level={level} currentXP={xpIntoLevel} />

      <p>
        STR {player.strength} | INT {player.intelligence} | VIT{" "}
        {player.vitality} | FOC {player.focus} | DIS {player.discipline}
      </p>
      <p>COINS: {player.coins} 🔥</p>

      {quests.map((quest) => (
        <QuestCard key={quest.id} quest={quest} onComplete={onComplete} />
      ))}

      <button onClick={onEndDay}>
        {allQuestsCompleted
          ? "End Day (+1 Streak)"
          : "End Day (some quests incomplete)"}
      </button>
    </main>
  );
}

export default Dashboard;
