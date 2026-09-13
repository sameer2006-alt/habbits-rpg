import { useState } from "react";
import { Link } from "react-router-dom";
import { Coins, Flame, ChevronRight } from "lucide-react";
import type { Player, Quest, StatName } from "../types/game";
import XPBar from "../components/XPBar";
import Avatar from "../components/Avatar";
import AvatarSelector from "../components/AvatarSelector";
import QuestionIcon from "../components/QuestionIcon";
import { StatIcon } from "../components/icons/StatIcons";
import RankIcon from "../components/icons/RankIcon";
import { getRankDefinition } from "../data/ranks";
import type { DailyDirective } from "../data/dailyDirectives";
import DailyDirectiveCard from "../components/DailyDirectiveCard";
import type { PerfectDayRecord } from "../data/perfectDay";
import PerfectDayCard from "../components/PerfectDayCard";
import type { PlayerRandomEvent } from "../data/randomEvents";
import RandomEventCard from "../components/RandomEventCard";
import type { WeeklyChallenge } from "../data/weeklyChallenges";
import { WeeklyChallengeCard } from "../components/WeeklyChallengeCard";
import type { MonthlyChallenge } from "../data/monthlyChallenges";
import MonthlyChallengeCard from "../components/MonthlyChallengeCard";
import type { PlayerSeason, SeasonMilestone } from "../data/seasons";
import SeasonProgressCard from "../components/SeasonProgressCard";

interface DashboardProps {
  quests: Quest[];
  player: Player;
  allQuestsCompleted: boolean;
  level: number;
  xpIntoLevel: number;
  dailyDirective?: DailyDirective | null;
  perfectDayRecord?: PerfectDayRecord | null;
  randomEvent?: PlayerRandomEvent | null;
  weeklyChallenge?: WeeklyChallenge | null;
  monthlyChallenge?: MonthlyChallenge | null;
  playerSeason?: PlayerSeason | null;
  onClaimSeasonMilestone?: (milestone: SeasonMilestone, reward: { xp: number; coins: number; itemId?: string; titleId?: string }) => void;
  onAvatarChange?: (avatarId: string, customName?: string) => void;
}

const STAT_HELP: Record<string, string> = {
  strength: "Strength — earned from physical activity quests like exercise and sports.",
  intelligence: "Intelligence — earned from learning quests like reading and studying.",
  vitality: "Vitality — earned from health quests like healthy eating and sleep.",
  focus: "Focus — earned from concentration quests like meditation and deep work.",
  discipline: "Discipline — earned from self-control quests like waking up early.",
  consistency: "Consistency — earned from routine quests done regularly.",
};

const STAT_ENTRIES: { key: StatName; label: string }[] = [
  { key: "strength", label: "STR" },
  { key: "intelligence", label: "INT" },
  { key: "vitality", label: "VIT" },
  { key: "focus", label: "FOC" },
  { key: "discipline", label: "DIS" },
  { key: "consistency", label: "CON" },
];

function Dashboard({
  quests,
  player,
  allQuestsCompleted,
  level,
  xpIntoLevel,
  dailyDirective,
  perfectDayRecord,
  randomEvent,
  weeklyChallenge,
  monthlyChallenge,
  playerSeason,
  onClaimSeasonMilestone,
  onAvatarChange,
}: DashboardProps) {
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const activeCount = quests.filter((q) => !q.completed).length;
  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <main>
      <div className="system-header">
        <h1>System Dashboard</h1>

        <div className="inline-meta">
          <span className="value-badge">
            <Flame size={14} />
            STREAK: {player?.progress?.currentStreak ?? 0}
          </span>
          <span className="value-badge">
            <Coins size={14} />
            {player?.progress?.coins ?? 0}
          </span>
        </div>
      </div>

      {/* Avatar + XP section */}
      <div className="dashboard-hero">
        <div
          className="dashboard-avatar-clickable"
          onClick={() => setIsAvatarSelectorOpen(true)}
          title="Click to customize your avatar"
        >
          <Avatar
            level={level}
            rank={player.progress.rank}
            size={96}
            avatarId={player.profile?.avatarId}
            interactive={true}
          />
          <span className="dashboard-avatar-edit-tag">Change</span>
        </div>

        <div className="dashboard-hero-info">
          <div className="dashboard-player-identity">
            <h2 className="dashboard-player-name">
              {player.profile?.name || "Player"}
            </h2>
            <Link
              to="/ranks"
              className="dashboard-player-rank-badge"
              title="Inspect Rank Progression Roadmap"
              style={{
                borderColor: getRankDefinition(player.progress.rank).color,
                color: getRankDefinition(player.progress.rank).color,
              }}
            >
              <span>{getRankDefinition(player.progress.rank).badgeLabel}</span>
              <ChevronRight size={12} />
            </Link>
          </div>


          <div className="xp-shell">
            <div className="xp-header">
              <span>
                <RankIcon rank={player.progress.rank} size={16} />
                {" "}Level {level}
              </span>
              <span>{xpIntoLevel} XP</span>
            </div>
            <XPBar level={level} currentXP={xpIntoLevel} />
          </div>
        </div>
      </div>

      {/* Stats grid with icons and help tooltips */}
      <div className="status-grid" style={{ marginTop: "18px" }}>
        {STAT_ENTRIES.map(({ key, label }) => (
          <div key={key} className="stat-pill stat-pill-enhanced">
            <div className="stat-pill-header">
              <StatIcon stat={key} size={16} color="#c9a876" />
              <span className="card-title">{label}</span>
              <QuestionIcon helpText={STAT_HELP[key]} size={12} />
            </div>
            <strong>{player?.stats?.[key] ?? 0}</strong>
          </div>
        ))}
      </div>

      {/* Controlled Random Event HUD */}
      {randomEvent && (
        <div style={{ marginTop: "18px" }}>
          <RandomEventCard event={randomEvent} />
        </div>
      )}

      {/* Daily Directive HUD */}
      {dailyDirective && (
        <div style={{ marginTop: "18px" }}>
          <DailyDirectiveCard directive={dailyDirective} />
        </div>
      )}

      {/* Perfect Day HUD */}
      <div style={{ marginTop: "18px" }}>
        <PerfectDayCard record={perfectDayRecord ?? null} directive={dailyDirective ?? null} />
      </div>

      {/* Weekly Challenge HUD */}
      <div style={{ marginTop: "18px" }}>
        <WeeklyChallengeCard challenge={weeklyChallenge ?? null} />
      </div>

      {/* Monthly Challenge HUD */}
      <div style={{ marginTop: "18px" }}>
        <MonthlyChallengeCard challenge={monthlyChallenge ?? null} />
      </div>

      {/* 15-Day Season Progress HUD */}
      <div style={{ marginTop: "18px" }}>
        <SeasonProgressCard playerSeason={playerSeason ?? null} onClaimMilestone={onClaimSeasonMilestone} />
      </div>

      {/* Daily overview */}
      <div className="panel-box" style={{ marginTop: "18px" }}>
        <div className="panel-topbar">
          <div className="card-title">Daily Overview</div>
        </div>

        <div className="status-grid" style={{ gap: 8 }}>
          <div className="stat-pill">
            <span className="card-title">Active</span>
            <strong>{activeCount}</strong>
          </div>
          <div className="stat-pill">
            <span className="card-title">Completed</span>
            <strong>{completedCount}</strong>
          </div>
          <div className="stat-pill">
            <span className="card-title">Total</span>
            <strong>{quests.length}</strong>
          </div>
        </div>
      </div>

      {allQuestsCompleted && quests.length > 0 && (
        <div className="panel-box" style={{ marginTop: "18px" }}>
          <div className="card-title">Daily Mission Summary</div>
          <p style={{ marginTop: 10 }}>All quests complete. The system is stable.</p>
        </div>
      )}

      {/* Avatar Selection Modal */}
      <AvatarSelector
        isOpen={isAvatarSelectorOpen}
        currentAvatarId={player.profile?.avatarId}
        currentName={player.profile?.name}
        onSelectAvatar={(id, customName) => onAvatarChange?.(id, customName)}
        onClose={() => setIsAvatarSelectorOpen(false)}
        playerLevel={level}
        playerRank={player.progress.rank}
      />
    </main>
  );
}

export default Dashboard;