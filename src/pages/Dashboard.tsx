import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  Coins,
  Swords,
  ChevronRight,
  TrendingUp,
  Star,
  Award,
  CheckCircle2,
  Clock,
  Zap,
  History,
  Calendar,
  Shield,
  ArrowRight,
  Radio,
  Check,
  Skull,
  ExternalLink,
} from "lucide-react";
import type { Player, Quest, StatName } from "../types/game";
import Avatar from "../components/Avatar";
import AvatarSelector from "../components/AvatarSelector";
import QuestionIcon from "../components/QuestionIcon";
import { StatIcon } from "../components/icons/StatIcons";
import { getRankDefinition } from "../data/ranks";
import type { DailyDirective } from "../data/dailyDirectives";
import type { PerfectDayRecord } from "../data/perfectDay";
import { PERFECT_DAY_REWARDS } from "../data/perfectDay";
import type { PlayerRandomEvent } from "../data/randomEvents";
import type { WeeklyChallenge } from "../data/weeklyChallenges";
import type { MonthlyChallenge } from "../data/monthlyChallenges";
import type { PlayerSeason, SeasonMilestone } from "../data/seasons";
import { SEASON_LEVEL_THRESHOLDS, SEASON_MILESTONES } from "../data/seasons";
import { getCurrentSeasonWindow, claimSeasonMilestone } from "../lib/seasonsData";
import { getCurrentWeekRange } from "../lib/weeklyChallengesData";
import { getCurrentMonthRange } from "../lib/monthlyChallengesData";
import { getRequiredXP } from "../utils/levelSystem";
import { BOSSES } from "../data/bosses";
import { getBossProgressMap } from "../lib/bossData";
import "./Dashboard.css";

interface DashboardProps {
  quests: Quest[];
  player: Player;
  allQuestsCompleted: boolean;
  level: number;
  xpIntoLevel: number;
  powerScore?: number;
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
  allQuestsCompleted: _allQuestsCompleted,
  level,
  xpIntoLevel,
  powerScore = 0,
  dailyDirective,
  perfectDayRecord: _perfectDayRecord,
  randomEvent,
  weeklyChallenge,
  monthlyChallenge,
  playerSeason,
  onClaimSeasonMilestone,
  onAvatarChange,
}: DashboardProps) {
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [claimingSeasonLvl, setClaimingSeasonLvl] = useState<number | null>(null);

  // Time until midnight (for Perfect Day countdown)
  const [midnightCountdown, setMidnightCountdown] = useState<{ hours: number; minutes: number }>({ hours: 0, minutes: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      const diffMs = Math.max(0, midnight.getTime() - now.getTime());
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setMidnightCountdown({ hours, minutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Level & XP math
  const requiredXP = getRequiredXP(level) || 1;
  const safeCurrentXP = Math.max(0, xpIntoLevel);
  const xpPercentage = Math.max(0, Math.min(100, (safeCurrentXP / requiredXP) * 100));

  // Rank definition
  const rankDef = getRankDefinition(player.progress.rank);

  // Active season calculations
  const season = getCurrentSeasonWindow();
  const seasonLevel = playerSeason?.seasonLevel ?? 1;
  const currentSeasonXP = playerSeason?.seasonXP ?? 0;
  const nextSeasonThreshold = SEASON_LEVEL_THRESHOLDS[Math.min(seasonLevel, SEASON_LEVEL_THRESHOLDS.length - 1)] ?? 2000;
  const prevSeasonThreshold = SEASON_LEVEL_THRESHOLDS[Math.max(0, seasonLevel - 1)] ?? 0;
  const seasonLevelRange = Math.max(1, nextSeasonThreshold - prevSeasonThreshold);
  const seasonProgressInLevel = Math.max(0, currentSeasonXP - prevSeasonThreshold);
  const seasonPct = Math.min(100, Math.round((seasonProgressInLevel / seasonLevelRange) * 100));

  // Active weekly challenge calculations
  const weekRange = useMemo(() => getCurrentWeekRange(), []);
  const [weeklyDaysLeft] = useState<number>(() => {
    const end = new Date(weekRange.expiresAt);
    return Math.max(0, Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  });

  // Active monthly challenge calculations
  const monthRange = useMemo(() => getCurrentMonthRange(), []);

  // Weekly & monthly challenge progress values
  const weeklyCurrent = weeklyChallenge?.objectives?.[0]?.currentValue ?? (weeklyChallenge as unknown as { currentValue?: number })?.currentValue ?? 0;
  const weeklyTarget = weeklyChallenge?.objectives?.[0]?.targetValue ?? (weeklyChallenge as unknown as { targetValue?: number })?.targetValue ?? 20;
  const monthlyCurrent = monthlyChallenge?.objectives?.[0]?.currentValue ?? (monthlyChallenge as unknown as { currentValue?: number })?.currentValue ?? 0;
  const monthlyTarget = monthlyChallenge?.objectives?.[0]?.targetValue ?? (monthlyChallenge as unknown as { targetValue?: number })?.targetValue ?? 18;

  // Boss Threat Monitor data
  const activeBoss = BOSSES[0]; // Primary active raid boss
  const playerId = player?.profile?.id ?? (player as unknown as { id?: string })?.id;
  const bossProgress = useMemo(() => {
    if (!playerId) return { currentHp: activeBoss.maxHp, defeated: false };
    const map = getBossProgressMap(playerId);
    const p = map[activeBoss.id];
    return p ? { currentHp: p.currentHp, defeated: p.defeated } : { currentHp: activeBoss.maxHp, defeated: false };
  }, [playerId, activeBoss.id, activeBoss.maxHp]);

  const bossHpPct = Math.max(0, Math.min(100, Math.round((bossProgress.currentHp / activeBoss.maxHp) * 100)));

  // Quest statistics
  const completedQuests = useMemo(() => quests.filter((q) => q.completed), [quests]);
  const activeQuests = useMemo(() => quests.filter((q) => !q.completed), [quests]);

  // Directives checklist items (prioritize active quests, then completed)
  const checklistQuests = useMemo(() => {
    return [...activeQuests.slice(0, 3), ...completedQuests.slice(0, 2)].slice(0, 4);
  }, [activeQuests, completedQuests]);

  // Directives progress
  const directiveTarget = dailyDirective?.targetValue ?? 4;
  const directiveCurrent = dailyDirective?.currentValue ?? completedQuests.length;
  const directiveCompleted = dailyDirective?.completed ?? (directiveCurrent >= directiveTarget);
  const directivePct = Math.min(100, Math.round((directiveCurrent / Math.max(1, directiveTarget)) * 100));
  const directiveRemaining = Math.max(0, directiveTarget - directiveCurrent);

  // Perfect day segments (4 slots)
  const perfectDaySegments = useMemo(() => {
    const filledCount = Math.min(4, Math.round((directiveCurrent / Math.max(1, directiveTarget)) * 4));
    return [0, 1, 2, 3].map((idx) => idx < filledCount);
  }, [directiveCurrent, directiveTarget]);

  // Claim Season Milestone
  const handleSeasonClaim = async (m: SeasonMilestone) => {
    if (!playerSeason || claimingSeasonLvl !== null) return;
    setClaimingSeasonLvl(m.level);
    try {
      const res = await claimSeasonMilestone(playerSeason.userId, m.level);
      if (res.success && res.reward && onClaimSeasonMilestone) {
        onClaimSeasonMilestone(m, res.reward);
      }
    } finally {
      setClaimingSeasonLvl(null);
    }
  };

  // Next season milestone
  const nextSeasonMilestone = useMemo(() => {
    if (!playerSeason) return SEASON_MILESTONES[0];
    const unclaimed = SEASON_MILESTONES.find((m) => !playerSeason.milestonesClaimed.includes(m.level));
    return unclaimed || SEASON_MILESTONES[SEASON_MILESTONES.length - 1];
  }, [playerSeason]);

  const canClaimMilestone = Boolean(
    playerSeason &&
    nextSeasonMilestone &&
    playerSeason.seasonLevel >= nextSeasonMilestone.level &&
    !playerSeason.milestonesClaimed.includes(nextSeasonMilestone.level)
  );

  return (
    <main className="dashboard-root">
      <div className="dashboard-cinematic-bg" aria-hidden="true" />
      {/* ==========================================================================
          1. TOP: HUNTER PROFILE BANNER
          ========================================================================== */}
      <section className="hunter-hero-card">
        <div className="hunter-hero-backdrop" />
        <div className="hunter-hero-content">
          <div className="hunter-hero-top">
            {/* Identity: Avatar + Name + Title + Rank */}
            <div className="hunter-identity-group">
              <div
                className="hunter-avatar-box"
                onClick={() => setIsAvatarSelectorOpen(true)}
                title="Click to customize hunter avatar"
              >
                <Avatar
                  level={level}
                  rank={player.progress.rank}
                  size={84}
                  avatarId={player.profile?.avatarId}
                  interactive={true}
                />
                <span className="hunter-avatar-level-tag">LVL {level}</span>
                <span className="hunter-avatar-change-hint">Change</span>
              </div>

              <div className="hunter-identity-meta">
                <div className="hunter-identity-name-row">
                  <h1 className="hunter-player-name">{player.profile?.name || "Hunter"}</h1>
                  <span className="hunter-title-chip">
                    {(player as unknown as { inventory?: { equippedTitle?: string } })?.inventory?.equippedTitle ? `[ ${(player as unknown as { inventory?: { equippedTitle?: string } }).inventory?.equippedTitle} ]` : `[ ${rankDef.name} ]`}
                  </span>
                  <Link
                    to="/ranks"
                    className="hunter-rank-link"
                    style={{
                      borderColor: rankDef.color,
                      color: rankDef.color,
                    }}
                    title="Inspect Rank Ascension Ladder"
                  >
                    <span>{rankDef.badgeLabel}</span>
                    <ChevronRight size={12} />
                  </Link>
                </div>
                <p className="hunter-system-quote">
                  Hunter identity synchronized. Complete your daily directives and ascend to higher ranks.
                </p>
              </div>
            </div>

            {/* 3 Quick Stat Tiles */}
            <div className="hunter-telemetry-tiles">
              <div className="telemetry-tile">
                <div className="telemetry-tile-header">
                  <Swords size={14} color="var(--crimson-vivid)" />
                  <span className="telemetry-tile-label">POWER</span>
                </div>
                <span className="telemetry-tile-value">{powerScore.toLocaleString()}</span>
                <span className="telemetry-tile-sub">Power Score</span>
              </div>

              <div className="telemetry-tile">
                <div className="telemetry-tile-header">
                  <Flame size={14} color="var(--gold-amber)" />
                  <span className="telemetry-tile-label">STREAK</span>
                </div>
                <span className="telemetry-tile-value" style={{ color: "var(--gold-highlight)" }}>
                  {player?.progress?.currentStreak ?? 0} DAYS
                </span>
                <span className="telemetry-tile-sub">Active Streak</span>
              </div>

              <div className="telemetry-tile">
                <div className="telemetry-tile-header">
                  <Coins size={14} color="var(--gold-light)" />
                  <span className="telemetry-tile-label">COINS</span>
                </div>
                <span className="telemetry-tile-value">{player?.progress?.coins ?? 0}</span>
                <span className="telemetry-tile-sub">Hunter Coins</span>
              </div>
            </div>
          </div>

          {/* Level Progress Gauge */}
          <div className="hunter-xp-gauge">
            <div className="hunter-xp-gauge-header">
              <div className="hunter-xp-gauge-title">
                <TrendingUp size={14} color="var(--crimson-vivid)" />
                <span>LEVEL PROGRESS</span>
              </div>
              <div className="hunter-xp-gauge-numbers">
                <span>
                  {safeCurrentXP} / {requiredXP} XP
                </span>
                <span className="hunter-xp-gauge-pct">({xpPercentage.toFixed(1)}%)</span>
              </div>
            </div>
            <div className="hunter-xp-track">
              <div className="hunter-xp-fill" style={{ width: `${xpPercentage}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          2. MAIN ROW: DAILY DIRECTIVE (8 cols) & PERFECT DAY (4 cols)
          ========================================================================== */}
      <section className="dashboard-main-grid">
        {/* Left: Daily Directive Card (8 cols) */}
        <div className={`main-col-directive directive-card-shell ${directiveCompleted ? "accomplished" : ""}`}>
          <div>
            <div className="directive-header-row">
              <div className="directive-badge">
                <span className="directive-pulsing-dot" />
                <span>DAILY DIRECTIVE</span>
              </div>
              <span className="directive-reward-pill">
                +{dailyDirective?.rewardXP ?? 50} XP · +{dailyDirective?.rewardCoins ?? 15} COINS
              </span>
            </div>

            <div className="directive-body">
              <h2 className="directive-title">
                {dailyDirective?.title || "Sustain Core Discipline"}
              </h2>
              <p className="directive-description">
                {dailyDirective?.description || "Execute daily protocol objectives to maintain your hunter streak and build permanent stats."}
              </p>
            </div>

            {/* Checklist items */}
            <div className="directive-checklist">
              {checklistQuests.length > 0 ? (
                checklistQuests.map((quest) => (
                  <div key={quest.id} className="checklist-item">
                    <div className="checklist-item-left">
                      {quest.completed ? (
                        <CheckCircle2 size={16} color="var(--crimson-vivid)" />
                      ) : (
                        <Radio size={16} color="var(--crimson-light)" />
                      )}
                      <span className={`checklist-item-text ${quest.completed ? "completed" : ""}`}>
                        {quest.title}
                      </span>
                    </div>
                    <span className={`checklist-item-status ${quest.completed ? "" : "active"}`}>
                      {quest.completed ? "Completed" : "Active"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="checklist-item" style={{ gridColumn: "1 / -1", justifyContent: "center" }}>
                  <span className="checklist-item-text" style={{ color: "var(--text-muted)" }}>
                    No active daily directives found. Click execute to configure missions.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="directive-footer">
            <div className="directive-progress-stat">
              <div className="directive-pct-circle">{directivePct}%</div>
              <div className="directive-progress-texts">
                <span className="directive-progress-main">
                  {directiveCurrent} of {directiveTarget} Directives Completed
                </span>
                <span className="directive-progress-sub">
                  {directiveRemaining > 0
                    ? `${directiveRemaining} final directive${directiveRemaining > 1 ? "s" : ""} to unlock Perfect Day`
                    : "All directives accomplished! System stability at 100%."}
                </span>
              </div>
            </div>

            <Link to="/quests" className="directive-cta-button">
              {directiveCompleted ? (
                <>
                  <Check size={16} />
                  <span>DIRECTIVES CLEARED</span>
                </>
              ) : (
                <>
                  <Swords size={16} />
                  <span>EXECUTE DIRECTIVES</span>
                </>
              )}
            </Link>
          </div>
        </div>

        {/* Right: Perfect Day Card (4 cols) */}
        <div className={`main-col-perfect-day perfect-day-shell ${directiveCompleted ? "achieved" : ""}`}>
          <div>
            <div className="perfect-day-header">
              <div className="perfect-day-badge">
                <Star size={16} color="var(--gold-amber)" />
                <span>PERFECT DAY</span>
              </div>
              <span className="perfect-day-tag">TODAY</span>
            </div>

            <h3 className="perfect-day-title">Daily Bonus</h3>
            <p className="perfect-day-sub">
              Complete {directiveTarget} daily directives to unlock today's bonus (+{PERFECT_DAY_REWARDS.xp} XP • +{PERFECT_DAY_REWARDS.coins} Coins).
            </p>

            {/* 4-Segment Gauge */}
            <div className="perfect-day-segments-box">
              <div className="perfect-day-segments-status">
                <span style={{ color: "var(--text-muted)" }}>STATUS</span>
                <span style={{ color: directiveRemaining === 0 ? "var(--gold-amber)" : "var(--crimson-light)" }}>
                  {directiveRemaining === 0 ? "ACHIEVED" : `${directiveRemaining} REMAINING`}
                </span>
              </div>
              <div className="perfect-day-segments-grid">
                {perfectDaySegments.map((isFilled, idx) => (
                  <div
                    key={idx}
                    className={`segment-pill ${
                      isFilled ? (directiveCompleted ? "filled-gold" : "filled") : ""
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Bonus Preview */}
            <div className="bonus-reward-card">
              <div className="bonus-reward-icon">
                <Award size={18} />
              </div>
              <div className="bonus-reward-meta">
                <span className="bonus-reward-label">BONUS REWARD</span>
                <span className="bonus-reward-val">
                  +{PERFECT_DAY_REWARDS.xp} XP · +{PERFECT_DAY_REWARDS.coins} Coins
                </span>
              </div>
            </div>
          </div>

          <div className="perfect-day-footer">
            <span>Resets at midnight</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Clock size={12} />
              <span>
                {midnightCountdown.hours}h {midnightCountdown.minutes}m remaining
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          3. PROGRESSION ROW (3 CLEAN CARDS)
          ========================================================================== */}
      <section className="progression-section">
        <div className="progression-section-header">
          <div className="progression-section-title">
            <Calendar size={16} color="var(--crimson-vivid)" />
            <span>PROGRESSION // LONG TERM GOALS</span>
          </div>
          <span className="text-label-sm" style={{ color: "var(--text-muted)" }}>
            TACTICAL HORIZONS
          </span>
        </div>

        <div className="progression-cards-grid">
          {/* Card 1: Weekly Challenge */}
          <div className="progression-card">
            <div className="progression-card-top">
              <div className="progression-card-header">
                <span className="progression-card-type">WEEKLY CHALLENGE</span>
                <span className="progression-card-remaining">
                  <Clock size={12} />
                  <span>{weeklyDaysLeft} days remaining</span>
                </span>
              </div>
              <div>
                <h4 className="progression-card-name">
                  {weeklyChallenge?.title || "Consistency Vanguard"}
                </h4>
                <p className="progression-card-desc">
                  {weeklyChallenge?.description || "Execute daily habit objectives across the week to solidify momentum."}
                </p>
              </div>
              <div className="progression-card-gauge-box">
                <div className="progression-card-gauge-header">
                  <span style={{ color: "var(--text-muted)" }}>Progress</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                    {weeklyCurrent} / {weeklyTarget}
                  </span>
                </div>
                <div className="hunter-xp-track" style={{ height: "6px" }}>
                  <div
                    className="hunter-xp-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((weeklyCurrent / Math.max(1, weeklyTarget)) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="progression-card-footer">
              <span style={{ color: "var(--text-muted)", textTransform: "uppercase" }}>Reward</span>
              <span style={{ color: "var(--gold-highlight)", fontWeight: 700 }}>
                +{weeklyChallenge?.rewardXP ?? 250} XP · +{weeklyChallenge?.rewardCoins ?? 100} Coins
              </span>
            </div>
          </div>

          {/* Card 2: Monthly Challenge */}
          <div className="progression-card">
            <div className="progression-card-top">
              <div className="progression-card-header">
                <span className="progression-card-type" style={{ color: "var(--gold-amber)" }}>
                  MONTHLY CHALLENGE
                </span>
                <span className="progression-card-remaining">
                  <Clock size={12} />
                  <span>{monthRange.daysRemaining} days remaining</span>
                </span>
              </div>
              <div>
                <h4 className="progression-card-name">
                  {monthlyChallenge?.title || `${monthRange.monthLabel} Apex Campaign`}
                </h4>
                <p className="progression-card-desc">
                  {monthlyChallenge?.description || "Maintain disciplined habit execution throughout the calendar month."}
                </p>
              </div>
              <div className="progression-card-gauge-box">
                <div className="progression-card-gauge-header">
                  <span style={{ color: "var(--text-muted)" }}>Progress</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                    {monthlyCurrent} / {monthlyTarget} Days
                  </span>
                </div>
                <div className="hunter-xp-track" style={{ height: "6px" }}>
                  <div
                    className="hunter-xp-fill"
                    style={{
                      background: "linear-gradient(90deg, var(--gold-vivid), var(--gold-amber))",
                      width: `${Math.min(
                        100,
                        Math.round((monthlyCurrent / Math.max(1, monthlyTarget)) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="progression-card-footer">
              <span style={{ color: "var(--text-muted)", textTransform: "uppercase" }}>Reward</span>
              <span style={{ color: "var(--gold-highlight)", fontWeight: 700 }}>
                +{monthlyChallenge?.rewardXP ?? 2000} XP · +{monthlyChallenge?.rewardCoins ?? 400} Coins
              </span>
            </div>
          </div>

          {/* Card 3: 15-Day Season */}
          <div className="progression-card">
            <div className="progression-card-top">
              <div className="progression-card-header">
                <span className="progression-card-type" style={{ color: "var(--crimson-light)" }}>
                  SEASON {String(season.seasonNumber).padStart(2, "0")}
                </span>
                <span className="progression-card-remaining">
                  <Clock size={12} />
                  <span>{season.daysRemaining} days remaining</span>
                </span>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h4 className="progression-card-name">{season.name}</h4>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      fontFamily: "var(--font-mono)",
                      color: "var(--crimson-light)",
                      background: "var(--surface-container)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    LVL {seasonLevel}
                  </span>
                </div>
                <p className="progression-card-desc">
                  15-day season. Continuous calendar cycle.
                </p>
              </div>
              <div className="progression-card-gauge-box">
                <div className="progression-card-gauge-header">
                  <span style={{ color: "var(--text-muted)" }}>Season Progress</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                    {currentSeasonXP.toLocaleString()} / {nextSeasonThreshold.toLocaleString()} XP
                  </span>
                </div>
                <div className="hunter-xp-track" style={{ height: "6px" }}>
                  <div
                    className="hunter-xp-fill"
                    style={{
                      width: `${seasonPct}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="progression-card-footer">
              <span style={{ color: "var(--text-muted)", textTransform: "uppercase" }}>
                {canClaimMilestone ? "Milestone Ready" : "Next Milestone"}
              </span>
              {canClaimMilestone && nextSeasonMilestone ? (
                <button
                  onClick={() => handleSeasonClaim(nextSeasonMilestone)}
                  disabled={claimingSeasonLvl !== null}
                  style={{
                    background: "var(--crimson-vivid)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "3px 8px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.625rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  {claimingSeasonLvl === nextSeasonMilestone.level ? "Claiming..." : "Claim Reward"}
                </button>
              ) : (
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {nextSeasonMilestone ? nextSeasonMilestone.rewardLabel : "Max Tier"}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          4. LOWER SECTION: RANDOM EVENT + BOSS THREAT (5 cols) & RECENT ACTIVITY (7 cols)
          ========================================================================== */}
      <section className="dashboard-lower-grid">
        {/* Left Column (5 cols) */}
        <div className="lower-col-threats">
          {/* Random Event Mini Card */}
          <div className={`random-event-mini-shell ${randomEvent ? "active" : ""}`}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Zap size={16} color={randomEvent ? "var(--cyan-tactical)" : "var(--text-muted)"} />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      color: randomEvent ? "var(--cyan-tactical)" : "var(--text-muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    RANDOM EVENT
                  </span>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-muted)" }}>
                  {randomEvent ? "Active Anomaly" : "Calibrated"}
                </span>
              </div>

              <h3 style={{ margin: "0 0 0.35rem", fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {randomEvent?.title || "Atmospheric Calibration"}
              </h3>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                {randomEvent?.description || "Sensors detect no anomalous system disturbances. Standard discipline bonuses and passive yield rates remain nominal."}
              </p>

              {randomEvent && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "0.5rem",
                    background: "rgba(56, 189, 248, 0.08)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Zap size={14} color="var(--cyan-tactical)" />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--cyan-tactical)", fontWeight: 700 }}>
                    +{randomEvent.rewardXP} XP · +{randomEvent.rewardCoins} Coins
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.05)", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-muted)" }}>
              <span>Status</span>
              <span style={{ color: randomEvent ? "var(--cyan-tactical)" : "var(--text-muted)" }}>
                {randomEvent ? "Applied Automatically" : "Quiescent"}
              </span>
            </div>
          </div>

          {/* Boss Threat Monitor */}
          <div className="boss-threat-card">
            <div className="boss-threat-header">
              <div className="boss-threat-badge">
                <Skull size={16} color="var(--crimson-vivid)" />
                <span>BOSS THREAT MONITOR</span>
              </div>
              <span
                className="boss-threat-status-badge"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  color: bossProgress.defeated ? "var(--color-success)" : "var(--crimson-light)",
                }}
              >
                {bossProgress.defeated ? "SUBDUED" : "ACTIVE RAID"}
              </span>
            </div>

            <div className="boss-threat-content">
              <div className="boss-threat-avatar">
                <Skull size={28} />
              </div>
              <div className="boss-threat-meta">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h4 className="boss-threat-name">{activeBoss.name}</h4>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.625rem",
                      fontWeight: 800,
                      color: "var(--crimson-light)",
                    }}
                  >
                    LVL {activeBoss.recommendedLevel}
                  </span>
                </div>
                <div className="boss-threat-hp-box">
                  <div className="boss-threat-hp-labels">
                    <span>Boss Health</span>
                    <span style={{ color: "var(--crimson-light)", fontWeight: 700 }}>
                      {bossProgress.currentHp.toLocaleString()} / {activeBoss.maxHp.toLocaleString()} ({bossHpPct}%)
                    </span>
                  </div>
                  <div className="hunter-xp-track" style={{ height: "6px" }}>
                    <div
                      className="hunter-xp-fill"
                      style={{
                        width: `${bossHpPct}%`,
                        background: bossProgress.defeated ? "var(--color-success)" : "var(--crimson-vivid)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link
                to="/bosses"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--crimson-light)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                <span>CHALLENGE BOSS</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity (7 cols) */}
        <div className="lower-col-activity recent-activity-shell">
          <div>
            <div className="recent-activity-header">
              <div className="recent-activity-title">
                <History size={16} color="var(--text-secondary)" />
                <span>RECENT ACTIVITY</span>
              </div>
              <span className="text-label-sm" style={{ color: "var(--text-muted)" }}>
                LATEST LOGS
              </span>
            </div>

            {/* Timeline Stream */}
            <div className="activity-stream-list" style={{ marginTop: "1rem" }}>
              {completedQuests.length > 0 ? (
                completedQuests.slice(0, 4).map((quest) => (
                  <div key={quest.id} className="activity-stream-item">
                    <div className="activity-stream-item-left">
                      <div className="activity-icon-badge">
                        <Check size={14} />
                      </div>
                      <div className="activity-item-texts">
                        <span className="activity-item-title">
                          Quest cleared: {quest.title}
                        </span>
                        <span className="activity-item-sub">
                          {quest.category ? `${quest.category.toUpperCase()} · ` : ""}Daily Directive Cleared
                        </span>
                      </div>
                    </div>
                    <span className="activity-item-xp">+{(quest.xpReward ?? (quest as any).xp ?? 0)} XP</span>
                  </div>
                ))
              ) : activeQuests.length > 0 ? (
                activeQuests.slice(0, 4).map((quest) => (
                  <div key={quest.id} className="activity-stream-item">
                    <div className="activity-stream-item-left">
                      <div className="activity-icon-badge" style={{ color: "var(--gold-amber)" }}>
                        <Radio size={14} />
                      </div>
                      <div className="activity-item-texts">
                        <span className="activity-item-title">
                          Pending directive: {quest.title}
                        </span>
                        <span className="activity-item-sub">
                          {quest.category ? `${quest.category.toUpperCase()} · ` : ""}Ready for execution
                        </span>
                      </div>
                    </div>
                    <span className="activity-item-xp" style={{ color: "var(--gold-highlight)" }}>
                      +{(quest.xpReward ?? (quest as any).xp ?? 0)} XP
                    </span>
                  </div>
                ))
              ) : (
                <div className="activity-stream-item" style={{ justifyContent: "center" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    No mission records found. Initialize directives in Quests Command.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="recent-activity-footer">
            <span>{completedQuests.length} activities logged today</span>
            <Link to="/quests" className="recent-activity-view-link">
              <span>View All</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          5. HUNTER ATTRIBUTES TELEMETRY (Preserves all 6 stats & tooltips)
          ========================================================================== */}
      <section className="attributes-telemetry-card">
        <div className="attributes-header">
          <div className="attributes-title">
            <Shield size={16} color="var(--gold-amber)" />
            <span>HUNTER ATTRIBUTES // BIOMETRIC TELEMETRY</span>
          </div>
          <span className="text-label-sm" style={{ color: "var(--text-muted)" }}>
            6 CORE VITAL AXES
          </span>
        </div>

        <div className="attributes-grid">
          {STAT_ENTRIES.map(({ key, label }) => (
            <div key={key} className="attribute-tile">
              <div className="attribute-tile-top">
                <div className="attribute-tile-label-wrap">
                  <StatIcon stat={key} size={14} color="var(--gold-amber)" />
                  <span className="attribute-tile-label">{label}</span>
                </div>
                <QuestionIcon helpText={STAT_HELP[key]} size={12} />
              </div>
              <strong className="attribute-tile-value">
                {player?.stats?.[key] ?? 0}
              </strong>
            </div>
          ))}
        </div>
      </section>

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
