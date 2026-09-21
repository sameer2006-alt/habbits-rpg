import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  Check,
  CheckCircle2,
  ChevronRight,
  Flame,
  Info,
  Lock,
  Shield,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Zap,
  Activity,
  ArrowRight,
} from "lucide-react";
import type { Player, RankDefinition, StatName } from "../types/game";
import {
  RANK_DEFINITIONS,
  calculateRankProgress,
  checkSpecialCondition,
} from "../data/ranks";
import { calculatePowerScore } from "../lib/powerScore";
import { getRequiredXP, getXPIntoCurrentLevel } from "../utils/levelSystem";
import RankBadge from "../components/RankBadge";
import RankInspectorModal from "../components/RankInspectorModal";
import "./RankProgression.css";

interface RankProgressionProps {
  player: Player;
  totalQuestsCompleted: number;
  bossesDefeatedCount: number;
}

export const RankProgression: React.FC<RankProgressionProps> = ({
  player,
  totalQuestsCompleted,
  bossesDefeatedCount,
}) => {
  const [selectedRank, setSelectedRank] = useState<RankDefinition | null>(null);

  const currentRankId = player.progress.rank || "F";
  const userStats = {
    totalXP: player.progress.totalXP,
    tasksCompleted: totalQuestsCompleted,
    streak: player.progress.currentStreak,
    bestStreak: player.progress.bestStreak,
    stats: player.stats,
    bossesSlain: bossesDefeatedCount,
  };

  const progressInfo = calculateRankProgress({
    currentRankId,
    totalXP: userStats.totalXP,
    tasksCompleted: userStats.tasksCompleted,
    streak: userStats.streak,
    bestStreak: userStats.bestStreak,
    stats: userStats.stats,
    bossesSlain: userStats.bossesSlain,
  });

  const {
    currentRank,
    nextRank,
    overallPercent,
    allRequirementsMet,
    xpRemaining,
    tasksRemaining,
    streakRemaining,
    specialRemainingText,
  } = progressInfo;

  // Derive dynamic Power Score rating
  const powerScore = calculatePowerScore({
    level: player.progress.level,
    rankTierOrder: currentRank.tierOrder,
    effectiveStats: player.stats,
    totalQuestsCompleted,
    bestStreak: player.progress.bestStreak ?? player.progress.currentStreak,
    bossesSlain: bossesDefeatedCount,
    achievementsUnlocked: 0,
  });

  // Calculate Level XP metrics
  const currentLevelXP = getXPIntoCurrentLevel(player.progress.totalXP);
  const reqLevelXP = getRequiredXP(player.progress.level);
  const levelPercent = Math.min(
    100,
    Math.floor((currentLevelXP / Math.max(1, reqLevelXP)) * 100)
  );

  // Criteria counts
  const totalCriteria = nextRank ? 3 + (nextRank.specialConditionText ? 1 : 0) : 0;
  const satisfiedCriteria = progressInfo.requirements.filter((r) => r.completed).length;

  // Stat benchmark highest value
  const statEntries = Object.entries(player.stats || {}) as [StatName, number][];
  const sortedStats = [...statEntries].sort((a, b) => b[1] - a[1]);
  const highestStat = sortedStats[0] || ["focus", 0];

  return (
    <div className="rank-root">
      <div className="rank-content-wrapper">
        {/* ==================================================================
            1. TOP BREADCRUMB & STRATEGIC TELEMETRY HEADER
            ================================================================== */}
        <header className="rank-header-bar">
          <div className="rank-header-meta">
            <div className="rank-protocol-tag">
              <span className={`rank-pulse-dot ${allRequirementsMet ? "success" : ""}`} />
              <span>SYS.EVAL // ASCENSION ENGINE</span>
              <span>/</span>
              <span>HUNTER ASCENSION PROTOCOL V2.4</span>
              <span>/</span>
              <span style={{ color: "var(--color-tertiary)" }}>
                TIER {currentRank.tierOrder + 1}
              </span>
            </div>

            <div className="rank-header-title-row">
              <h1 className="rank-main-title">
                {allRequirementsMet ? "ASCENSION THRESHOLD REACHED" : "HUNTER ASCENSION EVALUATOR"}
              </h1>
              <span className="rank-authority-badge">
                AUTHORITY TIER {currentRank.tierOrder + 1} OF 10
              </span>
            </div>

            <p className="rank-header-description">
              Ascension evaluates multi-dimensional protocol criteria beyond pure level gains. XP
              drives personal Level; Rank dictates dimensional gate clearance and tactical
              sovereignty.
            </p>
          </div>

          {/* Right Telemetry Cluster */}
          <div className="rank-telemetry-cluster">
            {/* Player Level Gauge */}
            <div className="rank-telemetry-tile">
              <div className="rank-telemetry-tile-header">
                <span>PLAYER LEVEL PROGRESS</span>
                <span className="rank-level-val">
                  LV {player.progress.level} ({levelPercent}%)
                </span>
              </div>
              <div className="rank-telemetry-bar-wrap">
                <div
                  className="rank-telemetry-bar-fill"
                  style={{ width: `${levelPercent}%` }}
                />
              </div>
              <span className="rank-telemetry-caption">
                {currentLevelXP.toLocaleString()} / {reqLevelXP.toLocaleString()} XP
              </span>
            </div>

            {/* Ascension Readiness Card */}
            <div
              className={`rank-readiness-card ${
                allRequirementsMet ? "ascension-ready" : ""
              }`}
            >
              <div className="rank-readiness-icon">
                <Shield size={22} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className="rank-readiness-label">
                  {allRequirementsMet ? "ASCENSION READY" : "ASCENSION READINESS"}
                </span>
                <span className="rank-readiness-val">
                  {nextRank
                    ? allRequirementsMet
                      ? "ALL CRITERIA SATISFIED"
                      : `${satisfiedCriteria} OF ${totalCriteria} REQUIREMENTS MET`
                    : "APEX TRANSCENDENCE"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ==================================================================
            2. HERO RANK ASCENSION STAGE (Convergence Bay)
            ================================================================== */}
        <section className="rank-hero-stage">
          <div className="rank-hero-grid">
            {/* CURRENT RANK (Left 5 Cols) */}
            <div
              className="rank-hero-bay"
              style={
                {
                  "--card-accent": currentRank.color,
                  "--card-glow": currentRank.glowColor,
                } as React.CSSProperties
              }
            >
              <div className="rank-bay-header">
                <span className="rank-bay-tag">CURRENT EVALUATED STATUS</span>
                <span className="rank-bay-protocol">
                  PROTOCOL: {currentRank.titleTag.toUpperCase()}
                </span>
              </div>

              <div className="rank-bay-body">
                <div className="rank-emblem-socket">
                  <RankBadge
                    rankId={currentRank.id}
                    size="xl"
                    interactive
                    onClick={() => setSelectedRank(currentRank)}
                  />
                  <span className="rank-emblem-badge-pill">ACTIVE</span>
                </div>

                <div className="rank-bay-info">
                  <span className="rank-bay-category">RANK DESIGNATION</span>
                  <h2 className="rank-bay-name">{currentRank.name}</h2>
                  <div className="rank-bay-subgrid">
                    <div className="rank-subgrid-cell">
                      <span className="rank-subgrid-label">COMBAT POWER</span>
                      <span className="rank-subgrid-val primary">
                        {powerScore.toLocaleString()} CP
                      </span>
                    </div>
                    <div className="rank-subgrid-cell">
                      <span className="rank-subgrid-label">GATE CLEARANCE</span>
                      <span className="rank-subgrid-val">
                        TIER {currentRank.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rank-bay-footer">
                <span className="rank-insignia-text">
                  <Award size={14} style={{ color: "var(--color-tertiary)" }} />
                  Insignia: {currentRank.badgeLabel}
                </span>
                <span style={{ fontFamily: "monospace", color: "var(--color-tertiary)" }}>
                  STABLE RESONANCE
                </span>
              </div>
            </div>

            {/* CONVERGENCE VECTOR (Center 2 Cols) */}
            {nextRank ? (
              <div className="rank-convergence-bay">
                <div className="rank-convergence-badge">
                  <span
                    className="rank-pulse-dot"
                    style={{
                      backgroundColor: allRequirementsMet
                        ? "var(--color-success)"
                        : "var(--color-primary)",
                    }}
                  />
                  <span>CONVERGENCE</span>
                </div>

                <div className="rank-convergence-track">
                  <div className="rank-convergence-line" />
                  <div className="rank-convergence-node">
                    <ArrowRight size={18} />
                  </div>
                </div>

                <span className="rank-convergence-percent">{overallPercent}%</span>
                <span className="rank-convergence-caption">
                  {satisfiedCriteria} / {totalCriteria} CRITERIA
                </span>
                <span
                  className={`rank-convergence-pill ${
                    allRequirementsMet ? "ready" : ""
                  }`}
                >
                  {allRequirementsMet
                    ? "READY TO ASCEND"
                    : `${totalCriteria - satisfiedCriteria} PENDING`}
                </span>
              </div>
            ) : (
              <div className="rank-convergence-bay">
                <Sparkles size={28} style={{ color: "var(--color-tertiary)" }} />
                <span className="rank-convergence-percent">100%</span>
                <span className="rank-convergence-caption">ZENITH REACHED</span>
              </div>
            )}

            {/* TARGET NEXT RANK (Right 5 Cols) */}
            {nextRank ? (
              <div
                className="rank-hero-bay target-bay"
                style={
                  {
                    "--card-accent": nextRank.color,
                    "--card-glow": nextRank.glowColor,
                  } as React.CSSProperties
                }
              >
                <div className="rank-bay-header">
                  <span className="rank-bay-tag target">
                    <Target size={12} style={{ display: "inline", marginRight: 4 }} />
                    TARGET ASCENSION GOAL
                  </span>
                  <span className="rank-bay-protocol">
                    PROTOCOL: {nextRank.titleTag.toUpperCase()}
                  </span>
                </div>

                <div className="rank-bay-body">
                  <div className="rank-emblem-socket">
                    <RankBadge
                      rankId={nextRank.id}
                      size="xl"
                      interactive
                      onClick={() => setSelectedRank(nextRank)}
                    />
                    <span className="rank-emblem-badge-pill target">
                      {allRequirementsMet ? "UNSEALED" : "NEXT TIER"}
                    </span>
                  </div>

                  <div className="rank-bay-info">
                    <span className="rank-bay-category" style={{ color: "var(--color-tertiary-text)" }}>
                      NEXT HORIZON
                    </span>
                    <h2 className="rank-bay-name">{nextRank.name}</h2>
                    <div className="rank-bay-subgrid">
                      <div className="rank-subgrid-cell">
                        <span className="rank-subgrid-label">REQUIRED XP</span>
                        <span className="rank-subgrid-val tertiary">
                          {nextRank.requiredXP.toLocaleString()} XP
                        </span>
                      </div>
                      <div className="rank-subgrid-cell">
                        <span className="rank-subgrid-label">TARGET CLEARANCE</span>
                        <span className="rank-subgrid-val">
                          TIER {nextRank.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rank-bay-footer">
                  <span className="rank-insignia-text" style={{ color: "var(--color-tertiary-text)" }}>
                    <Sparkles size={14} />
                    {nextRank.perks[0] || "Privilege Access Expansion"}
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color: allRequirementsMet ? "var(--color-success)" : "var(--color-primary)",
                    }}
                  >
                    {allRequirementsMet
                      ? "READY TO ASCEND"
                      : `${totalCriteria - satisfiedCriteria} TASKS REMAINING`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rank-hero-bay target-bay">
                <div className="rank-apex-celebration">
                  <Sparkles size={36} style={{ color: "var(--color-tertiary)" }} />
                  <h3>APEX TRANSCENDENCE</h3>
                  <p>
                    You have conquered all 10 ranks. You reign at the absolute summit of human
                    willpower and discipline.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ==================================================================
            3. REQUIREMENTS MATRIX & ACTIONABLE DOSSIER (8 / 4 BENTO GRID)
            ================================================================== */}
        {nextRank && (
          <section className="rank-matrix-grid">
            {/* 8-Column Criteria Matrix */}
            <div className="rank-criteria-bay">
              <div className="rank-section-header">
                <div className="rank-section-title-group">
                  <Target size={18} style={{ color: "var(--color-primary)" }} />
                  <h3>ASCENSION CRITERIA MATRIX</h3>
                </div>
                <span className="rank-section-cycle">
                  EVALUATION CYCLE #{player.progress.level * 10 + currentRank.tierOrder}
                </span>
              </div>

              <div className="rank-criteria-cards-grid">
                {/* 1. Total XP Threshold */}
                {(() => {
                  const xpPassed = userStats.totalXP >= nextRank.requiredXP;
                  const xpPct = Math.min(
                    100,
                    Math.floor((userStats.totalXP / Math.max(1, nextRank.requiredXP)) * 100)
                  );
                  return (
                    <div className={`rank-criteria-card ${xpPassed ? "satisfied" : ""}`}>
                      <div className="rank-criteria-card-header">
                        <div>
                          <div className="rank-criteria-lead">
                            <span className="rank-criteria-lead-icon">
                              <Sparkles size={16} />
                            </span>
                            <span className="rank-criteria-label">Total XP Threshold</span>
                          </div>
                          <div className="rank-criteria-desc">
                            Resonance acquired via daily directives & core habits.
                          </div>
                        </div>
                        <span
                          className={`rank-criteria-status-badge ${
                            xpPassed ? "satisfied" : "pending"
                          }`}
                        >
                          {xpPassed ? (
                            <>
                              <Check size={12} /> SATISFIED
                            </>
                          ) : (
                            `${xpPct}% PENDING`
                          )}
                        </span>
                      </div>

                      <div className="rank-criteria-progress-section">
                        <div className="rank-criteria-numbers">
                          <span className="rank-criteria-current-req">
                            {userStats.totalXP.toLocaleString()} / {nextRank.requiredXP.toLocaleString()} XP
                          </span>
                          <span
                            className={`rank-criteria-delta ${xpPassed ? "satisfied" : ""}`}
                          >
                            {xpPassed
                              ? `+${(userStats.totalXP - nextRank.requiredXP).toLocaleString()} SURPLUS`
                              : `-${xpRemaining.toLocaleString()} XP NEEDED`}
                          </span>
                        </div>
                        <div className="rank-criteria-bar-track">
                          <div
                            className={`rank-criteria-bar-fill ${xpPassed ? "satisfied" : ""}`}
                            style={{ width: `${xpPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Completed Quests */}
                {(() => {
                  const taskPassed = userStats.tasksCompleted >= nextRank.requiredTasks;
                  const taskPct = Math.min(
                    100,
                    Math.floor(
                      (userStats.tasksCompleted / Math.max(1, nextRank.requiredTasks)) * 100
                    )
                  );
                  return (
                    <div className={`rank-criteria-card ${taskPassed ? "satisfied" : ""}`}>
                      <div className="rank-criteria-card-header">
                        <div>
                          <div className="rank-criteria-lead">
                            <span className="rank-criteria-lead-icon">
                              <Swords size={16} />
                            </span>
                            <span className="rank-criteria-label">Habit Directives Cleared</span>
                          </div>
                          <div className="rank-criteria-desc">
                            Execution of assigned daily missions and guild bounties.
                          </div>
                        </div>
                        <span
                          className={`rank-criteria-status-badge ${
                            taskPassed ? "satisfied" : "pending"
                          }`}
                        >
                          {taskPassed ? (
                            <>
                              <Check size={12} /> SATISFIED
                            </>
                          ) : (
                            `${taskPct}% PENDING`
                          )}
                        </span>
                      </div>

                      <div className="rank-criteria-progress-section">
                        <div className="rank-criteria-numbers">
                          <span className="rank-criteria-current-req">
                            {userStats.tasksCompleted} / {nextRank.requiredTasks} Quests
                          </span>
                          <span
                            className={`rank-criteria-delta ${taskPassed ? "satisfied" : ""}`}
                          >
                            {taskPassed
                              ? `+${userStats.tasksCompleted - nextRank.requiredTasks} SURPLUS`
                              : `-${tasksRemaining} QUESTS NEEDED`}
                          </span>
                        </div>
                        <div className="rank-criteria-bar-track">
                          <div
                            className={`rank-criteria-bar-fill ${taskPassed ? "satisfied" : ""}`}
                            style={{ width: `${taskPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Continuity Streak */}
                {(() => {
                  const effectiveStreak = Math.max(userStats.streak, userStats.bestStreak ?? 0);
                  const streakPassed = effectiveStreak >= nextRank.requiredStreak;
                  const streakPct =
                    nextRank.requiredStreak === 0
                      ? 100
                      : Math.min(
                          100,
                          Math.floor((effectiveStreak / nextRank.requiredStreak) * 100)
                        );
                  return (
                    <div className={`rank-criteria-card ${streakPassed ? "satisfied" : ""}`}>
                      <div className="rank-criteria-card-header">
                        <div>
                          <div className="rank-criteria-lead">
                            <span className="rank-criteria-lead-icon">
                              <Flame size={16} />
                            </span>
                            <span className="rank-criteria-label">Discipline Continuity</span>
                          </div>
                          <div className="rank-criteria-desc">
                            Unbroken habit execution cycle to confirm mental fortitude.
                          </div>
                        </div>
                        <span
                          className={`rank-criteria-status-badge ${
                            streakPassed ? "satisfied" : "pending"
                          }`}
                        >
                          {streakPassed ? (
                            <>
                              <Check size={12} /> SATISFIED
                            </>
                          ) : (
                            `${streakPct}% PENDING`
                          )}
                        </span>
                      </div>

                      <div className="rank-criteria-progress-section">
                        <div className="rank-criteria-numbers">
                          <span className="rank-criteria-current-req">
                            {effectiveStreak} / {nextRank.requiredStreak} Days Active
                          </span>
                          <span
                            className={`rank-criteria-delta ${streakPassed ? "satisfied" : ""}`}
                          >
                            {streakPassed
                              ? "STREAK SECURED"
                              : `-${streakRemaining} DAYS NEEDED`}
                          </span>
                        </div>
                        <div className="rank-criteria-bar-track">
                          <div
                            className={`rank-criteria-bar-fill ${streakPassed ? "satisfied" : ""}`}
                            style={{ width: `${streakPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Special Directive or Benchmark */}
                {(() => {
                  if (nextRank.specialConditionText) {
                    const specialPassed = checkSpecialCondition(
                      nextRank.specialConditionKey,
                      userStats.stats,
                      userStats.bossesSlain
                    );
                    return (
                      <div className={`rank-criteria-card ${specialPassed ? "satisfied" : ""}`}>
                        <div className="rank-criteria-card-header">
                          <div>
                            <div className="rank-criteria-lead">
                              <span className="rank-criteria-lead-icon">
                                <Zap size={16} />
                              </span>
                              <span className="rank-criteria-label">Special Milestone</span>
                            </div>
                            <div className="rank-criteria-desc">
                              {nextRank.specialConditionText}
                            </div>
                          </div>
                          <span
                            className={`rank-criteria-status-badge ${
                              specialPassed ? "satisfied" : "pending"
                            }`}
                          >
                            {specialPassed ? (
                              <>
                                <Check size={12} /> SATISFIED
                              </>
                            ) : (
                              "REQUIRED"
                            )}
                          </span>
                        </div>

                        <div className="rank-criteria-progress-section">
                          <div className="rank-criteria-numbers">
                            <span className="rank-criteria-current-req">
                              Special Evaluation Status
                            </span>
                            <span
                              className={`rank-criteria-delta ${
                                specialPassed ? "satisfied" : ""
                              }`}
                            >
                              {specialPassed ? "VERIFIED" : "INCOMPLETE"}
                            </span>
                          </div>
                          <div className="rank-criteria-bar-track">
                            <div
                              className={`rank-criteria-bar-fill ${
                                specialPassed ? "satisfied" : ""
                              }`}
                              style={{ width: specialPassed ? "100%" : "25%" }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Default 4th card: Core Attribute Caliber baseline
                  return (
                    <div className="rank-criteria-card satisfied">
                      <div className="rank-criteria-card-header">
                        <div>
                          <div className="rank-criteria-lead">
                            <span className="rank-criteria-lead-icon">
                              <Activity size={16} />
                            </span>
                            <span className="rank-criteria-label">Hunter Caliber Baseline</span>
                          </div>
                          <div className="rank-criteria-desc">
                            Core attributes support standard operational clearance.
                          </div>
                        </div>
                        <span className="rank-criteria-status-badge satisfied">
                          <Check size={12} /> SATISFIED
                        </span>
                      </div>

                      <div className="rank-criteria-progress-section">
                        <div className="rank-criteria-numbers">
                          <span className="rank-criteria-current-req">
                            Dominant: {highestStat[0].toUpperCase()} ({highestStat[1]} Pts)
                          </span>
                          <span className="rank-criteria-delta satisfied">CAPABLE</span>
                        </div>
                        <div className="rank-criteria-bar-track">
                          <div
                            className="rank-criteria-bar-fill satisfied"
                            style={{ width: "100%" }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Attribute Benchmark Telemetry Strip */}
              <div className="rank-benchmark-strip">
                <div className="rank-benchmark-lead">
                  <div className="rank-benchmark-icon-box">
                    <Activity size={22} />
                  </div>
                  <div>
                    <div className="rank-benchmark-title">ATTRIBUTE BENCHMARK BREAKDOWN</div>
                    <div className="rank-benchmark-subtitle">
                      Real-time calibrated attributes powering combat and discipline performance.
                    </div>
                  </div>
                </div>

                <div className="rank-benchmark-chips">
                  {statEntries.map(([name, val]) => (
                    <span
                      key={name}
                      className={`rank-benchmark-chip ${
                        name === highestStat[0] ? "highlight" : ""
                      }`}
                    >
                      {name.toUpperCase().slice(0, 3)}: {val}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 4-Column "What You Still Need" Actionable Dossier */}
            <div className="rank-dossier-bay">
              <div className="rank-dossier-header">
                <div className="rank-dossier-title">
                  <Target size={18} style={{ color: "var(--color-primary)" }} />
                  <span>ASCENSION DOSSIER</span>
                </div>
                <span className="rank-dossier-tag">
                  {allRequirementsMet ? "ALL CLEAR" : "FINAL GAPS"}
                </span>
              </div>

              <div className="rank-dossier-body">
                <span className="rank-dossier-subtitle">
                  {allRequirementsMet ? "GATE STATUS: UNSEALED" : "OUTSTANDING REQUIREMENTS"}
                </span>

                {allRequirementsMet ? (
                  <div className="rank-all-satisfied-card">
                    <CheckCircle2 size={32} style={{ color: "var(--color-success)" }} />
                    <h4>ASCENSION THRESHOLD REACHED</h4>
                    <p>
                      All multi-variable parameters for Rank {nextRank.badgeLabel} are 100%
                      fulfilled. Containment lattice deactivated.
                    </p>
                  </div>
                ) : (
                  <>
                    {xpRemaining > 0 && (
                      <div className="rank-gap-item">
                        <Sparkles size={16} className="rank-gap-icon" />
                        <div className="rank-gap-content">
                          <span className="rank-gap-title">
                            +{xpRemaining.toLocaleString()} XP Needed
                          </span>
                          <span className="rank-gap-hint">
                            Complete daily directives or conquer arena bounties to gain XP.
                          </span>
                        </div>
                      </div>
                    )}

                    {tasksRemaining > 0 && (
                      <div className="rank-gap-item">
                        <Swords size={16} className="rank-gap-icon" />
                        <div className="rank-gap-content">
                          <span className="rank-gap-title">
                            +{tasksRemaining} Quests Needed
                          </span>
                          <span className="rank-gap-hint">
                            Execute habit directives on the Mission Board.
                          </span>
                        </div>
                      </div>
                    )}

                    {streakRemaining > 0 && (
                      <div className="rank-gap-item">
                        <Flame size={16} className="rank-gap-icon" />
                        <div className="rank-gap-content">
                          <span className="rank-gap-title">
                            +{streakRemaining} Days Active Streak
                          </span>
                          <span className="rank-gap-hint">
                            Check in consecutive days without breaking continuity.
                          </span>
                        </div>
                      </div>
                    )}

                    {specialRemainingText && (
                      <div className="rank-gap-item">
                        <Zap size={16} className="rank-gap-icon" />
                        <div className="rank-gap-content">
                          <span className="rank-gap-title">Special Directive</span>
                          <span className="rank-gap-hint">{specialRemainingText}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="rank-dossier-actions">
                <Link to="/quests" style={{ textDecoration: "none" }}>
                  <button type="button" className="rank-dossier-btn-primary">
                    <Swords size={16} />
                    <span>DEPLOY DIRECTIVES</span>
                  </button>
                </Link>
                <button
                  type="button"
                  className="rank-dossier-btn-secondary"
                  onClick={() => setSelectedRank(nextRank)}
                >
                  INSPECT TARGET RANK SPECS
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ==================================================================
            4. NEXT RANK UNLOCK PRIVILEGES & SPOILS (4-BAY GRID)
            ================================================================== */}
        {nextRank && (
          <section className="rank-unlocks-bay">
            <div className="rank-section-header">
              <div className="rank-section-title-group">
                <Award size={18} style={{ color: "var(--color-tertiary)" }} />
                <h3>{nextRank.badgeLabel} UNLOCK PRIVILEGES & SPOILS</h3>
              </div>
              <span className="rank-section-cycle">UNLOCKED UPON ASCENSION</span>
            </div>

            <div className="rank-unlocks-grid">
              {nextRank.perks.map((perk, index) => {
                const perkIcons = [Swords, TrendingUp, Shield, Award];
                const IconComponent = perkIcons[index % perkIcons.length];
                return (
                  <div key={index} className="rank-perk-card">
                    <div className="rank-perk-header">
                      <div className="rank-perk-icon-box">
                        <IconComponent size={18} />
                      </div>
                      <div className="rank-perk-title-group">
                        <span className="rank-perk-category">PRIVILEGE TIER</span>
                        <span className="rank-perk-name">{perk}</span>
                      </div>
                    </div>
                    <p className="rank-perk-desc">
                      Official Hunter Association authorization upgrade granted upon confirming
                      advancement to {nextRank.name}.
                    </p>
                    <span className="rank-perk-badge">+ AUTHORIZED BUFF</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ==================================================================
            5. CANONICAL 10-RANK ASCENSION ROADMAP (LADDER)
            ================================================================== */}
        <section className="rank-ladder-section">
          <div className="rank-section-header">
            <div className="rank-section-title-group">
              <TrendingUp size={18} style={{ color: "var(--color-primary)" }} />
              <h3>CANONICAL ASCENSION HIERARCHY</h3>
            </div>

            <div className="rank-ladder-legend">
              <span className="rank-legend-item">
                <span className="rank-legend-dot completed" /> Cleared
              </span>
              <span className="rank-legend-item">
                <span className="rank-legend-dot current" /> Current
              </span>
              <span className="rank-legend-item">
                <span className="rank-legend-dot locked" /> Locked
              </span>
            </div>
          </div>

          <div className="rank-ladder-grid">
            {RANK_DEFINITIONS.map((rankDef, index) => {
              const isCurrent = rankDef.id === currentRankId;
              const isPast = rankDef.tierOrder < currentRank.tierOrder;
              const isNext = rankDef.tierOrder === currentRank.tierOrder + 1;

              const effectiveStreak = Math.max(userStats.streak, userStats.bestStreak ?? 0);
              const xpMet = userStats.totalXP >= rankDef.requiredXP;
              const taskMet = userStats.tasksCompleted >= rankDef.requiredTasks;
              const streakMet = effectiveStreak >= rankDef.requiredStreak;
              const specialMet = checkSpecialCondition(
                rankDef.specialConditionKey,
                userStats.stats,
                userStats.bossesSlain
              );
              const allMet = xpMet && taskMet && streakMet && specialMet;

              let statusClass = "locked";
              if (isCurrent) statusClass = "active-node";
              else if (isPast) statusClass = "unlocked";

              return (
                <motion.div
                  key={rankDef.id}
                  className={`rank-node-card ${statusClass}`}
                  onClick={() => setSelectedRank(rankDef)}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.18 }}
                  style={
                    {
                      "--node-accent": rankDef.color,
                      "--node-glow": rankDef.glowColor,
                    } as React.CSSProperties
                  }
                >
                  <div className="rank-node-status-pill">
                    {isCurrent ? (
                      <span className="rank-node-badge current">YOU</span>
                    ) : isPast ? (
                      <span className="rank-node-badge completed">
                        <Check size={10} /> DONE
                      </span>
                    ) : isNext && allMet ? (
                      <span className="rank-node-badge ready">READY</span>
                    ) : (
                      <span className="rank-node-badge locked">
                        <Lock size={10} /> T{index + 1}
                      </span>
                    )}
                  </div>

                  <div className="rank-node-crest-slot">
                    <RankBadge rankId={rankDef.id} size="sm" />
                  </div>

                  <span className="rank-node-symbol" style={{ color: rankDef.color }}>
                    {rankDef.id}
                  </span>
                  <span className="rank-node-name">{rankDef.name}</span>

                  <div className="rank-node-req-preview">
                    <div className={`rank-node-preview-item ${xpMet ? "done" : ""}`}>
                      <span>XP:</span>
                      <strong>{rankDef.requiredXP.toLocaleString()}</strong>
                    </div>
                    <div className={`rank-node-preview-item ${taskMet ? "done" : ""}`}>
                      <span>Quests:</span>
                      <strong>{rankDef.requiredTasks}</strong>
                    </div>
                    <div className={`rank-node-preview-item ${streakMet ? "done" : ""}`}>
                      <span>Streak:</span>
                      <strong>{rankDef.requiredStreak}d</strong>
                    </div>
                  </div>

                  <div className="rank-node-cta">
                    <span>Inspect</span>
                    <ChevronRight size={12} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ==================================================================
            6. HUNTER ASSOCIATION RANK CODEX & PERKS TABLE
            ================================================================== */}
        <section className="rank-codex-section">
          <div className="rank-section-header">
            <div className="rank-section-title-group">
              <Info size={18} style={{ color: "var(--color-primary)" }} />
              <h3>HUNTER ASSOCIATION RANK CODEX</h3>
            </div>
            <span className="rank-section-cycle">TAP ANY ROW TO INSPECT</span>
          </div>

          <div className="rank-codex-table-wrap">
            <table className="rank-codex-table">
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Rank</th>
                  <th>Designation</th>
                  <th>Required XP</th>
                  <th>Quests</th>
                  <th>Streak</th>
                  <th>Special Directive</th>
                  <th>Prestige Privileges</th>
                </tr>
              </thead>
              <tbody>
                {RANK_DEFINITIONS.map((r, i) => {
                  const isUserRank = r.id === currentRankId;
                  return (
                    <tr
                      key={r.id}
                      className={`rank-codex-row ${isUserRank ? "active-row" : ""}`}
                      onClick={() => setSelectedRank(r)}
                    >
                      <td>
                        <span className="rank-tier-pill">Tier {i + 1}</span>
                      </td>
                      <td>
                        <div className="rank-codex-badge-cell">
                          <RankBadge rankId={r.id} size="xs" />
                          <span style={{ fontWeight: 800, color: r.color }}>
                            {r.badgeLabel}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: "#fff" }}>{r.name}</td>
                      <td>{r.requiredXP.toLocaleString()} XP</td>
                      <td>{r.requiredTasks} Quests</td>
                      <td>{r.requiredStreak} Days</td>
                      <td>{r.specialConditionText || "—"}</td>
                      <td>
                        <div>
                          {r.perks.slice(0, 2).map((p, idx) => (
                            <span key={idx} className="rank-codex-perk-chip">
                              {p}
                            </span>
                          ))}
                          {r.perks.length > 2 && (
                            <span
                              className="rank-codex-perk-chip"
                              style={{ color: "var(--color-primary)" }}
                            >
                              +{r.perks.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ==================================================================
            7. RANK INSPECTOR MODAL
            ================================================================== */}
        <RankInspectorModal
          rank={selectedRank}
          isOpen={selectedRank !== null}
          onClose={() => setSelectedRank(null)}
          currentRankId={currentRankId}
          userStats={userStats}
        />
      </div>
    </div>
  );
};

export default RankProgression;
