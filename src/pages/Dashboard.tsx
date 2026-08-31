import QuestCard from "../components/QuestCard";
import XPBar from "../components/XPBar";
import type { Quest, Player } from "../types/game";

interface DashboardProps {
  quests: Quest[];
  player: Player;
  onComplete: (id: string) => void;
  onEndDay: () => void;
  allQuestsCompleted: boolean;
  level: number;
  xpIntoLevel: number;
}


function Dashboard({
  quests,
  player,
  onComplete,
  onEndDay,
  allQuestsCompleted,
  level,
  xpIntoLevel
}: DashboardProps) {
  
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
