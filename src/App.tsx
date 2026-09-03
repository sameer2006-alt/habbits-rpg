import { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Status from "./pages/Status";
import History from "./pages/History";
import Shop from "./pages/Shop";
import Toast from "./components/Toast";
import { calculateLevel, getXPIntoCurrentLevel } from "./utils/levelSystem";
import type { Quest, Player, Achievement, StatName } from "./types/game";
import LevelUpOverlay from "./components/LevelUpOverlay";
import Login from "./pages/Login";
import { useAuth } from "./lib/AuthContext";
import { fetchPlayer, savePlayerProgress } from "./lib/playerData";
import { fetchQuests, recordQuestCompletion, addQuest, deactivateQuest } from "./lib/questsData";
import { fetchAchievements, unlockAchievement } from "./lib/achievementsData";
import { fetchRewards, addReward, purchaseReward, type RewardItem } from "./lib/rewardsData";

type AchievementRow = {
  id: string;
  requirement_type: string;
  requirement_value: number;
};

function App() {
  const { user, loading: authLoading } = useAuth();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementRows, setAchievementRows] = useState<AchievementRow[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);

  const [totalQuestsCompleted, setTotalQuestsCompleted] = useState(0);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [levelUpValue, setLevelUpValue] = useState<number | null>(null);
  const [previousLevel, setPreviousLevel] = useState(1);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchPlayer(user.id),
      fetchQuests(user.id),
      fetchAchievements(user.id),
      fetchRewards(user.id),
    ]).then(([fetchedPlayer, fetchedQuests, achievementData, fetchedRewards]) => {
      setPlayer(fetchedPlayer);
      setQuests(fetchedQuests);
      setAchievements(achievementData.achievements);
      setAchievementRows(achievementData.rows);
      setRewards(fetchedRewards);
      setLoading(false);
    });
  }, [user]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const completeQuest = async (id: string) => {
    const quest = quests.find((q) => q.id === id);
    if (!quest || quest.completed || !player || !user) return;

    const wasRecorded = await recordQuestCompletion(user.id, quest.id, quest.xpReward, quest.coinReward);
    if (!wasRecorded) return;

    setQuests((currentQuests) =>
      currentQuests.map((q) => (q.id === id ? { ...q, completed: true } : q))
    );

    const updatedPlayer: Player = {
      ...player,
      progress: {
        ...player.progress,
        totalXP: player.progress.totalXP + quest.xpReward,
        coins: player.progress.coins + quest.coinReward,
      },
      stats: {
        ...player.stats,
        [quest.statReward.stat]: player.stats[quest.statReward.stat] + quest.statReward.amount,
      },
    };

    setPlayer(updatedPlayer);
    savePlayerProgress(user.id, updatedPlayer);

    setTotalQuestsCompleted((count) => count + 1);
    showToast(`QUEST COMPLETE  +${quest.xpReward} XP`);
  };

  const handleAddQuest = async (quest: {
    title: string;
    description: string;
    category: string;
    xpReward: number;
    coinReward: number;
    stat: StatName;
    statAmount: number;
  }) => {
    if (!user) return;
    const success = await addQuest(user.id, quest);
    if (success) {
      const refreshedQuests = await fetchQuests(user.id);
      setQuests(refreshedQuests);
      showToast(`NEW QUEST ADDED: ${quest.title}`);
    }
  };

  const handleRemoveQuest = async (id: string) => {
    if (!user) return;
    const success = await deactivateQuest(user.id, id);
    if (success) {
      setQuests((current) => current.filter((q) => q.id !== id));
    }
  };

  const handlePurchaseReward = async (rewardId: string, cost: number) => {
    if (!user || !player) return;
    const result = await purchaseReward(user.id, rewardId, cost, player.progress.coins);
    if (result.success) {
      setPlayer({
        ...player,
        progress: { ...player.progress, coins: player.progress.coins - cost },
      });
      setRewards((current) => current.map((r) => (r.id === rewardId ? { ...r, owned: true } : r)));
      showToast("REWARD REDEEMED");
    } else {
      showToast(result.error ?? "Purchase failed");
    }
  };

  const handleAddReward = async (reward: { title: string; description: string; cost: number; type: string }) => {
    if (!user) return;
    const success = await addReward(user.id, reward);
    if (success) {
      const refreshedRewards = await fetchRewards(user.id);
      setRewards(refreshedRewards);
      showToast(`NEW REWARD ADDED: ${reward.title}`);
    }
  };

  const allQuestsCompleted = quests.length > 0 && quests.every((quest) => quest.completed);

  const totalXP = player?.progress.totalXP ?? 0;

  const level = calculateLevel(totalXP);
  const xpIntoLevel = getXPIntoCurrentLevel(totalXP);

  const endDay = () => {
    if (!player || !user) return;

    const incompleteCount = quests.filter((quest) => !quest.completed).length;

    let updatedPlayer: Player;

    if (incompleteCount === 0) {
      updatedPlayer = {
        ...player,
        progress: {
          ...player.progress,
          currentStreak: player.progress.currentStreak + 1,
          bestStreak: Math.max(player.progress.bestStreak, player.progress.currentStreak + 1),
        },
      };
      showToast("DAY COMPLETE  +1 STREAK");
    } else {
      updatedPlayer = {
        ...player,
        progress: {
          ...player.progress,
          currentStreak: 0,
          coins: Math.max(0, player.progress.coins - incompleteCount * 5),
        },
      };
      showToast("DAY ENDED  STREAK RESET");
    }

    setPlayer(updatedPlayer);
    savePlayerProgress(user.id, updatedPlayer);

    setQuests((currentQuests) =>
      currentQuests.map((quest) => ({ ...quest, completed: false }))
    );
  };

  useEffect(() => {
    if (!player || !user || achievementRows.length === 0) return;

    if (level > previousLevel) {
      setLevelUpValue(level);
      setPreviousLevel(level);
      setTimeout(() => setLevelUpValue(null), 2500);
    }

    achievementRows.forEach((row) => {
      const already = achievements.find((a) => a.id === row.id)?.unlocked;
      if (already) return;

      let earned = false;
      if (row.requirement_type === "quests_completed") earned = totalQuestsCompleted >= row.requirement_value;
      if (row.requirement_type === "streak") earned = player.progress.currentStreak >= row.requirement_value;
      if (row.requirement_type === "level") earned = level >= row.requirement_value;
      if (row.requirement_type === "coins") earned = player.progress.coins >= row.requirement_value;

      if (earned) {
        unlockAchievement(user.id, row.id);
        setAchievements((current) =>
          current.map((a) => (a.id === row.id ? { ...a, unlocked: true } : a))
        );
        const title = achievements.find((a) => a.id === row.id)?.title ?? "Achievement";
        showToast(`ACHIEVEMENT UNLOCKED: ${title}`);
      }
    });
  }, [totalQuestsCompleted, player, previousLevel, level, achievementRows]);

  if (authLoading) return <p>Checking session...</p>;
  if (!user) return <Login />;
  if (loading || !player) return <p>Loading your save file...</p>;

  return (
    <>
      <Toast message={toastMessage} />
      <LevelUpOverlay level={levelUpValue} />

      <nav>
        <Link to="/dashboard">Dashboard</Link> |{" "}
        <Link to="/status">Status</Link> |{" "}
        <Link to="/history">History</Link> |{" "}
        <Link to="/shop">Shop</Link>
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
              onAddQuest={handleAddQuest}
              onRemoveQuest={handleRemoveQuest}
              allQuestsCompleted={allQuestsCompleted}
              level={level}
              xpIntoLevel={xpIntoLevel}
            />
          }
        />
        <Route
          path="/status"
          element={<Status level={level} xpIntoLevel={xpIntoLevel} player={player} achievements={achievements} />}
        />
        <Route path="/history" element={<History />} />
        <Route
          path="/shop"
          element={
            <Shop
              rewards={rewards}
              coins={player.progress.coins}
              onPurchase={handlePurchaseReward}
              onAddReward={handleAddReward}
            />
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;