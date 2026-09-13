import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Flame,
  Info,
  Lock,
  Shield,
  Sparkles,
  Swords,
  Target,
  Zap,
} from "lucide-react";
import type { Player, RankDefinition } from "../types/game";
import {
  RANK_DEFINITIONS,
  calculateRankProgress,
  checkSpecialCondition,
} from "../data/ranks";
import RankBadge from "../components/RankBadge";
import RankInspectorModal from "../components/RankInspectorModal";

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

  const { currentRank, nextRank, overallPercent, xpRemaining, tasksRemaining, streakRemaining } =
    progressInfo;

  return (
    <div className="rank-progression-page">
      {/* Top Breadcrumb / System Header */}
      <div className="rank-page-header">
        <div className="rank-page-header-title">
          <div className="system-tag-line">
            <Shield size={14} />
            <span>HUNTER ASSOCIATION REGISTRATION & RANK REGISTRY</span>
          </div>
          <h1>RANK PROGRESSION SYSTEM</h1>
          <p className="system-subtitle">
            Ascend through the 10 echelons of power. Rank advancement demands absolute discipline across XP, tasks, consistency, and boss subjugation.
          </p>
        </div>
      </div>

      {/* Hero Active Status & Next Rank Breakdown */}
      <div className="rank-hero-grid">
        {/* Current Active Rank Card */}
        <div
          className="rank-hero-card current-rank-hero"
          style={
            {
              "--card-accent": currentRank.color,
              "--card-glow": currentRank.glowColor,
            } as React.CSSProperties
          }
        >
          <div className="card-top-tag">
            <span className="live-dot" /> CURRENT ASSIGNED RANK
          </div>

          <div className="current-rank-content">
            <div className="hero-badge-container">
              <RankBadge rankId={currentRank.id} size="xl" interactive onClick={() => setSelectedRank(currentRank)} />
            </div>

            <div className="hero-rank-details">
              <div className="rank-title-group">
                <span className="rank-code-tag" style={{ color: currentRank.color, borderColor: currentRank.color }}>
                  {currentRank.badgeLabel}
                </span>
                <span className="rank-tier-num">Tier {currentRank.tierOrder + 1} of 10</span>
              </div>
              <h2 className="hero-rank-name" style={{ color: currentRank.color }}>
                {currentRank.name}
              </h2>
              <p className="hero-rank-quote">"{currentRank.description}"</p>

              {/* Quick Stat Badges */}
              <div className="hero-stat-chips">
                <div className="stat-chip">
                  <Sparkles size={14} />
                  <span>{userStats.totalXP.toLocaleString()} Total XP</span>
                </div>
                <div className="stat-chip">
                  <Swords size={14} />
                  <span>{userStats.tasksCompleted} Quests Cleared</span>
                </div>
                <div className="stat-chip">
                  <Flame size={14} />
                  <span>{userStats.streak} Day Streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Rank & Remaining Requirements Breakdown Card */}
        <div
          className="rank-hero-card next-rank-hero"
          style={
            {
              "--card-accent": nextRank?.color ?? "#ffd700",
              "--card-glow": nextRank?.glowColor ?? "rgba(255, 215, 0, 0.4)",
            } as React.CSSProperties
          }
        >
          <div className="card-top-tag">
            <Target size={14} />
            <span>{nextRank ? "NEXT ASCENSION TARGET" : "MAXIMUM RANK ACHIEVED"}</span>
          </div>

          {nextRank ? (
            <div className="next-rank-content">
              <div className="next-rank-header">
                <div className="next-badge-preview">
                  <RankBadge rankId={nextRank.id} size="md" interactive onClick={() => setSelectedRank(nextRank)} />
                </div>
                <div className="next-info-block">
                  <div className="next-title-tag" style={{ color: nextRank.color }}>
                    PROSPECT: {nextRank.badgeLabel}
                  </div>
                  <h3 className="next-rank-name">{nextRank.name}</h3>
                </div>
                <div className="next-overall-percent">
                  <span className="percent-number">{overallPercent}%</span>
                  <span className="percent-label">TOWARDS NEXT RANK</span>
                </div>
              </div>

              {/* Master Overall Progress Bar */}
              <div className="master-progress-bar-container">
                <div className="master-progress-track">
                  <motion.div
                    className="master-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ backgroundColor: nextRank.color }}
                  />
                </div>
              </div>

              {/* Detailed Breakdown Checklist: Remaining Tasks & Points */}
              <div className="remaining-goals-list">
                <div className="remaining-goal-item">
                  <div className="goal-icon-wrapper">
                    <Sparkles size={14} style={{ color: nextRank.color }} />
                  </div>
                  <div className="goal-text">
                    <span className="goal-label">XP Requirement</span>
                    <span className="goal-values">
                      {userStats.totalXP.toLocaleString()} / {nextRank.requiredXP.toLocaleString()} XP
                    </span>
                  </div>
                  <span className={`goal-status ${xpRemaining === 0 ? "done" : "needed"}`}>
                    {xpRemaining === 0 ? "READY" : `-${xpRemaining.toLocaleString()} XP`}
                  </span>
                </div>

                <div className="remaining-goal-item">
                  <div className="goal-icon-wrapper">
                    <Swords size={14} style={{ color: nextRank.color }} />
                  </div>
                  <div className="goal-text">
                    <span className="goal-label">Tasks / Quests Completed</span>
                    <span className="goal-values">
                      {userStats.tasksCompleted} / {nextRank.requiredTasks} Quests
                    </span>
                  </div>
                  <span className={`goal-status ${tasksRemaining === 0 ? "done" : "needed"}`}>
                    {tasksRemaining === 0 ? "READY" : `-${tasksRemaining} Tasks`}
                  </span>
                </div>

                <div className="remaining-goal-item">
                  <div className="goal-icon-wrapper">
                    <Flame size={14} style={{ color: nextRank.color }} />
                  </div>
                  <div className="goal-text">
                    <span className="goal-label">Streak Discipline</span>
                    <span className="goal-values">
                      {Math.max(userStats.streak, userStats.bestStreak ?? 0)} / {nextRank.requiredStreak} Days
                    </span>
                  </div>
                  <span className={`goal-status ${streakRemaining === 0 ? "done" : "needed"}`}>
                    {streakRemaining === 0 ? "READY" : `-${streakRemaining} Days`}
                  </span>
                </div>

                {nextRank.specialConditionText && (
                  <div className="remaining-goal-item">
                    <div className="goal-icon-wrapper">
                      <Zap size={14} style={{ color: nextRank.color }} />
                    </div>
                    <div className="goal-text">
                      <span className="goal-label">Special Milestone</span>
                      <span className="goal-values">{nextRank.specialConditionText}</span>
                    </div>
                    <span
                      className={`goal-status ${
                        checkSpecialCondition(nextRank.specialConditionKey, userStats.stats, userStats.bossesSlain)
                          ? "done"
                          : "needed"
                      }`}
                    >
                      {checkSpecialCondition(nextRank.specialConditionKey, userStats.stats, userStats.bossesSlain)
                        ? "READY"
                        : "INCOMPLETE"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-rank-celebration">
              <Sparkles size={32} style={{ color: "#ffd700" }} />
              <h3>APEX TRANSCENDENCE</h3>
              <p>You have conquered all 10 ranks. You reign at the absolute summit of human willpower.</p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Progression Roadmap */}
      <section className="rank-roadmap-section">
        <div className="section-header-banner">
          <div className="header-left">
            <Award size={20} className="header-icon" />
            <div>
              <h2>HUNTER ASCENSION ROADMAP</h2>
              <p>Click on any rank to inspect its exact multivariable requirements, lore, and unlockable perks.</p>
            </div>
          </div>
          <div className="header-legend">
            <span className="legend-item"><span className="legend-dot completed" /> Unlocked</span>
            <span className="legend-item"><span className="legend-dot current" /> Current</span>
            <span className="legend-item"><span className="legend-dot locked" /> Locked</span>
          </div>
        </div>

        <div className="progression-path-container">
          <div className="progression-path-line" />

          <div className="progression-nodes-list">
            {RANK_DEFINITIONS.map((rankDef, index) => {
              const isCurrent = rankDef.id === currentRankId;
              const isPast = rankDef.tierOrder < currentRank.tierOrder;
              const isNext = rankDef.tierOrder === currentRank.tierOrder + 1;

              // Calculate how close user is to this rank's individual requirements
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

              let nodeStatusText = "Locked";
              let nodeStatusClass = "locked";
              if (isCurrent) {
                nodeStatusText = "Current Rank";
                nodeStatusClass = "current";
              } else if (isPast) {
                nodeStatusText = "Unlocked";
                nodeStatusClass = "unlocked";
              } else if (isNext) {
                nodeStatusText = allMet ? "Ready to Ascend" : "Next Objective";
                nodeStatusClass = "in-progress";
              }

              return (
                <motion.div
                  key={rankDef.id}
                  className={`progression-node-card ${nodeStatusClass} ${isCurrent ? "active-node" : ""}`}
                  onClick={() => setSelectedRank(rankDef)}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.18 }}
                  title={`${rankDef.name} — Status: ${nodeStatusText}`}
                  style={
                    {
                      "--node-accent": rankDef.color,
                      "--node-glow": rankDef.glowColor,
                    } as React.CSSProperties
                  }
                >
                  {/* Status Indicator Pill */}
                  <div className="node-status-pill">
                    {isCurrent ? (
                      <span className="status-badge current">CURRENT</span>
                    ) : isPast ? (
                      <span className="status-badge completed">
                        <CheckCircle2 size={11} /> DONE
                      </span>
                    ) : isNext && allMet ? (
                      <span className="status-badge ready" style={{ background: "#2ed573", color: "#000" }}>
                        READY
                      </span>
                    ) : (
                      <span className="status-badge locked">
                        <Lock size={11} /> TIER {index + 1}
                      </span>
                    )}
                  </div>



                  {/* Badge Crest */}
                  <div className="node-badge-slot">
                    <RankBadge rankId={rankDef.id} size="md" />
                  </div>

                  {/* Rank Title & Label */}
                  <div className="node-title-group">
                    <div className="node-rank-code" style={{ color: rankDef.color }}>
                      {rankDef.badgeLabel}
                    </div>
                    <div className="node-rank-name">{rankDef.name}</div>
                  </div>

                  {/* Requirements Summary Preview */}
                  <div className="node-req-preview">
                    <div className={`preview-item ${xpMet ? "done" : ""}`}>
                      <span>XP:</span>
                      <strong>{rankDef.requiredXP.toLocaleString()}</strong>
                    </div>
                    <div className={`preview-item ${taskMet ? "done" : ""}`}>
                      <span>Tasks:</span>
                      <strong>{rankDef.requiredTasks}</strong>
                    </div>
                    <div className={`preview-item ${streakMet ? "done" : ""}`}>
                      <span>Streak:</span>
                      <strong>{rankDef.requiredStreak}d</strong>
                    </div>
                    {rankDef.specialConditionText && (
                      <div className={`preview-item special ${specialMet ? "done" : ""}`}>
                        <span>Special:</span>
                        <strong>{rankDef.specialConditionText}</strong>
                      </div>
                    )}
                  </div>

                  {/* Node Bottom Action */}
                  <div className="node-inspect-cta">
                    <span>Inspect Requirements</span>
                    <ChevronRight size={13} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ranks Codex & Perks Table */}
      <section className="rank-codex-section">
        <div className="codex-header">
          <Info size={18} />
          <h3>HUNTER ASSOCIATION RANK CODEX</h3>
        </div>

        <div className="codex-table-wrapper">
          <table className="codex-table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Rank</th>
                <th>Designation</th>
                <th>Required XP</th>
                <th>Required Tasks</th>
                <th>Required Streak</th>
                <th>Special Directives</th>
                <th>Prestige Perks & Buffs</th>
              </tr>
            </thead>
            <tbody>
              {RANK_DEFINITIONS.map((r, i) => {
                const isUserRank = r.id === currentRankId;
                return (
                  <tr
                    key={r.id}
                    className={`codex-row ${isUserRank ? "active-row" : ""}`}
                    onClick={() => setSelectedRank(r)}
                  >
                    <td>
                      <span className="tier-pill">Tier {i + 1}</span>
                    </td>
                    <td>
                      <div className="codex-rank-col">
                        <RankBadge rankId={r.id} size="xs" />
                        <span className="codex-rank-label" style={{ color: r.color }}>
                          {r.badgeLabel}
                        </span>
                      </div>
                    </td>
                    <td className="codex-name-cell">{r.name}</td>
                    <td>{r.requiredXP.toLocaleString()} XP</td>
                    <td>{r.requiredTasks} Quests</td>
                    <td>{r.requiredStreak} Days</td>
                    <td>{r.specialConditionText || "—"}</td>
                    <td>
                      <div className="codex-perks-chips">
                        {r.perks.slice(0, 2).map((p, idx) => (
                          <span key={idx} className="perk-chip">
                            {p}
                          </span>
                        ))}
                        {r.perks.length > 2 && (
                          <span className="perk-chip more">+{r.perks.length - 2} more</span>
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

      {/* Rank Inspector Modal */}
      <RankInspectorModal
        rank={selectedRank}
        isOpen={selectedRank !== null}
        onClose={() => setSelectedRank(null)}
        currentRankId={currentRankId}
        userStats={userStats}
      />
    </div>
  );
};

export default RankProgression;
