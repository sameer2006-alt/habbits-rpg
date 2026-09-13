import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Bot,
  Home,
  Shield,
  ShoppingBag,
  Skull,
  Swords,
  Trophy,
  User,
} from "lucide-react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import "./App.css";
import Dashboard from "./pages/Dashboard";
import Quests from "./pages/Quests";
import Status from "./pages/Status";
import Armory from "./pages/Armory";
import Achievements from "./pages/Achievements";
import Boss from "./pages/Boss";
import Shop from "./pages/Shop";
import RankProgression from "./pages/RankProgression";
import SystemAI from "./pages/SystemAI";
import Toast from "./components/Toast";
import EventOverlay from "./components/EventOverlay";
import type { EventType } from "./components/EventOverlay";
import SystemIdentityModal from "./components/SystemIdentityModal";
import CinematicRankUpModal from "./components/CinematicRankUpModal";
import Login from "./pages/Login";
import {
  calculateLevel,
  getXPIntoCurrentLevel,
} from "./utils/levelSystem";
import type { Achievement, Player, Quest, StatName, RankDefinition } from "./types/game";
import { useAuth } from "./lib/AuthContext";
import {
  fetchPlayer,
  savePlayerProgress,
  savePlayerAvatar,
  savePlayerName,
} from "./lib/playerData";
import {
  addQuest,
  deactivateQuest,
  fetchQuests,
  recordQuestCompletion,
  fetchTotalQuestsCompleted,
} from "./lib/questsData";
import {
  fetchAchievements,
  unlockAchievement,
  type AchievementRow,
} from "./lib/achievementsData";
import {
  evaluatePlayerRank,
  getRankDefinition,
} from "./data/ranks";
import {
  getOrCreateDailyDirective,
  updateDailyDirectiveOnQuestComplete,
} from "./lib/dailyDirectivesData";
import type { DailyDirective } from "./data/dailyDirectives";
import {
  getOrCreatePerfectDayRecord,
  evaluateAndProcessPerfectDay,
} from "./lib/perfectDayData";
import type { PerfectDayRecord } from "./data/perfectDay";
import {
  addReward,
  fetchRewards,
  purchaseReward,
  type RewardItem,
} from "./lib/rewardsData";
import { applyDamageToBosses, getDefeatedBossesCount } from "./lib/bossData";
import {
  getActiveDoubleXpCharges,
  consumeDoubleXpCharge,
  isCoinMagnetActive,
  activateCoinMagnet,
  addDoubleXpCharges,
  isPassiveGearOwned,
} from "./lib/buffsData";
import {
  getOrCreateDailyRandomEvent,
  updateRandomEventOnQuestComplete,
  type PlayerRandomEvent,
} from "./lib/randomEventsData";
import { recordDailyActivity } from "./lib/streakCalendarData";
import {
  fetchPlayerEquipment,
  type PlayerEquipment,
  calculateEffectiveStats,
} from "./lib/equipmentData";
import {
  fetchEquippedTitle,
  checkAndUnlockTitlesFromProgress,
  type TitleDefinition,
} from "./lib/titlesData";
import { calculatePowerScore } from "./lib/powerScore";
import {
  getOrCreateWeeklyChallenge,
  updateWeeklyChallengeProgress,
} from "./lib/weeklyChallengesData";
import type { WeeklyChallenge } from "./data/weeklyChallenges";
import {
  getOrCreateMonthlyChallenge,
  updateMonthlyChallengeProgress,
} from "./lib/monthlyChallengesData";
import type { MonthlyChallenge } from "./data/monthlyChallenges";
import {
  getOrCreatePlayerSeason,
  addSeasonXP,
} from "./lib/seasonsData";
import type { PlayerSeason, SeasonMilestone } from "./data/seasons";
import {
  getPersonalRecords,
  updatePersonalRecords,
  type PlayerRecordsMap,
} from "./lib/personalRecordsData";

const navigation = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/quests", label: "Quests", icon: Swords },
  { to: "/ranks", label: "Ranks", icon: Award },
  { to: "/stats", label: "Profile", icon: User },
  { to: "/armory", label: "Armory", icon: Shield },
  { to: "/achievements", label: "Achievements", icon: Trophy },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
  { to: "/boss", label: "Boss", icon: Skull },
  { to: "/system-ai", label: "System AI", icon: Bot },
];


function App() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [dailyDirective, setDailyDirective] = useState<DailyDirective | null>(null);
  const [perfectDayRecord, setPerfectDayRecord] = useState<PerfectDayRecord | null>(null);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(null);
  const [monthlyChallenge, setMonthlyChallenge] = useState<MonthlyChallenge | null>(null);
  const [playerSeason, setPlayerSeason] = useState<PlayerSeason | null>(null);
  const [personalRecords, setPersonalRecords] = useState<PlayerRecordsMap>({});
  const [equipment, setEquipment] = useState<PlayerEquipment>({ userId: "" });
  const [equippedTitle, setEquippedTitle] = useState<TitleDefinition | null>(null);
  const [randomEvent, setRandomEvent] = useState<PlayerRandomEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementRows, setAchievementRows] = useState<AchievementRow[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [totalQuestsCompleted, setTotalQuestsCompleted] = useState(0);
  const [cinematicRankUp, setCinematicRankUp] = useState<{
    newRank: RankDefinition;
    previousRank: RankDefinition;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [gameEvent, setGameEvent] = useState<{ type: EventType; title: string; subtitle?: string } | null>(null);
  const previousLevelRef = useRef<number | null>(null);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const eventTimerRef = useRef<number | null>(null);
  const isInitialLoadRef = useRef(true);
  const isPurchasingRewardRef = useRef(false);
  const evaluatedAchievementsRef = useRef<Set<string>>(new Set());
  const completingQuestIdsRef = useRef<Set<string>>(new Set());

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 2000);
  };

  const dismissEvent = () => {
    if (eventTimerRef.current !== null) {
      window.clearTimeout(eventTimerRef.current);
      eventTimerRef.current = null;
    }
    setGameEvent(null);
  };

  const showEvent = (type: EventType, title: string, subtitle?: string) => {
    if (eventTimerRef.current !== null) {
      window.clearTimeout(eventTimerRef.current);
    }
    setGameEvent({ type, title, subtitle });
    eventTimerRef.current = window.setTimeout(() => {
      setGameEvent(null);
      eventTimerRef.current = null;
    }, 2800);
  };

  const evaluateAchievements = (
    currentPlayer: Player,
    currentTasksCompleted: number,
    currentRows: AchievementRow[],
    isDayAllCompleted: boolean,
    currentUserId: string,
  ) => {
    const newlyUnlockedIds: string[] = [];
    const currentLevel = calculateLevel(currentPlayer.progress.totalXP);

    for (const row of currentRows) {
      if (evaluatedAchievementsRef.current.has(row.id)) continue;

      const earned =
        (row.requirement_type === "quests_completed" &&
          currentTasksCompleted >= row.requirement_value) ||
        (row.requirement_type === "streak" &&
          currentPlayer.progress.currentStreak >= row.requirement_value) ||
        (row.requirement_type === "level" && currentLevel >= row.requirement_value) ||
        (row.requirement_type === "coins" &&
          currentPlayer.progress.coins >= row.requirement_value) ||
        (row.requirement_type === "stat_strength" &&
          currentPlayer.stats.strength >= row.requirement_value) ||
        (row.requirement_type === "stat_intelligence" &&
          currentPlayer.stats.intelligence >= row.requirement_value) ||
        (row.requirement_type === "stat_vitality" &&
          currentPlayer.stats.vitality >= row.requirement_value) ||
        (row.requirement_type === "stat_focus" &&
          currentPlayer.stats.focus >= row.requirement_value) ||
        (row.requirement_type === "stat_discipline" &&
          currentPlayer.stats.discipline >= row.requirement_value) ||
        (row.requirement_type === "stat_consistency" &&
          currentPlayer.stats.consistency >= row.requirement_value) ||
        (row.requirement_type === "perfect_day" && isDayAllCompleted);

      if (earned) {
        newlyUnlockedIds.push(row.id);
        evaluatedAchievementsRef.current.add(row.id);
        void unlockAchievement(currentUserId, row.id);
      }
    }

    if (newlyUnlockedIds.length > 0) {
      const newUnlockedSet = new Set(newlyUnlockedIds);

      setAchievements((current) =>
        current.map((item) =>
          newUnlockedSet.has(item.id) ? { ...item, unlocked: true } : item,
        ),
      );

      if (!isInitialLoadRef.current) {
        const seenStorageKey = `seen_achievements_${currentUserId}`;
        const seenList: string[] = JSON.parse(localStorage.getItem(seenStorageKey) || "[]");
        const freshUnlocks = newlyUnlockedIds.filter((id) => !seenList.includes(id));

        if (freshUnlocks.length > 0) {
          localStorage.setItem(seenStorageKey, JSON.stringify([...seenList, ...freshUnlocks]));
          const freshTitle =
            currentRows.find((item) => item.id === freshUnlocks[0])?.title ??
            "Achievement";
          const subtitle =
            freshUnlocks.length > 1
              ? `${freshTitle} (+${freshUnlocks.length - 1} more)`
              : freshTitle;

          showEvent("achievement", "ACHIEVEMENT UNLOCKED", subtitle);
        }
      }
    }
  };

  useEffect(() => {
    if (!user) return;

    Promise.all([
      fetchPlayer(user.id),
      fetchQuests(user.id),
      fetchAchievements(user.id),
      fetchRewards(user.id),
      fetchTotalQuestsCompleted(user.id),
      getOrCreateDailyDirective(user.id),
      getOrCreatePerfectDayRecord(user.id),
      fetchPlayerEquipment(user.id),
      fetchEquippedTitle(user.id),
      getOrCreateDailyRandomEvent(user.id),
      getOrCreateWeeklyChallenge(user.id),
      getOrCreateMonthlyChallenge(user.id),
      getOrCreatePlayerSeason(user.id),
      getPersonalRecords(user.id),
    ]).then(([
      fetchedPlayer,
      fetchedQuests,
      achievementData,
      fetchedRewards,
      completionCount,
      loadedDirective,
      loadedPerfectDay,
      loadedEquipment,
      loadedTitle,
      loadedRandomEvent,
      loadedWeeklyChallenge,
      loadedMonthlyChallenge,
      loadedPlayerSeason,
      loadedPersonalRecords,
    ]) => {
      setDailyDirective(loadedDirective);
      setPerfectDayRecord(loadedPerfectDay);
      setEquipment(loadedEquipment);
      setEquippedTitle(loadedTitle ?? null);
      setRandomEvent(loadedRandomEvent);
      setWeeklyChallenge(loadedWeeklyChallenge);
      setMonthlyChallenge(loadedMonthlyChallenge);
      setPlayerSeason(loadedPlayerSeason);
      setPersonalRecords(loadedPersonalRecords);
      // Seed already unlocked achievements into evaluatedAchievementsRef
      achievementData.achievements
        .filter((item: Achievement) => item.unlocked)
        .forEach((item: Achievement) => evaluatedAchievementsRef.current.add(item.id));

      // Validate player rank against authoritative requirements without downgrading
      if (fetchedPlayer) {
        const bossesSlainCount = getDefeatedBossesCount(user.id);
        const validatedRank = evaluatePlayerRank({
          totalXP: fetchedPlayer.progress.totalXP,
          tasksCompleted: completionCount,
          streak: fetchedPlayer.progress.currentStreak,
          bestStreak: fetchedPlayer.progress.bestStreak,
          currentRankId: fetchedPlayer.progress.rank,
          stats: fetchedPlayer.stats,
          bossesSlain: bossesSlainCount,
        });

        if (validatedRank.id !== fetchedPlayer.progress.rank) {
          fetchedPlayer.progress.rank = validatedRank.id;
          void savePlayerProgress(user.id, fetchedPlayer);
        }

        // Check and unlock titles from player progress
        void checkAndUnlockTitlesFromProgress(
          user.id,
          fetchedPlayer,
          achievementData.achievements,
          bossesSlainCount,
          Boolean(loadedPerfectDay?.earned)
        );
      }

      setPlayer(fetchedPlayer);
      setQuests(fetchedQuests);
      setAchievements(achievementData.achievements);
      setAchievementRows(achievementData.rows);
      setRewards(fetchedRewards);
      setTotalQuestsCompleted(completionCount);
      setLoading(false);

      if (fetchedPlayer) {
        const initialAllCompleted =
          fetchedQuests.length > 0 && fetchedQuests.every((q: Quest) => q.completed);
        evaluateAchievements(
          fetchedPlayer,
          completionCount,
          achievementData.rows,
          initialAllCompleted,
          user.id,
        );
      }

      // Check if user has answered the System Identification directive yet
      const identityPromptDone = localStorage.getItem(`system_identity_prompt_done_${user.id}`);
      if (!identityPromptDone) {
        setShowIdentityModal(true);
      }

      // Allow first check to settle existing unlocks silently
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 500);
    });
  }, [user]);

  const completeQuest = async (id: string) => {
    if (completingQuestIdsRef.current.has(id)) return;
    const quest = quests.find((item) => item.id === id);
    if (!quest || quest.completed || !player || !user) return;

    completingQuestIdsRef.current.add(id);

    try {
      // 0. Compute active buffs (Double XP, Blade of Focus, Coin Magnet)
      let earnedXP = quest.xpReward;
      let earnedCoins = quest.coinReward;

      const doubleXpResult = consumeDoubleXpCharge(user.id);
      const hasDoubleXp = doubleXpResult.wasBuffApplied;
      if (hasDoubleXp) {
        earnedXP = earnedXP * 2;
      }

      if (isPassiveGearOwned(user.id, "blade_of_focus")) {
        earnedXP = Math.round(earnedXP * 1.1);
      }

      const hasCoinMagnet = isCoinMagnetActive(user.id);
      if (hasCoinMagnet) {
        earnedCoins = Math.round(earnedCoins * 1.5);
      }

      const wasRecorded = await recordQuestCompletion(
        user.id,
        quest.id,
        earnedXP,
        earnedCoins,
      );

      if (!wasRecorded) return;

      setQuests((current) =>
        current.map((item) =>
          item.id === id ? { ...item, completed: true } : item,
        ),
      );

      const currentTotalXP = player.progress.totalXP + earnedXP;
      const currentLevel = calculateLevel(currentTotalXP);
      const newTasksCompleted = totalQuestsCompleted + 1;

      const newStats = {
        ...player.stats,
        [quest.statReward.stat]:
          player.stats[quest.statReward.stat] + quest.statReward.amount,
      };

      // 1. Strike active bosses with damage first so defeats count towards rank
      const { defeatedBosses } = applyDamageToBosses(user.id);
      const bossesSlainCount = getDefeatedBossesCount(user.id);

      // 2. Evaluate rank using the updated boss defeat count and new stats
      const oldRankDef = getRankDefinition(player.progress.rank);
      const newRankDef = evaluatePlayerRank({
        totalXP: currentTotalXP,
        tasksCompleted: newTasksCompleted,
        streak: player.progress.currentStreak,
        bestStreak: player.progress.bestStreak,
        currentRankId: player.progress.rank,
        stats: newStats,
        bossesSlain: bossesSlainCount,
      });

      const updatedPlayer: Player = {
        ...player,
        progress: {
          ...player.progress,
          level: currentLevel,
          totalXP: currentTotalXP,
          coins: player.progress.coins + earnedCoins,
          rank: newRankDef.id,
        },
        stats: newStats,
      };

      // 3. Save updated player state and task count
      setPlayer(updatedPlayer);
      await savePlayerProgress(user.id, updatedPlayer);
      setTotalQuestsCompleted(newTasksCompleted);
      localStorage.setItem(`total_quests_completed_${user.id}`, String(newTasksCompleted));

      // 4. Update Daily Directive progress and apply reward if accomplished
      let finalPlayer = updatedPlayer;
      try {
        const directiveResult = await updateDailyDirectiveOnQuestComplete(user.id, quest, updatedPlayer);
        setDailyDirective(directiveResult.directive);

        if (directiveResult.rewardGranted && directiveResult.reward) {
          const { xp: dirXP, coins: dirCoins, stat: dirStat, statAmount: dirStatAmount } = directiveResult.reward;
          const postDirXP = finalPlayer.progress.totalXP + dirXP;
          const postDirLevel = calculateLevel(postDirXP);
          const postDirCoins = finalPlayer.progress.coins + dirCoins;
          const postDirStats = dirStat
            ? {
                ...finalPlayer.stats,
                [dirStat]: finalPlayer.stats[dirStat] + (dirStatAmount || 1),
              }
            : finalPlayer.stats;

          const postDirRankDef = evaluatePlayerRank({
            totalXP: postDirXP,
            tasksCompleted: newTasksCompleted,
            streak: finalPlayer.progress.currentStreak,
            bestStreak: finalPlayer.progress.bestStreak,
            currentRankId: finalPlayer.progress.rank,
            stats: postDirStats,
            bossesSlain: bossesSlainCount,
          });

          finalPlayer = {
            ...finalPlayer,
            progress: {
              ...finalPlayer.progress,
              level: postDirLevel,
              totalXP: postDirXP,
              coins: postDirCoins,
              rank: postDirRankDef.id,
            },
            stats: postDirStats,
          };

          setPlayer(finalPlayer);
          void savePlayerProgress(user.id, finalPlayer);

          showEvent(
            "system_directive",
            "DIRECTIVE ACCOMPLISHED!",
            `+${dirXP} XP  +${dirCoins} Coins${dirStat ? `  +${dirStatAmount || 1} ${dirStat.toUpperCase().slice(0, 3)}` : ""}`
          );
        }

        // 4b. Evaluate Perfect Day and apply reward if achieved
        const perfectDayResult = await evaluateAndProcessPerfectDay(user.id, directiveResult.directive);
        setPerfectDayRecord(perfectDayResult.record);

        if (perfectDayResult.rewardGranted && perfectDayResult.reward) {
          const { xp: pdXP, coins: pdCoins } = perfectDayResult.reward;
          const postPdXP = finalPlayer.progress.totalXP + pdXP;
          const postPdLevel = calculateLevel(postPdXP);
          const postPdCoins = finalPlayer.progress.coins + pdCoins;

          const postPdRankDef = evaluatePlayerRank({
            totalXP: postPdXP,
            tasksCompleted: newTasksCompleted,
            streak: finalPlayer.progress.currentStreak,
            bestStreak: finalPlayer.progress.bestStreak,
            currentRankId: finalPlayer.progress.rank,
            stats: finalPlayer.stats,
            bossesSlain: bossesSlainCount,
          });

          finalPlayer = {
            ...finalPlayer,
            progress: {
              ...finalPlayer.progress,
              level: postPdLevel,
              totalXP: postPdXP,
              coins: postPdCoins,
              rank: postPdRankDef.id,
            },
            stats: finalPlayer.stats,
          };

          setPlayer(finalPlayer);
          void savePlayerProgress(user.id, finalPlayer);

          // If directive accomplished event was shown, queue perfect day event smoothly
          window.setTimeout(() => {
            showEvent(
              "perfect_day",
              "PERFECT DAY ACHIEVED!",
              `+${pdXP} XP  +${pdCoins} Coins`
            );
          }, directiveResult.rewardGranted ? 2900 : 0);
        }
      } catch (dirErr) {
        console.warn("Failed to update daily directive / perfect day progress:", dirErr);
      }

      // 4c. Phase 2.3: Record daily activity for streak calendar
      void recordDailyActivity(user.id, {
        questsIncrement: 1,
        xpIncrement: earnedXP,
        perfectDayEarned: Boolean(perfectDayRecord?.earned),
      });

      // 4d. Phase 2.4: Update Random Event on quest completion
      try {
        const eventResult = await updateRandomEventOnQuestComplete(user.id, quest);
        if (eventResult.event) {
          setRandomEvent(eventResult.event);
        }
        if (eventResult.rewardGranted && eventResult.reward) {
          const { xp: evXP, coins: evCoins } = eventResult.reward;
          const postEvXP = finalPlayer.progress.totalXP + evXP;
          const postEvLevel = calculateLevel(postEvXP);
          const postEvCoins = finalPlayer.progress.coins + evCoins;
          const postEvRankDef = evaluatePlayerRank({
            totalXP: postEvXP,
            tasksCompleted: newTasksCompleted,
            streak: finalPlayer.progress.currentStreak,
            bestStreak: finalPlayer.progress.bestStreak,
            currentRankId: finalPlayer.progress.rank,
            stats: finalPlayer.stats,
            bossesSlain: bossesSlainCount,
          });

          finalPlayer = {
            ...finalPlayer,
            progress: {
              ...finalPlayer.progress,
              level: postEvLevel,
              totalXP: postEvXP,
              coins: postEvCoins,
              rank: postEvRankDef.id,
            },
          };
          setPlayer(finalPlayer);
          void savePlayerProgress(user.id, finalPlayer);

          showToast(`EVENT ACCOMPLISHED! +${evXP} XP  +${evCoins} Coins`);
        }
      } catch (evErr) {
        console.warn("Failed to update random event progress:", evErr);
      }

      // 4f. Phase 4.1: Update Weekly Challenge on quest completion
      try {
        const weeklyResult = await updateWeeklyChallengeProgress(user.id, {
          questsCompleted: 1,
          xpEarned: earnedXP,
          coinsEarned: earnedCoins,
          bossesDefeated: defeatedBosses.length > 0 ? defeatedBosses.length : undefined,
          perfectDaysEarned: perfectDayRecord?.earned ? 1 : undefined,
          statGains: [{ stat: quest.statReward.stat, amount: quest.statReward.amount }],
        });

        if (weeklyResult.challenge) {
          setWeeklyChallenge(weeklyResult.challenge);
        }

        if (weeklyResult.rewardGranted && weeklyResult.reward) {
          const { xp: wkXP, coins: wkCoins, itemId: wkItem } = weeklyResult.reward;
          const postWkXP = finalPlayer.progress.totalXP + wkXP;
          const postWkLevel = calculateLevel(postWkXP);
          const postWkCoins = finalPlayer.progress.coins + wkCoins;
          const postWkRankDef = evaluatePlayerRank({
            totalXP: postWkXP,
            tasksCompleted: newTasksCompleted,
            streak: finalPlayer.progress.currentStreak,
            bestStreak: finalPlayer.progress.bestStreak,
            currentRankId: finalPlayer.progress.rank,
            stats: finalPlayer.stats,
            bossesSlain: bossesSlainCount,
          });

          finalPlayer = {
            ...finalPlayer,
            progress: {
              ...finalPlayer.progress,
              level: postWkLevel,
              totalXP: postWkXP,
              coins: postWkCoins,
              rank: postWkRankDef.id,
            },
          };
          setPlayer(finalPlayer);
          void savePlayerProgress(user.id, finalPlayer);

          showEvent(
            "weekly_challenge",
            "WEEKLY CHALLENGE COMPLETE!",
            `+${wkXP} XP  +${wkCoins} Coins${wkItem ? `  +Rare Loot` : ""}`
          );
        }
      } catch (wkErr) {
        console.warn("Failed to update weekly challenge progress:", wkErr);
      }

      // 4g. Phase 4.2: Update Monthly Challenge on quest completion
      try {
        const monthlyResult = await updateMonthlyChallengeProgress(user.id, {
          questsCompleted: 1,
          xpEarned: earnedXP,
          bossesDefeated: defeatedBosses.length > 0 ? defeatedBosses.length : undefined,
          perfectDays: perfectDayRecord?.earned ? 1 : undefined,
          statTraining: { stat: quest.statReward.stat, count: 1 },
        });

        if (monthlyResult.challenge) {
          setMonthlyChallenge(monthlyResult.challenge);
        }

        if (monthlyResult.rewardGranted) {
          const { xp: mcXP, coins: mcCoins, itemId: mcItem } = monthlyResult.rewardGranted;
          const postMcXP = finalPlayer.progress.totalXP + mcXP;
          const postMcLevel = calculateLevel(postMcXP);
          const postMcCoins = finalPlayer.progress.coins + mcCoins;
          const postMcRankDef = evaluatePlayerRank({
            totalXP: postMcXP,
            tasksCompleted: newTasksCompleted,
            streak: finalPlayer.progress.currentStreak,
            bestStreak: finalPlayer.progress.bestStreak,
            currentRankId: finalPlayer.progress.rank,
            stats: finalPlayer.stats,
            bossesSlain: bossesSlainCount,
          });

          finalPlayer = {
            ...finalPlayer,
            progress: {
              ...finalPlayer.progress,
              level: postMcLevel,
              totalXP: postMcXP,
              coins: postMcCoins,
              rank: postMcRankDef.id,
            },
          };
          setPlayer(finalPlayer);
          void savePlayerProgress(user.id, finalPlayer);

          showEvent(
            "monthly_challenge",
            "MONTHLY CAMPAIGN CONQUERED!",
            `+${mcXP} XP  +${mcCoins} Coins${mcItem ? `  +Epic Gear` : ""}`
          );
        }
      } catch (mcErr) {
        console.warn("Failed to update monthly challenge progress:", mcErr);
      }

      // 4h. Phase 4.3: Add Season XP for legitimate game activity
      try {
        let seasonGain = 25; // 25 Season XP per quest
        if (defeatedBosses.length > 0) seasonGain += 300;
        if (perfectDayRecord?.earned) seasonGain += 150;

        const seasonRes = await addSeasonXP(user.id, seasonGain);
        setPlayerSeason(seasonRes.playerSeason);

        if (seasonRes.leveledUp) {
          showEvent(
            "season_milestone",
            "SEASON LEVEL UP!",
            `Ascended to Season Level ${seasonRes.newLevel} / 10`
          );
        }
      } catch (sErr) {
        console.warn("Failed to update season progress:", sErr);
      }

      // 4i. Phase 4.4: Update Personal Records (High-Water Marks)
      try {
        const updatedRecords = await updatePersonalRecords(user.id, {
          longest_streak: finalPlayer.progress.bestStreak,
          highest_power_score: powerScore,
          total_bosses_defeated: bossesSlainCount,
          total_perfect_days: perfectDayRecord?.earned ? 1 : undefined,
          highest_season_level: playerSeason?.seasonLevel || 1,
        });
        setPersonalRecords(updatedRecords);
      } catch (prErr) {
        console.warn("Failed to update personal records:", prErr);
      }

      // 4e. Phase 3: Check title unlocks
      void checkAndUnlockTitlesFromProgress(
        user.id,
        finalPlayer,
        achievements,
        bossesSlainCount,
        Boolean(perfectDayRecord?.earned)
      ).then((newTitles) => {
        if (newTitles && newTitles.length > 0) {
          showToast(`New title unlocked! Check the Armory.`);
        }
      });

      // 5. Trigger rank-up cinematic or notification events
      const hasRankedUp = newRankDef.tierOrder > oldRankDef.tierOrder;
      if (hasRankedUp) {
        setCinematicRankUp({
          newRank: newRankDef,
          previousRank: oldRankDef,
        });
      }

      if (defeatedBosses.length > 0) {
        const boss = defeatedBosses[0];
        showEvent("boss_defeat", "BOSS SLAIN!", `${boss.name} has fallen! Claim your victory loot in the Boss Arena!`);
      } else if (!hasRankedUp) {
        const xpBadge = hasDoubleXp ? `+${earnedXP} XP (2X BUFF!)` : `+${earnedXP} XP`;
        const coinsBadge = hasCoinMagnet ? `+${earnedCoins} Coins (+50% BUFF!)` : `+${earnedCoins} Coins`;
        showEvent("quest_complete", "QUEST COMPLETE", `${xpBadge}  ${coinsBadge}`);
      }

      if (hasDoubleXp) {
        void fetchRewards(user.id).then(setRewards);
        if (doubleXpResult.remainingCharges > 0) {
          showToast(`Double XP active: ${doubleXpResult.remainingCharges} quest(s) remaining`);
        } else {
          showToast("Double XP Elixir consumed!");
        }
      }

      const allCompletedNow = quests.every((item) =>
        item.id === id ? true : item.completed,
      );
      evaluateAchievements(
        finalPlayer,
        newTasksCompleted,
        achievementRows,
        allCompletedNow || Boolean(perfectDayRecord?.earned),
        user.id,
      );
    } finally {
      completingQuestIdsRef.current.delete(id);
    }
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

    if (await addQuest(user.id, quest)) {
      setQuests(await fetchQuests(user.id));
      showToast(`NEW QUEST ADDED: ${quest.title}`);
    }
  };

  const handleRemoveQuest = async (id: string) => {
    if (!user) return;

    if (await deactivateQuest(user.id, id)) {
      setQuests((current) => current.filter((quest) => quest.id !== id));
    }
  };

  const handlePurchaseReward = async (rewardId: string, cost: number) => {
    if (!user || !player || isPurchasingRewardRef.current) return;
    isPurchasingRewardRef.current = true;

    try {
      const result = await purchaseReward(
        user.id,
        rewardId,
        cost,
        player.progress.coins,
      );

      if (!result.success) {
        showToast(result.error ?? "Purchase failed");
        return;
      }

      let updatedStats = { ...player.stats };
      let customToast = "REWARD REDEEMED";

      // Apply specific item buffs & effects
      if (rewardId === "potion_xp") {
        addDoubleXpCharges(user.id, 3);
        customToast = "Double XP Elixir activated! Next 3 quests award 2X XP.";
      } else if (rewardId === "coin_magnet") {
        activateCoinMagnet(user.id, 24);
        customToast = "Coin Magnet activated! +50% coins for 24 hours.";
      } else if (rewardId === "vitality_infusion") {
        updatedStats.vitality += 5;
        customToast = "+5 Vitality permanently added!";
      } else if (rewardId === "focus_brew") {
        updatedStats.focus += 5;
        customToast = "+5 Focus permanently added!";
      } else if (rewardId === "discipline_draught") {
        updatedStats.discipline += 5;
        customToast = "+5 Discipline permanently added!";
      }

      const authoritativeCoins = typeof result.newCoins === "number" ? result.newCoins : Math.max(0, player.progress.coins - cost);
      const updatedPlayer: Player = {
        ...player,
        progress: {
          ...player.progress,
          coins: authoritativeCoins,
        },
        stats: updatedStats,
      };

      setPlayer(updatedPlayer);
      await savePlayerProgress(user.id, updatedPlayer);

      setRewards((current) =>
        current.map((reward) =>
          reward.id === rewardId ? { ...reward, owned: true } : reward,
        ),
      );

      showToast(customToast);

      evaluateAchievements(
        updatedPlayer,
        totalQuestsCompleted,
        achievementRows,
        allQuestsCompleted,
        user.id,
      );
    } finally {
      isPurchasingRewardRef.current = false;
    }
  };

  const handleBossRewardClaimed = async (reward: {
    xp: number;
    coins: number;
    statBonus?: { stat: string; amount: number };
    title?: string;
  }) => {
    if (!player || !user) return;

    const currentTotalXP = player.progress.totalXP + reward.xp;
    const currentLevel = calculateLevel(currentTotalXP);
    const bossesSlainCount = getDefeatedBossesCount(user.id);
    const newStats = reward.statBonus
      ? {
          ...player.stats,
          [reward.statBonus.stat]:
            (player.stats[reward.statBonus.stat as StatName] ?? 0) +
            reward.statBonus.amount,
        }
      : player.stats;

    const oldRankDef = getRankDefinition(player.progress.rank);
    const newRankDef = evaluatePlayerRank({
      totalXP: currentTotalXP,
      tasksCompleted: totalQuestsCompleted,
      streak: player.progress.currentStreak,
      bestStreak: player.progress.bestStreak,
      currentRankId: player.progress.rank,
      stats: newStats,
      bossesSlain: bossesSlainCount,
    });

    const updatedPlayer: Player = {
      ...player,
      progress: {
        ...player.progress,
        level: currentLevel,
        totalXP: currentTotalXP,
        coins: player.progress.coins + reward.coins,
        rank: newRankDef.id,
      },
      stats: newStats,
    };

    setPlayer(updatedPlayer);
    await savePlayerProgress(user.id, updatedPlayer);

    if (newRankDef.tierOrder > oldRankDef.tierOrder) {
      setCinematicRankUp({
        newRank: newRankDef,
        previousRank: oldRankDef,
      });
    } else {
      showEvent(
        "boss_defeat",
        "SPOILS CLAIMED!",
        `+${reward.xp} XP  +${reward.coins} Coins${reward.title ? ` — Title: "${reward.title}"` : ""}`,
      );
    }

    evaluateAchievements(
      updatedPlayer,
      totalQuestsCompleted,
      achievementRows,
      allQuestsCompleted,
      user.id,
    );
  };


  const handleAddReward = async (reward: {
    title: string;
    description: string;
    cost: number;
    type: string;
  }) => {
    if (!user) return;

    if (await addReward(user.id, reward)) {
      setRewards(await fetchRewards(user.id));
      showToast(`NEW REWARD ADDED: ${reward.title}`);
    }
  };

  const handleAvatarChange = async (avatarId: string, customName?: string) => {
    if (!player || !user) return;

    const newName = customName?.trim() || player.profile?.name || "Player";
    const updatedPlayer: Player = {
      ...player,
      profile: {
        ...player.profile,
        avatarId,
        name: newName,
      },
    };

    setPlayer(updatedPlayer);
    await Promise.all([
      savePlayerAvatar(user.id, avatarId),
      savePlayerName(user.id, newName),
    ]);
    showToast(`Avatar updated: ${newName}`);
  };

  const handleNameChange = async (name: string) => {
    if (!player || !user) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    const updatedPlayer: Player = {
      ...player,
      profile: {
        ...player.profile,
        name: trimmed,
      },
    };

    setPlayer(updatedPlayer);
    await savePlayerName(user.id, trimmed);
    showToast(`Avatar name changed to "${trimmed}"`);
  };

  const handleSystemIdentityConfirm = async (name: string, avatarId: string) => {
    if (!player || !user) return;

    localStorage.setItem(`system_identity_prompt_done_${user.id}`, "true");
    const updatedPlayer: Player = {
      ...player,
      profile: {
        ...player.profile,
        name,
        avatarId,
      },
    };

    setPlayer(updatedPlayer);
    await Promise.all([
      savePlayerAvatar(user.id, avatarId),
      savePlayerName(user.id, name),
    ]);
    showEvent("system_directive", "IDENTITY REGISTERED", `Designation: "${name}"`);
    setShowIdentityModal(false);
  };

  const handleSystemIdentityClose = () => {
    if (user) {
      localStorage.setItem(`system_identity_prompt_done_${user.id}`, "true");
    }
    setShowIdentityModal(false);
  };

  const allQuestsCompleted =
    quests.length > 0 && quests.every((quest) => quest.completed);

  const totalXP = player?.progress.totalXP ?? 0;
  const level = calculateLevel(totalXP);
  const xpIntoLevel = getXPIntoCurrentLevel(totalXP);

  const effectiveStats = player ? calculateEffectiveStats(player.stats, equipment) : {
    strength: 0,
    intelligence: 0,
    vitality: 0,
    focus: 0,
    discipline: 0,
    consistency: 0,
  };

  const powerScore = player
    ? calculatePowerScore({
        level,
        rankTierOrder: getRankDefinition(player.progress.rank).tierOrder,
        effectiveStats,
        totalQuestsCompleted,
        bestStreak: player.progress.bestStreak ?? 0,
        bossesSlain: user ? getDefeatedBossesCount(user.id) : 0,
        achievementsUnlocked: achievements.filter((a) => a.unlocked).length,
      })
    : 0;

  const endDay = () => {
    if (!player || !user) return;

    const incompleteCount = quests.filter((quest) => !quest.completed).length;
    const newStreak = incompleteCount === 0 ? player.progress.currentStreak + 1 : 0;
    const newBestStreak = Math.max(player.progress.bestStreak ?? 0, newStreak);
    const bossesSlainCount = getDefeatedBossesCount(user.id);
    const oldRankDef = getRankDefinition(player.progress.rank);

    const newRankDef = evaluatePlayerRank({
      totalXP: player.progress.totalXP,
      tasksCompleted: totalQuestsCompleted,
      streak: newStreak,
      bestStreak: newBestStreak,
      currentRankId: player.progress.rank,
      stats: player.stats,
      bossesSlain: bossesSlainCount,
    });

    const updatedPlayer: Player = {
      ...player,
      progress: {
        ...player.progress,
        currentStreak: newStreak,
        bestStreak: newBestStreak,
        coins:
          incompleteCount === 0
            ? player.progress.coins
            : Math.max(0, player.progress.coins - incompleteCount * 5),
        rank: newRankDef.id,
      },
    };

    setPlayer(updatedPlayer);
    void savePlayerProgress(user.id, updatedPlayer);

    const hasRankedUp = newRankDef.tierOrder > oldRankDef.tierOrder;
    if (hasRankedUp) {
      setCinematicRankUp({
        newRank: newRankDef,
        previousRank: oldRankDef,
      });
    }

    if (incompleteCount === 0) {
      if (newStreak >= 7 && (newStreak === 7 || newStreak === 14 || newStreak === 30 || newStreak % 30 === 0)) {
        showEvent("streak_milestone", `${newStreak} DAY STREAK`, "Your discipline is legendary.");
      } else if (!hasRankedUp) {
        showEvent("day_complete", "DAY COMPLETE", `+1 Streak — ${newStreak} days`);
      }
    } else {
      showToast("DAY ENDED — STREAK RESET");
    }

    setQuests((current) =>
      current.map((quest) => ({ ...quest, completed: false })),
    );

    evaluateAchievements(
      updatedPlayer,
      totalQuestsCompleted,
      achievementRows,
      incompleteCount === 0,
      user.id,
    );
  };

  // Level-up notification effect
  useEffect(() => {
    if (previousLevelRef.current === null) {
      previousLevelRef.current = level;
      return;
    }
    if (level > previousLevelRef.current) {
      showEvent("quest_complete", "LEVEL UP", `You are now Level ${level}`);
      previousLevelRef.current = level;
    }
  }, [level]);

  if (authLoading) return <p>Checking session...</p>;
  if (!user) return <Login />;
  const handleClaimSeasonMilestone = (
    milestone: SeasonMilestone,
    reward: { xp: number; coins: number; itemId?: string; titleId?: string }
  ) => {
    if (!player || !user) return;
    const postMilestoneXP = player.progress.totalXP + reward.xp;
    const postMilestoneLevel = calculateLevel(postMilestoneXP);
    const postMilestoneCoins = player.progress.coins + reward.coins;

    const updated: Player = {
      ...player,
      progress: {
        ...player.progress,
        level: postMilestoneLevel,
        totalXP: postMilestoneXP,
        coins: postMilestoneCoins,
      },
    };
    setPlayer(updated);
    void savePlayerProgress(user.id, updated);

    showEvent(
      "season_milestone",
      "SEASON MILESTONE CLAIMED!",
      `Level ${milestone.level}: +${reward.xp} XP  +${reward.coins} Coins${reward.itemId ? `  +Gear Loot` : ""}`
    );
  };

  if (loading || !player) return <p>Loading your save file...</p>;

  return (
    <>
      <Toast message={toastMessage} />
      <EventOverlay event={gameEvent} onClose={dismissEvent} />

      <div className="app-shell">
        <nav className="system-nav" aria-label="Primary navigation">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className="page-frame"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.18 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/profile" element={<Navigate to="/stats" replace />} />

              <Route
                path="/dashboard"
                element={
                  <Dashboard
                    quests={quests}
                    player={player}
                    allQuestsCompleted={allQuestsCompleted}
                    level={level}
                    xpIntoLevel={xpIntoLevel}
                    dailyDirective={dailyDirective}
                    perfectDayRecord={perfectDayRecord}
                    randomEvent={randomEvent}
                    weeklyChallenge={weeklyChallenge}
                    monthlyChallenge={monthlyChallenge}
                    playerSeason={playerSeason}
                    onClaimSeasonMilestone={handleClaimSeasonMilestone}
                    onAvatarChange={handleAvatarChange}
                  />
                }
              />

              <Route
                path="/quests"
                element={
                  <Quests
                    quests={quests}
                    player={player}
                    onComplete={completeQuest}
                    onEndDay={endDay}
                    onAddQuest={handleAddQuest}
                    onRemoveQuest={handleRemoveQuest}
                    allQuestsCompleted={allQuestsCompleted}
                    doubleXpCharges={user ? getActiveDoubleXpCharges(user.id) : 0}
                    dailyDirective={dailyDirective}
                  />
                }
              />

              <Route
                path="/stats"
                element={
                  <Status
                    userId={user.id}
                    level={level}
                    xpIntoLevel={xpIntoLevel}
                    player={player}
                    achievements={achievements}
                    title="Player Profile & Stats"
                    mode="stats"
                    powerScore={powerScore}
                    equippedTitle={equippedTitle}
                    records={personalRecords}
                    onAvatarChange={handleAvatarChange}
                    onNameChange={handleNameChange}
                  />
                }
              />

              <Route
                path="/armory"
                element={
                  <Armory
                    userId={user.id}
                    player={player}
                    equipment={equipment}
                    onEquipmentChange={setEquipment}
                    equippedTitle={equippedTitle}
                    onTitleChange={setEquippedTitle}
                    powerScore={powerScore}
                  />
                }
              />

              <Route
                path="/achievements"
                element={<Achievements achievements={achievements} />}
              />
              <Route path="/awards" element={<Navigate to="/achievements" replace />} />

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

              <Route
                path="/boss"
                element={
                  <Boss
                    userId={user.id}
                    playerLevel={level}
                    playerCoins={player.progress.coins}
                    onBossRewardClaimed={handleBossRewardClaimed}
                  />
                }
              />
              <Route
                path="/ranks"
                element={
                  <RankProgression
                    player={player}
                    totalQuestsCompleted={totalQuestsCompleted}
                    bossesDefeatedCount={getDefeatedBossesCount(user.id)}
                  />
                }
              />
              <Route
                path="/system-ai"
                element={
                  <SystemAI
                    player={player}
                    totalQuestsCompleted={totalQuestsCompleted}
                    bossesDefeatedCount={user ? getDefeatedBossesCount(user.id) : 0}
                    powerScore={powerScore}
                    equippedTitle={equippedTitle?.name}
                    equippedGear={{
                      weapon: equipment.weapon?.name,
                      armor: equipment.armor?.name,
                      accessory: equipment.accessory?.name,
                    }}
                    activeRandomEvent={randomEvent?.title}
                    weeklyChallenge={weeklyChallenge}
                    monthlyChallenge={monthlyChallenge}
                    playerSeason={playerSeason}
                    records={personalRecords}
                  />
                }
              />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </motion.main>
        </AnimatePresence>
      </div>

      {/* Cinematic Rank Ascension Overlay */}
      <CinematicRankUpModal
        isOpen={cinematicRankUp !== null}
        newRank={cinematicRankUp?.newRank ?? null}
        previousRank={cinematicRankUp?.previousRank ?? null}
        onClaim={() => setCinematicRankUp(null)}
      />

      {/* Solo Leveling / RPG System Identification Directive Prompt */}
      {player && (
        <SystemIdentityModal
          isOpen={showIdentityModal}
          currentName={player.profile?.name}
          currentAvatarId={player.profile?.avatarId}
          playerLevel={level}
          playerRank={player.progress.rank}
          onConfirm={handleSystemIdentityConfirm}
          onClose={handleSystemIdentityClose}
        />
      )}
    </>
  );
}
export default App;
