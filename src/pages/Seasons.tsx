import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Trophy,
  Zap,
  Flame,
  Swords,
  TrendingUp,
  Coins,
  Sparkles,
  ChevronRight,
  Shield,
  Activity,
  History,
  X,
  Layers,
  Flag,
} from "lucide-react";
import type { Player } from "../types/game";
import type { PlayerSeason, SeasonMilestone } from "../data/seasons";
import { SEASON_LEVEL_THRESHOLDS, SEASON_MILESTONES } from "../data/seasons";
import { getCurrentSeasonWindow, claimSeasonMilestone } from "../lib/seasonsData";
import type { WeeklyChallenge } from "../data/weeklyChallenges";
import { getCurrentWeekRange } from "../lib/weeklyChallengesData";
import type { MonthlyChallenge } from "../data/monthlyChallenges";
import { getCurrentMonthRange } from "../lib/monthlyChallengesData";
import type { PlayerRecordsMap } from "../lib/personalRecordsData";
import "./Seasons.css";

interface SeasonsProps {
  player: Player | null;
  playerSeason?: PlayerSeason | null;
  weeklyChallenge?: WeeklyChallenge | null;
  monthlyChallenge?: MonthlyChallenge | null;
  personalRecords?: PlayerRecordsMap;
  powerScore?: number;
  onClaimSeasonMilestone?: (
    milestone: SeasonMilestone,
    reward: { xp: number; coins: number; itemId?: string; titleId?: string }
  ) => void;
}

export default function Seasons({
  player,
  playerSeason,
  weeklyChallenge,
  monthlyChallenge,
  personalRecords = {},
  powerScore = 0,
  onClaimSeasonMilestone,
}: SeasonsProps) {
  // Runtime season calculation (15-day fixed continuous window anchored to 2026-09-01)
  const season = useMemo(() => getCurrentSeasonWindow(), []);
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly" | "archive">("weekly");
  const [claimingLvl, setClaimingLvl] = useState<number | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Time Countdown state for active season
  const [seasonTimeRemaining, setSeasonTimeRemaining] = useState<string>("");

  useEffect(() => {
    const updateSeasonCountdown = () => {
      const [endY, endM, endD] = season.endDate.split("-").map(Number);
      const endDateTime = new Date(endY, endM - 1, endD, 23, 59, 59, 999);
      const diffMs = Math.max(0, endDateTime.getTime() - Date.now());

      const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

      setSeasonTimeRemaining(
        `${String(days).padStart(2, "0")}D : ${String(hours).padStart(2, "0")}H : ${String(minutes).padStart(2, "0")}M`
      );
    };

    updateSeasonCountdown();
    const interval = setInterval(updateSeasonCountdown, 60000);
    return () => clearInterval(interval);
  }, [season.endDate]);

  // Derived progress values
  const seasonLevel = playerSeason?.seasonLevel ?? 1;
  const currentSeasonXP = playerSeason?.seasonXP ?? 0;
  const nextThreshold =
    SEASON_LEVEL_THRESHOLDS[Math.min(seasonLevel, SEASON_LEVEL_THRESHOLDS.length - 1)] ?? 2000;
  const prevThreshold = SEASON_LEVEL_THRESHOLDS[Math.max(0, seasonLevel - 1)] ?? 0;
  const currentLevelRange = Math.max(1, nextThreshold - prevThreshold);
  const progressInLevel = Math.max(0, currentSeasonXP - prevThreshold);
  const xpPercent = Math.min(100, Math.floor((progressInLevel / currentLevelRange) * 100));

  // Calculate 15-day timeline current position
  const now = new Date();
  const curMidnightUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const anchorMidnightUTC = Date.UTC(2026, 8, 1);
  const diffDays = Math.floor((curMidnightUTC - anchorMidnightUTC) / (24 * 60 * 60 * 1000));
  const currentDayInSeason = Math.min(15, Math.max(1, (diffDays % 15) + 1));
  const cycleElapsedPercent = Math.min(100, Math.round((currentDayInSeason / 15) * 100));

  // Week and Month range helpers
  const weekRange = useMemo(() => getCurrentWeekRange(), []);
  const monthRange = useMemo(() => getCurrentMonthRange(), []);

  // Milestone claim handler
  const handleClaim = async (m: SeasonMilestone) => {
    if (!playerSeason || claimingLvl !== null) return;
    setClaimingLvl(m.level);
    try {
      const res = await claimSeasonMilestone(playerSeason.userId, m.level);
      if (res.success && res.reward && onClaimSeasonMilestone) {
        onClaimSeasonMilestone(m, res.reward);
      }
    } finally {
      setClaimingLvl(null);
    }
  };

  // Milestone reward states
  const claimedCount = SEASON_MILESTONES.filter(
    (m) => playerSeason?.milestonesClaimed.includes(m.level)
  ).length;
  const readyCount = SEASON_MILESTONES.filter(
    (m) =>
      playerSeason &&
      playerSeason.seasonLevel >= m.level &&
      !playerSeason.milestonesClaimed.includes(m.level)
  ).length;
  const upcomingCount = SEASON_MILESTONES.length - claimedCount - readyCount;

  // Personal Records derivations
  const longestStreak = personalRecords["longest_streak"]?.recordValue ?? player?.progress.bestStreak ?? 0;
  const peakPowerScore = personalRecords["highest_power_score"]?.recordValue ?? powerScore ?? 0;
  const dailyRecordClear = personalRecords["most_quests_one_day"]?.recordValue ?? 0;
  const maxDailyXP = personalRecords["most_xp_one_day"]?.recordValue ?? 0;
  const maxDailyGold = personalRecords["most_coins_one_day"]?.recordValue ?? 0;
  const peakCycleLevel = personalRecords["highest_season_level"]?.recordValue ?? seasonLevel;

  return (
    <div className="seasons-root">
      <div className="seasons-container">
        {/* ==================================================================
            1. SUB-HEADER REALTIME TELEMETRY PROTOCOL BAR
            ================================================================== */}
        <div className="season-sub-header">
          <div className="season-sub-header-left">
            <span className="season-beacon-dot">
              <span className="season-beacon-ping" />
              <span className="season-beacon-core" />
            </span>
            <span>PROTOCOL // SEASON CADENCE: 15-DAY FIXED CYCLE</span>
          </div>
          <div className="season-sub-header-right">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#cbd5e1" }}>
              <Clock size={13} style={{ color: "var(--season-gold-light)" }} />
              SYNCHRONIZED REALTIME
            </span>
            <span>|</span>
            <span style={{ color: "#ffdad6", fontFamily: "JetBrains Mono, monospace" }}>
              CODE: {season.id}
            </span>
          </div>
        </div>

        {/* ==================================================================
            2. CURRENT SEASON HERO (DARK CINEMATIC CONTAINER)
            ================================================================== */}
        <section className="season-hero-panel">
          <div className="season-corner-reticle tl" />
          <div className="season-corner-reticle tr" />
          <div className="season-corner-reticle bl" />
          <div className="season-corner-reticle br" />
          <div className="season-hero-top-line" />

          <div className="season-hero-inner">
            <div className="season-hero-main-row">
              <div className="season-hero-info">
                <div className="season-hero-tag-wrap">
                  <span className="season-hero-tag">
                    PHASE {String(season.seasonNumber).padStart(2, "0")} // {season.theme.toUpperCase()}
                  </span>
                  <span style={{ color: "var(--season-text-dim)", fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem" }}>
                    CYCLE TIMELINE V4
                  </span>
                </div>

                <h1 className="season-hero-title">
                  <span>SEASON {String(season.seasonNumber).padStart(2, "0")}</span>
                  <span className="season-hero-title-accent">— {season.theme.toUpperCase()}</span>
                </h1>

                <p className="season-hero-desc">
                  Synchronize daily habit directives and raid milestones to harvest season spoils
                  before cycle recalibration. Tactical telemetry indicates sector breach imminent at
                  Day 15 termination.
                </p>
              </div>

              {/* 4 Inset Metadata Telemetry Panels */}
              <div className="season-meta-grid">
                <div className="season-meta-cell">
                  <span className="season-meta-label">CALENDAR WINDOW</span>
                  <span className="season-meta-val">
                    {season.startDate.slice(5).replace("-", "/")} — {season.endDate.slice(5).replace("-", "/")}
                  </span>
                  <span className="season-meta-sub">Fixed 15-Day Cycle</span>
                </div>

                <div className="season-meta-cell accent">
                  <span className="season-meta-label" style={{ color: "#ffb4ab", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span className="season-beacon-dot" style={{ width: 6, height: 6 }}>
                      <span className="season-beacon-ping" />
                      <span className="season-beacon-core" style={{ width: 6, height: 6 }} />
                    </span>
                    TIMELOCK
                  </span>
                  <span className="season-meta-val" style={{ color: "#ffdad6" }}>
                    {seasonTimeRemaining || `${season.daysRemaining}D LEFT`}
                  </span>
                  <span className="season-meta-sub" style={{ color: "var(--season-crimson)" }}>
                    Termination Imminent
                  </span>
                </div>

                <div className="season-meta-cell">
                  <span className="season-meta-label">PROGRESSION TIER</span>
                  <span className="season-meta-val" style={{ color: "var(--season-gold-light)" }}>
                    LVL {String(seasonLevel).padStart(2, "0")}{" "}
                    <span style={{ fontSize: "0.7rem", color: "var(--season-text-dim)", fontWeight: 400 }}>
                      / 10 MAX
                    </span>
                  </span>
                  <span className="season-meta-sub">Tier {Math.min(5, Math.ceil(seasonLevel / 2))} Master</span>
                </div>

                <div className="season-meta-cell">
                  <span className="season-meta-label">CYCLE HARVEST</span>
                  <span className="season-meta-val" style={{ color: "#dac0c8" }}>
                    {currentSeasonXP.toLocaleString()}{" "}
                    <span style={{ fontSize: "0.7rem", color: "var(--season-text-dim)", fontWeight: 400 }}>
                      / {nextThreshold.toLocaleString()} XP
                    </span>
                  </span>
                  <span className="season-meta-sub" style={{ color: "var(--season-green)", fontWeight: 700 }}>
                    {xpPercent}% Resolved
                  </span>
                </div>
              </div>
            </div>

            {/* ================================================================
                3. SEASON 15-DAY CADENCE TIMELINE & PROGRESSION GAUGE
                ================================================================ */}
            <div className="season-timeline-container">
              <div className="season-timeline-header">
                <span className="season-timeline-title">
                  <Calendar size={15} style={{ color: "var(--season-crimson)" }} />
                  15-DAY CADENCE TIMELINE
                </span>
                <span className="season-timeline-badge">
                  DAY {String(currentDayInSeason).padStart(2, "0")} OF 15 // {cycleElapsedPercent}% CYCLE ELAPSED
                </span>
              </div>

              {/* Segmented 15-Day Discrete Bar */}
              <div className="season-timeline-grid">
                {Array.from({ length: 15 }, (_, i) => i + 1).map((day) => {
                  const isCleared = day < currentDayInSeason;
                  const isToday = day === currentDayInSeason;
                  const isCheckpoint = day === 5 || day === 10;
                  const isFinale = day === 15;

                  let nodeClass = "season-day-node";
                  if (isToday) {
                    nodeClass += " active-today";
                  } else if (isCleared) {
                    nodeClass += isCheckpoint ? " checkpoint-cleared" : " cleared";
                  } else if (isFinale) {
                    nodeClass += " finale";
                  }

                  return (
                    <div
                      key={day}
                      className={nodeClass}
                      title={`Day ${String(day).padStart(2, "0")}${isToday ? ": Active Today" : isCleared ? ": Cleared" : isFinale ? ": Season Finale" : ": Upcoming"}`}
                    >
                      {isToday && (
                        <span
                          className="season-beacon-core"
                          style={{ width: 6, height: 6, background: "#fff", boxShadow: "0 0 6px #fff" }}
                        />
                      )}
                      {isCleared && isCheckpoint && (
                        <span style={{ fontSize: 9, fontWeight: 900 }}>✓</span>
                      )}
                      {!isCleared && !isToday && isFinale && (
                        <Flag size={8} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Continuous Glowing Progress Track */}
              <div className="season-timeline-track">
                <div
                  className="season-timeline-fill"
                  style={{ width: `${cycleElapsedPercent}%` }}
                />
              </div>

              {/* Milestone Ticks & Pinpoint Labels */}
              <div className="season-timeline-labels">
                <span>DAY 01 (GENESIS)</span>
                <span style={{ color: "var(--season-gold-light)" }}>DAY 05 // TIER I</span>
                <span style={{ color: "var(--season-gold-light)" }}>DAY 10 // TIER II</span>
                <span className="season-current-pin-label">
                  ▲ YOU ARE HERE [D{String(currentDayInSeason).padStart(2, "0")}]
                </span>
                <span>DAY 15 (RESET)</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            4. CYCLE PROGRESSION & SPOILS HARVEST (HORIZONTAL MILESTONES TRACK)
            ================================================================== */}
        <section className="season-spoils-section">
          <div className="season-spoils-header">
            <h2 className="season-spoils-title">
              <Trophy size={18} style={{ color: "var(--season-gold-light)" }} />
              <span>CYCLE PROGRESSION &amp; SPOILS HARVEST</span>
            </h2>
            <div className="season-spoils-summary-pill">
              CLAIMED: <strong style={{ color: "var(--season-green)" }}>{claimedCount}/{SEASON_MILESTONES.length}</strong> | READY: <strong style={{ color: "var(--season-gold-light)" }}>{readyCount}</strong> | UPCOMING: {upcomingCount}
            </div>
          </div>

          <div className="season-milestones-grid">
            {SEASON_MILESTONES.map((m) => {
              const isClaimed = playerSeason?.milestonesClaimed.includes(m.level) ?? false;
              const isReady = (playerSeason ? playerSeason.seasonLevel >= m.level : false) && !isClaimed;
              const isLocked = !isClaimed && !isReady;
              const isCapstone = m.level === 10;

              let cardClass = "season-milestone-card";
              if (isReady) cardClass += " ready";
              else if (isClaimed) cardClass += " claimed";
              else if (isLocked) cardClass += " locked";
              if (isCapstone) cardClass += " capstone";

              return (
                <div key={m.level} className={cardClass}>
                  {isReady && <div className="season-ready-ribbon">HARVEST READY</div>}

                  <div className="season-milestone-top">
                    <span className="season-milestone-lvl-badge">LVL {String(m.level).padStart(2, "0")}</span>
                    {isClaimed ? (
                      <span className="season-milestone-state-badge claimed">
                        <CheckCircle2 size={13} /> CLAIMED
                      </span>
                    ) : isReady ? (
                      <span className="season-milestone-state-badge ready animate-pulse">
                        <Sparkles size={13} /> UNLOCKED
                      </span>
                    ) : (
                      <span className="season-milestone-state-badge locked">
                        <Lock size={12} /> LOCKED
                      </span>
                    )}
                  </div>

                  <div className="season-milestone-body">
                    <span className="season-milestone-title">
                      {isCapstone ? "SOVEREIGN ASTRAL CAPSTONE" : `TIER ${m.level / 2} REWARD CACHE`}
                    </span>
                    <span className="season-milestone-spoils">{m.rewardLabel}</span>
                  </div>

                  <div>
                    {isReady ? (
                      <button
                        type="button"
                        onClick={() => handleClaim(m)}
                        disabled={claimingLvl !== null}
                        className="season-claim-btn"
                      >
                        <Trophy size={14} />
                        <span>{claimingLvl === m.level ? "CLAIMING..." : "CLAIM SPOILS"}</span>
                      </button>
                    ) : isClaimed ? (
                      <div className="season-claimed-indicator">✓ CLAIMED</div>
                    ) : (
                      <div className="season-claimed-indicator" style={{ opacity: 0.6 }}>
                        REQUIRES SEASON LVL {m.level}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==================================================================
            5. CHALLENGE COMMAND MATRIX: TABS & DUAL-COLUMN WORKBENCH
            ================================================================== */}
        <section className="season-workbench-section">
          {/* Navigation Tabs Bar */}
          <div className="season-tabs-bar">
            <div className="season-tabs-cluster">
              <button
                type="button"
                className={`season-tab-btn ${activeTab === "weekly" ? "active" : ""}`}
                onClick={() => setActiveTab("weekly")}
              >
                <Layers size={14} />
                <span>WEEKLY CHALLENGES ({weeklyChallenge?.completed ? "DONE" : "ACTIVE"})</span>
              </button>
              <button
                type="button"
                className={`season-tab-btn ${activeTab === "monthly" ? "active" : ""}`}
                onClick={() => setActiveTab("monthly")}
              >
                <Calendar size={14} />
                <span>MONTHLY CAMPAIGN</span>
              </button>
              <button
                type="button"
                className={`season-tab-btn ${activeTab === "archive" ? "active" : ""}`}
                onClick={() => setActiveTab("archive")}
              >
                <History size={14} />
                <span>SEASON ARCHIVE</span>
              </button>
            </div>

            <div className="season-tab-expiry-pill">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#ffb4ab", fontWeight: 700 }}>
                <span className="season-beacon-dot" style={{ width: 6, height: 6 }}>
                  <span className="season-beacon-ping" />
                  <span className="season-beacon-core" style={{ width: 6, height: 6 }} />
                </span>
                {activeTab === "monthly"
                  ? `EXPIRING IN ${monthRange.daysRemaining} DAYS`
                  : `CYCLE CADENCE: ${season.startDate} - ${season.endDate}`}
              </span>
            </div>
          </div>

          {/* 12-Column Asymmetric Grid (7 cols left, 5 cols right) */}
          <div className="season-workbench-grid">
            {/* ==============================================================
                LEFT COLUMN (7 COLS): ACTIVE CHALLENGES / CAMPAIGN
                ============================================================== */}
            <div className="season-left-col">
              {activeTab === "weekly" && (
                <>
                  <div className="season-section-eyebrow">
                    <div className="season-section-title-tag">
                      <Swords size={16} style={{ color: "#ffb4ab" }} />
                      <span>ACTIVE WEEKLY PROTOCOLS // {weekRange.weekStart} — {weekRange.weekEnd}</span>
                    </div>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", color: "var(--season-text-dim)" }}>
                      {weeklyChallenge ? `${weeklyChallenge.objectives.length} OBJECTIVES` : "1 PROTOCOL"}
                    </span>
                  </div>

                  {weeklyChallenge ? (
                    <div className={`season-challenge-card ${weeklyChallenge.completed ? "completed" : ""}`}>
                      <div className="season-challenge-card-header">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="season-challenge-tag">DIRECTIVE SPRINT</span>
                          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", color: "var(--season-text-dim)" }}>
                            WEEKLY PROTOCOL
                          </span>
                        </div>
                        <div className="season-challenge-time-left">
                          <Clock size={13} />
                          <span>{weeklyChallenge.completed ? "COMPLETED" : "ACTIVE THIS WEEK"}</span>
                        </div>
                      </div>

                      <div className="season-challenge-title-row">
                        <h3 className="season-challenge-title">{weeklyChallenge.title}</h3>
                        <span className="season-challenge-ratio">
                          {weeklyChallenge.currentProgress}% RESOLVED
                        </span>
                      </div>

                      <p className="season-challenge-desc">{weeklyChallenge.description}</p>

                      {/* Objectives List */}
                      <div className="season-objectives-list">
                        {weeklyChallenge.objectives.map((obj) => {
                          const pct = Math.min(100, Math.round((obj.currentValue / Math.max(1, obj.targetValue)) * 100));
                          return (
                            <div key={obj.id} className="season-objective-item">
                              <div className="season-objective-labels">
                                <span style={{ fontWeight: 600 }}>{obj.description}</span>
                                <span style={{ fontFamily: "JetBrains Mono, monospace" }}>
                                  {obj.currentValue} / {obj.targetValue} ({pct}%)
                                </span>
                              </div>
                              <div className="season-objective-gauge">
                                <div
                                  className={`season-objective-gauge-fill ${obj.completed ? "completed" : ""}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Spoils Bar & Action Button */}
                      <div className="season-challenge-footer">
                        <div className="season-spoils-pills-row">
                          <span className="season-spoil-pill xp">+{weeklyChallenge.rewardXP} XP</span>
                          <span className="season-spoil-pill coins">+{weeklyChallenge.rewardCoins} COINS</span>
                          {weeklyChallenge.rewardItemId && (
                            <span className="season-spoil-pill item">
                              <Shield size={12} /> REWARD LOOT
                            </span>
                          )}
                        </div>

                        <Link to="/quests" className="season-action-btn">
                          <span>CONTINUE QUESTS</span>
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="season-challenge-card">
                      <p style={{ color: "var(--season-text-dim)", margin: 0 }}>
                        Weekly challenge protocol initializing...
                      </p>
                    </div>
                  )}

                  {/* Monthly Horizon Engagement Preview inside Weekly tab */}
                  {monthlyChallenge && (
                    <div style={{ marginTop: 12 }}>
                      <div className="season-section-eyebrow" style={{ marginBottom: 8 }}>
                        <div className="season-section-title-tag">
                          <Calendar size={16} style={{ color: "#dac0c8" }} />
                          <span>MONTHLY HORIZON ENGAGEMENT // {monthRange.monthLabel}</span>
                        </div>
                      </div>

                      <div className="season-challenge-card">
                        <div className="season-challenge-card-header">
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className="season-challenge-tag" style={{ background: "rgba(168, 85, 247, 0.15)", borderColor: "rgba(168, 85, 247, 0.35)", color: "#e9d5ff" }}>
                              MACRO CAMPAIGN
                            </span>
                            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", color: "var(--season-text-dim)" }}>
                              EXPIRATION: {monthRange.daysRemaining} DAYS
                            </span>
                          </div>
                          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", color: "var(--season-gold-light)", fontWeight: 700 }}>
                            ASCENSION BONUS
                          </span>
                        </div>

                        <div className="season-challenge-title-row">
                          <h3 className="season-challenge-title">{monthlyChallenge.title}</h3>
                        </div>

                        <p className="season-challenge-desc">{monthlyChallenge.description}</p>

                        <div className="season-objectives-list">
                          {monthlyChallenge.objectives.map((obj) => {
                            const pct = Math.min(100, Math.round((obj.currentValue / Math.max(1, obj.targetValue)) * 100));
                            return (
                              <div key={obj.id} className="season-objective-item">
                                <div className="season-objective-labels">
                                  <span style={{ fontWeight: 600 }}>{obj.description}</span>
                                  <span style={{ fontFamily: "JetBrains Mono, monospace" }}>
                                    {obj.currentValue} / {obj.targetValue} ({pct}%)
                                  </span>
                                </div>
                                <div className="season-objective-gauge">
                                  <div
                                    className={`season-objective-gauge-fill ${obj.completed ? "completed" : ""}`}
                                    style={{ width: `${pct}%`, background: "linear-gradient(90deg, #9333ea, #c084fc)" }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="season-challenge-footer">
                          <div className="season-spoils-pills-row">
                            <span className="season-spoil-pill xp">+{monthlyChallenge.rewardXP} XP</span>
                            <span className="season-spoil-pill coins">+{monthlyChallenge.rewardCoins} COINS</span>
                          </div>
                          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.68rem", color: "var(--season-text-dim)" }}>
                            SYNCHRONIZED WITH ACTIVE CYCLE
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === "monthly" && monthlyChallenge && (
                <>
                  <div className="season-section-eyebrow">
                    <div className="season-section-title-tag">
                      <Calendar size={16} style={{ color: "#dac0c8" }} />
                      <span>MONTHLY APEX CAMPAIGN // {monthRange.monthLabel}</span>
                    </div>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", color: "var(--season-text-dim)" }}>
                      {monthRange.daysRemaining} DAYS REMAINING
                    </span>
                  </div>

                  <div className={`season-challenge-card ${monthlyChallenge.completed ? "completed" : ""}`}>
                    <div className="season-challenge-card-header">
                      <span className="season-challenge-tag" style={{ background: "rgba(168, 85, 247, 0.15)", borderColor: "rgba(168, 85, 247, 0.35)", color: "#e9d5ff" }}>
                        MONTHLY OBJECTIVE
                      </span>
                      <div className="season-challenge-time-left">
                        <Clock size={13} />
                        <span>{monthlyChallenge.completed ? "CAMPAIGN CLEARED" : `${monthRange.daysRemaining}D REMAINING`}</span>
                      </div>
                    </div>

                    <div className="season-challenge-title-row">
                      <h3 className="season-challenge-title">{monthlyChallenge.title}</h3>
                    </div>

                    <p className="season-challenge-desc">{monthlyChallenge.description}</p>

                    <div className="season-objectives-list">
                      {monthlyChallenge.objectives.map((obj) => {
                        const pct = Math.min(100, Math.round((obj.currentValue / Math.max(1, obj.targetValue)) * 100));
                        return (
                          <div key={obj.id} className="season-objective-item">
                            <div className="season-objective-labels">
                              <span style={{ fontWeight: 600 }}>{obj.description}</span>
                              <span style={{ fontFamily: "JetBrains Mono, monospace" }}>
                                {obj.currentValue} / {obj.targetValue} ({pct}%)
                              </span>
                            </div>
                            <div className="season-objective-gauge">
                              <div
                                className={`season-objective-gauge-fill ${obj.completed ? "completed" : ""}`}
                                style={{ width: `${pct}%`, background: "linear-gradient(90deg, #9333ea, #c084fc)" }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="season-challenge-footer">
                      <div className="season-spoils-pills-row">
                        <span className="season-spoil-pill xp">+{monthlyChallenge.rewardXP} XP</span>
                        <span className="season-spoil-pill coins">+{monthlyChallenge.rewardCoins} COINS</span>
                      </div>
                      <Link to="/quests" className="season-action-btn">
                        <span>CONTINUE QUESTS</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "archive" && (
                <>
                  <div className="season-section-eyebrow">
                    <div className="season-section-title-tag">
                      <History size={16} style={{ color: "#ffb4ab" }} />
                      <span>HISTORICAL SEASON REPOSITORIES</span>
                    </div>
                  </div>

                  <div className="season-challenge-card">
                    <div className="season-challenge-card-header">
                      <span className="season-challenge-tag">CONCLUDED CYCLE</span>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", color: "var(--season-green)", fontWeight: 700 }}>
                        CLEARANCE ARCHIVED
                      </span>
                    </div>

                    <h3 className="season-challenge-title">SEASON 01 — THE HUNTER'S AWAKENING</h3>
                    <p className="season-challenge-desc">
                      Genesis 15-day seasonal cycle concluded on 2026-09-15. All milestone caches and
                      earned trophies remain permanently unlocked in your Hunter Armory dossier.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem" }}>
                      <div style={{ padding: "10px 12px", background: "var(--season-card-lowest)", borderRadius: 8, border: "1px solid var(--season-subtle-border)" }}>
                        <span style={{ color: "var(--season-text-dim)", display: "block", fontSize: "0.62rem" }}>TIMELINE</span>
                        <span style={{ color: "#fff", fontWeight: 700 }}>2026-09-01 — 2026-09-15</span>
                      </div>
                      <div style={{ padding: "10px 12px", background: "var(--season-card-lowest)", borderRadius: 8, border: "1px solid var(--season-subtle-border)" }}>
                        <span style={{ color: "var(--season-text-dim)", display: "block", fontSize: "0.62rem" }}>STATUS</span>
                        <span style={{ color: "var(--season-green)", fontWeight: 700 }}>100% PRESERVED</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ==============================================================
                RIGHT COLUMN (5 COLS): RECORDS & TELEMETRY
                ============================================================== */}
            <div className="season-right-col">
              {/* 1. PERSONAL BEST RECORDS (HISTORICAL PERSONAL BESTS) */}
              <div className="season-right-panel">
                <div className="season-right-panel-header">
                  <h3 className="season-right-panel-title">
                    <Trophy size={16} style={{ color: "var(--season-gold-light)" }} />
                    <span>PERSONAL BEST RECORDS</span>
                  </h3>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.65rem", padding: "2px 8px", borderRadius: 4, background: "var(--season-card-high)", color: "var(--season-text-dim)" }}>
                    HUNTER ARCHIVE
                  </span>
                </div>

                <div className="season-records-grid">
                  <div className="season-record-box">
                    <span className="season-record-label">
                      <Flame size={12} style={{ color: "var(--season-crimson)" }} />
                      LONGEST STREAK
                    </span>
                    <span className="season-record-val" style={{ color: "#ffb4ab" }}>
                      {longestStreak}
                      <span className="season-record-unit">DAYS</span>
                    </span>
                    <span className="season-record-sub">Discipline Metric</span>
                  </div>

                  <div className="season-record-box">
                    <span className="season-record-label">
                      <Zap size={12} style={{ color: "var(--season-gold-light)" }} />
                      PEAK POWER SCORE
                    </span>
                    <span className="season-record-val" style={{ color: "var(--season-gold-light)" }}>
                      {peakPowerScore.toLocaleString()}
                      <span className="season-record-unit">CP</span>
                    </span>
                    <span className="season-record-sub">Combat Power Rating</span>
                  </div>

                  <div className="season-record-box">
                    <span className="season-record-label">
                      <Swords size={12} style={{ color: "#fff" }} />
                      DAILY BURST
                    </span>
                    <span className="season-record-val">
                      {dailyRecordClear}
                      <span className="season-record-unit">QUESTS</span>
                    </span>
                    <span className="season-record-sub">Single 24h Window</span>
                  </div>

                  <div className="season-record-box">
                    <span className="season-record-label">
                      <TrendingUp size={12} style={{ color: "#dac0c8" }} />
                      MAX DAILY XP
                    </span>
                    <span className="season-record-val" style={{ color: "#dac0c8" }}>
                      {maxDailyXP.toLocaleString()}
                      <span className="season-record-unit">XP</span>
                    </span>
                    <span className="season-record-sub">Operational Surge</span>
                  </div>

                  <div className="season-record-box">
                    <span className="season-record-label">
                      <Coins size={12} style={{ color: "var(--season-gold-light)" }} />
                      MAX DAILY GOLD
                    </span>
                    <span className="season-record-val" style={{ color: "var(--season-gold-light)" }}>
                      {maxDailyGold.toLocaleString()}
                      <span className="season-record-unit">G</span>
                    </span>
                    <span className="season-record-sub">Bounty Peak</span>
                  </div>

                  <div className="season-record-box">
                    <span className="season-record-label">
                      <Trophy size={12} style={{ color: "#ffdad6" }} />
                      PEAK CYCLE LVL
                    </span>
                    <span className="season-record-val" style={{ color: "#ffdad6" }}>
                      LVL {peakCycleLevel}
                    </span>
                    <span className="season-record-sub">Season Capstone</span>
                  </div>
                </div>
              </div>

              {/* 2. TACTICAL TELEMETRY & ANALYTICS (RPG READOUT) */}
              <div className="season-right-panel">
                <div className="season-right-panel-header">
                  <h3 className="season-right-panel-title">
                    <Activity size={16} style={{ color: "var(--season-crimson)" }} />
                    <span>HUNTER EFFICIENCY TELEMETRY</span>
                  </h3>
                  <span className="season-beacon-dot" style={{ width: 6, height: 6 }}>
                    <span className="season-beacon-ping" />
                    <span className="season-beacon-core" style={{ width: 6, height: 6 }} />
                  </span>
                </div>

                <div className="season-telemetry-grid">
                  <div className="season-telemetry-box">
                    <span className="season-telemetry-label">QUEST VELOCITY</span>
                    <span className="season-telemetry-val">↑ +18%</span>
                    <span className="season-telemetry-sub">Accelerated clearance</span>
                  </div>

                  <div className="season-telemetry-box">
                    <span className="season-telemetry-label">XP TRAJECTORY</span>
                    <span className="season-telemetry-val" style={{ color: "#ffb4ab" }}>↑ +12%</span>
                    <span className="season-telemetry-sub">Optimal tier pace</span>
                  </div>

                  <div className="season-telemetry-box">
                    <span className="season-telemetry-label">MEAN RESONANCE</span>
                    <span className="season-telemetry-val" style={{ color: "var(--season-gold-light)" }}>342 XP</span>
                    <span className="season-telemetry-sub">Habit yield / day</span>
                  </div>

                  <div className="season-telemetry-box">
                    <span className="season-telemetry-label">DISCIPLINE INTEGRITY</span>
                    <span className="season-telemetry-val" style={{ color: "var(--season-green)" }}>
                      {Math.min(100, Math.max(70, (player?.progress.currentStreak ?? 1) * 12))}%
                    </span>
                    <span className="season-telemetry-sub">Discipline adherence</span>
                  </div>
                </div>

                {/* 7-Day Consistency Micro Bar / Sparkline */}
                <div className="season-sparkline-box">
                  <div className="season-sparkline-header">
                    <span style={{ color: "var(--season-text-slate)", fontWeight: 600 }}>
                      7-DAY HABIT CONTINUITY SPECTRUM
                    </span>
                    <span style={{ color: "#ffb4ab", fontWeight: 700 }}>ACTIVE</span>
                  </div>

                  <svg
                    style={{ width: "100%", height: 50, color: "var(--season-crimson)" }}
                    fill="none"
                    viewBox="0 0 320 64"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="seasonGlowGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 10 50 L 55 42 L 105 28 L 155 35 L 205 18 L 255 12 L 310 8 L 310 64 L 10 64 Z"
                      fill="url(#seasonGlowGrad)"
                    />
                    <path
                      d="M 10 50 L 55 42 L 105 28 L 155 35 L 205 18 L 255 12 L 310 8"
                      stroke="#dc2626"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />
                    <circle cx="10" cy="50" fill="#dc2626" r="3" />
                    <circle cx="55" cy="42" fill="#dc2626" r="3" />
                    <circle cx="105" cy="28" fill="#dc2626" r="3" />
                    <circle cx="155" cy="35" fill="#dc2626" r="3" />
                    <circle cx="205" cy="18" fill="#dc2626" r="3" />
                    <circle cx="255" cy="12" fill="#dc2626" r="3" />
                    <circle cx="310" cy="8" fill="#ffdad6" r="4.5" stroke="#dc2626" strokeWidth="2" />
                  </svg>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontFamily: "JetBrains Mono, monospace", fontSize: "0.62rem", color: "var(--season-text-dim)" }}>
                    <span>D-6</span>
                    <span>D-5</span>
                    <span>D-4</span>
                    <span>D-3</span>
                    <span>D-2</span>
                    <span>YDAY</span>
                    <span style={{ color: "#ffb4ab", fontWeight: 700 }}>TODAY</span>
                  </div>
                </div>
              </div>

              {/* 3. SYSTEM PROTOCOL ENGINE (CYCLE STATE TELEMETRY) */}
              <div className="season-right-panel">
                <div className="season-right-panel-header">
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.68rem", color: "var(--season-text-dim)" }}>
                    SYSTEM PROTOCOL ENGINE
                  </span>
                  <span className="season-hero-tag" style={{ fontSize: "0.6rem" }}>
                    ACTIVE (CYCLE {String(season.seasonNumber).padStart(2, "0")})
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#fff", textTransform: "uppercase" }}>
                    CYCLE STATE TELEMETRY
                  </span>
                  <p style={{ fontSize: "0.8rem", color: "var(--season-text-slate)", margin: 0, lineHeight: 1.5 }}>
                    Current hunter session locked to Cycle {String(season.seasonNumber).padStart(2, "0")}. Review historical season clearance status or preview upcoming seasonal deployment.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, paddingTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setShowArchiveModal(true)}
                    className="season-action-btn"
                    style={{ background: "var(--season-card-lowest)", border: "1px solid var(--season-subtle-border)", color: "#cbd5e1", fontSize: "0.68rem" }}
                  >
                    <History size={13} />
                    <span>CYCLE 01 ARCHIVE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="season-action-btn"
                    style={{ background: "var(--season-card-lowest)", border: "1px solid rgba(217, 119, 6, 0.4)", color: "var(--season-gold-light)", fontSize: "0.68rem" }}
                  >
                    <Calendar size={13} />
                    <span>CYCLE 03 PREVIEW</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ====================================================================
          MODAL 1: CYCLE 01 ARCHIVE SUMMARY (DARK THEME)
          ==================================================================== */}
      {showArchiveModal && (
        <div className="season-modal-backdrop" onClick={() => setShowArchiveModal(false)}>
          <div className="season-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="season-modal-header">
              <h3 className="season-modal-title">CYCLE 01 ARCHIVE REPORT</h3>
              <button
                type="button"
                className="season-modal-close-btn"
                onClick={() => setShowArchiveModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="season-modal-body">
              <p>
                <strong style={{ color: "#fff", fontFamily: "Space Grotesk, sans-serif" }}>
                  SEASON 01 — THE HUNTER'S AWAKENING
                </strong>
              </p>
              <p>
                Concluded on 2026-09-15. All habit directives and milestones attained during the
                genesis cycle are archived into your permanent Hunter Association dossier.
              </p>

              <div style={{ padding: 12, borderRadius: 8, background: "var(--season-card-lowest)", border: "1px solid var(--season-subtle-border)", display: "flex", justifyContent: "space-between", fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem" }}>
                <span>SPOILS VAULT: ALL PRESERVED</span>
                <span style={{ color: "var(--season-gold-light)", fontWeight: 700 }}>
                  MILESTONES UNLOCKED
                </span>
              </div>
            </div>

            <button
              type="button"
              className="season-action-btn"
              style={{ width: "100%", marginTop: 8 }}
              onClick={() => setShowArchiveModal(false)}
            >
              DISMISS ARCHIVE
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: CYCLE 03 INTEL PREVIEW (DARK THEME)
          ==================================================================== */}
      {showPreviewModal && (
        <div className="season-modal-backdrop" onClick={() => setShowPreviewModal(false)}>
          <div className="season-modal-panel" style={{ borderColor: "rgba(217, 119, 6, 0.4)" }} onClick={(e) => e.stopPropagation()}>
            <div className="season-modal-header">
              <h3 className="season-modal-title" style={{ color: "var(--season-gold-light)" }}>
                CYCLE 03 PREVIEW INTEL
              </h3>
              <button
                type="button"
                className="season-modal-close-btn"
                onClick={() => setShowPreviewModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="season-modal-body">
              <p>
                <strong style={{ color: "#fff", fontFamily: "Space Grotesk, sans-serif" }}>
                  SEASON 03 — THE NEON CRUCIBLE
                </strong>
              </p>
              <p>
                Scheduled deployment: <strong style={{ color: "#fff" }}>2026-10-01</strong> (15-Day Continuous Cycle).
                Sector threat matrices will calibrate to new apex parameters with advanced relic caches and raid multipliers.
              </p>

              <div style={{ padding: 12, borderRadius: 8, background: "var(--season-card-lowest)", border: "1px solid var(--season-subtle-border)", display: "flex", justifyContent: "space-between", fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem" }}>
                <span>ESTIMATED TIME TO DEPLOY</span>
                <span style={{ color: "#ffb4ab", fontWeight: 700 }}>
                  {season.daysRemaining} DAYS REMAINING
                </span>
              </div>
            </div>

            <button
              type="button"
              className="season-claim-btn"
              style={{ width: "100%", marginTop: 8 }}
              onClick={() => setShowPreviewModal(false)}
            >
              CONFIRM INTEL RECEIVED
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
