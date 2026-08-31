import { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Status from "./pages/Status";
import Toast from "./components/Toast";
import { initialQuests } from "./data/quests";
import { initialAchievements } from "./data/achievements";
import { initialPlayer } from "./data/player";
import { calculateLevel, getXPIntoCurrentLevel } from "./utils/levelSystem";
import type { Quest, Player, Achievement } from "./types/game";
import LevelUpOverlay from "./components/LevelUpOverlay";

function App() {
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>(
    initialAchievements
  );
  const [totalQuestsCompleted, setTotalQuestsCompleted] = useState(0);
 
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [levelUpValue, setLevelUpValue] = useState<number | null>(null); 
   const [previousLevel, setPreviousLevel] = useState(1);

useEffect(() => {
  setPlayer(initialPlayer);
  setLoading(false);
}, []);
  
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const completeQuest = (id: string) => {
    const quest = quests.find((q) => q.id === id);
    if (!quest || quest.completed) return;
    if (!player) return; 

    setQuests((currentQuests) =>
      currentQuests.map((q) =>
        q.id === id ? { ...q, completed: true } : q
      )
    );
setPlayer((currentPlayer) => {
  if (!currentPlayer) return currentPlayer;

  return {
    ...currentPlayer,

    progress: {
      ...currentPlayer.progress,
      totalXP:
        currentPlayer.progress.totalXP + quest.xpReward,
      coins:
        currentPlayer.progress.coins + quest.coinReward,
    },

    stats: {
      ...currentPlayer.stats,
      [quest.statReward.stat]:
        currentPlayer.stats[quest.statReward.stat] +
        quest.statReward.amount,
    },
  };
});

    setTotalQuestsCompleted((count) => count + 1);


    showToast(`QUEST COMPLETE  +${quest.xpReward} XP`);
  };

  const allQuestsCompleted = quests.every((quest) => quest.completed);

  const totalXP = player?.progress.totalXP ?? 0;

  const level = calculateLevel(totalXP);
  const xpIntoLevel = getXPIntoCurrentLevel(totalXP);

  const endDay = () => {
  const incompleteCount = quests.filter(
    (quest) => !quest.completed
  ).length;

  if (incompleteCount === 0) {
    setPlayer((currentPlayer) => {
      if (!currentPlayer) return currentPlayer;

      return {
        ...currentPlayer,
        progress: {
          ...currentPlayer.progress,
          currentStreak:
            currentPlayer.progress.currentStreak + 1,
        },
      };
    });

    showToast("DAY COMPLETE  +1 STREAK");
  } else {
    setPlayer((currentPlayer) => {
      if (!currentPlayer) return currentPlayer;

      return {
        ...currentPlayer,
        progress: {
          ...currentPlayer.progress,
          currentStreak: 0,
          coins: Math.max(
            0,
            currentPlayer.progress.coins -
              incompleteCount * 5
          ),
        },
      };
    });

    showToast("DAY ENDED  STREAK RESET");
  }

  setQuests((currentQuests) =>
    currentQuests.map((quest) => ({
      ...quest,
      completed: false,
    }))
  );
};

 useEffect(() => {
  if (!player) return;

  if (level > previousLevel) {
    setLevelUpValue(level);
    setPreviousLevel(level);
    setTimeout(() => setLevelUpValue(null), 2500);
  }

  setAchievements((currentAchievements) =>
    currentAchievements.map((achievement) => {
      if (achievement.unlocked) return achievement;

      let earned = false;
      if (achievement.id === "first-quest" && totalQuestsCompleted >= 1) {
        earned = true;
      }
      if (achievement.id === "week-one" && player.progress.currentStreak >= 7) {
  earned = true;
      }
      if (achievement.id === "level-five" && level >= 5) {
        earned = true;
      }
      if (achievement.id === "rich" &&player.progress.coins >= 100) {
  earned = true;
    }

      if (earned) showToast(`ACHIEVEMENT UNLOCKED: ${achievement.title}`);

      return earned ? { ...achievement, unlocked: true } : achievement;
    })
  );
}, [totalQuestsCompleted, player, previousLevel, level]);
    if (loading || !player) return <p>Loading your save file...</p>;
   return (
    <>
      <Toast message={toastMessage} />
      <LevelUpOverlay level={levelUpValue} />

      <nav>
        <Link to="/dashboard">Dashboard</Link> |{" "}
        <Link to="/status">Status</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              quests={quests}
              player={player}
              onComplete={completeQuest}
              onEndDay={endDay}
              allQuestsCompleted={allQuestsCompleted}
              level={level} 
              xpIntoLevel={xpIntoLevel}
              
            />
          }
        />
        <Route
          path="/status"
          element={
            <Status level={level} xpIntoLevel={xpIntoLevel} player={player} achievements={achievements} />
          }
        />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;