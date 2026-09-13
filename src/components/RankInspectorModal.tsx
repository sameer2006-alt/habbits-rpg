import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Lock, Shield, Sparkles, X, ChevronRight, Zap } from "lucide-react";
import type { PlayerStats, RankDefinition } from "../types/game";
import RankBadge from "./RankBadge";
import { checkSpecialCondition, getRankDefinition } from "../data/ranks";

interface RankInspectorModalProps {
  rank: RankDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  currentRankId: string;
  userStats: {
    totalXP: number;
    tasksCompleted: number;
    streak: number;
    bestStreak?: number;
    stats: PlayerStats;
    bossesSlain: number;
  };
}

export const RankInspectorModal: React.FC<RankInspectorModalProps> = ({
  rank,
  isOpen,
  onClose,
  currentRankId,
  userStats,
}) => {
  if (!isOpen || !rank) return null;

  // Determine unlock status relative to progression ladder
  const currentRankDef = getRankDefinition(currentRankId);
  const currentRankOrder = currentRankDef.tierOrder;
  const isCurrent = rank.id === currentRankId;
  const isPast = rank.tierOrder < currentRankOrder;
  const isNext = rank.tierOrder === currentRankOrder + 1;
  const effectiveStreak = Math.max(userStats.streak, userStats.bestStreak ?? 0);
  const allRequirementsMet =
    userStats.totalXP >= rank.requiredXP &&
    userStats.tasksCompleted >= rank.requiredTasks &&
    effectiveStreak >= rank.requiredStreak &&
    checkSpecialCondition(rank.specialConditionKey, userStats.stats, userStats.bossesSlain);

  const xpProgress = Math.max(
    0,
    Math.min(
      100,
      rank.requiredXP <= 0
        ? 100
        : Math.floor(((userStats.totalXP || 0) / rank.requiredXP) * 100)
    )
  );

  const taskProgress = Math.max(
    0,
    Math.min(
      100,
      rank.requiredTasks <= 0
        ? 100
        : Math.floor(((userStats.tasksCompleted || 0) / rank.requiredTasks) * 100)
    )
  );

  const streakProgress = Math.max(
    0,
    Math.min(
      100,
      rank.requiredStreak <= 0
        ? 100
        : Math.floor(((effectiveStreak || 0) / rank.requiredStreak) * 100)
    )
  );

  const specialPassed = checkSpecialCondition(
    rank.specialConditionKey,
    userStats.stats,
    userStats.bossesSlain
  );

  return (
    <AnimatePresence>
      <div className="rank-modal-backdrop" onClick={onClose}>
        <motion.div
          className="rank-modal-card"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          style={
            {
              "--rank-modal-color": rank.color,
              "--rank-modal-glow": rank.glowColor,
            } as React.CSSProperties
          }
        >
          {/* Header Banner */}
          <div className="rank-modal-header">
            <div className="rank-modal-header-badge">
              <RankBadge rankId={rank.id} size="lg" />
            </div>

            <div className="rank-modal-header-info">
              <div className="rank-modal-tags">
                <span
                  className="rank-modal-tier-tag"
                  style={{ color: rank.color, borderColor: rank.color }}
                >
                  TIER {rank.tierOrder + 1} / 10
                </span>
                {isCurrent && (
                  <span className="rank-modal-status-pill current">
                    CURRENT RANK
                  </span>
                )}
                {isPast && (
                  <span className="rank-modal-status-pill unlocked">
                    <CheckCircle2 size={12} /> UNLOCKED
                  </span>
                )}
                {!isCurrent && !isPast && isNext && allRequirementsMet && (
                  <span
                    className="rank-modal-status-pill unlocked"
                    style={{
                      background: "rgba(52, 211, 153, 0.2)",
                      color: "#34d399",
                      borderColor: "#34d399",
                    }}
                  >
                    <Sparkles size={12} /> READY TO ASCEND
                  </span>
                )}
                {!isCurrent && !isPast && (!isNext || !allRequirementsMet) && (
                  <span className="rank-modal-status-pill locked">
                    <Lock size={12} /> LOCKED
                  </span>
                )}
              </div>

              <h2 className="rank-modal-title" style={{ color: rank.color }}>
                {rank.badgeLabel}
              </h2>
              <div className="rank-modal-subtitle">{rank.name}</div>
            </div>

            <button
              className="rank-modal-close"
              onClick={onClose}
              aria-label="Close rank modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Lore & System Briefing */}
          <div className="rank-modal-lore-box">
            <div className="rank-lore-label">SYSTEM CLASSIFICATION</div>
            <p className="rank-modal-description">{rank.description}</p>
            <div className="rank-modal-quote">"{rank.lore}"</div>
          </div>

          {/* Multivariable Requirements Section */}
          <div className="rank-modal-section">
            <div className="rank-section-title">
              <Shield size={16} style={{ color: rank.color }} />
              <span>ASCENSION REQUIREMENTS</span>
            </div>

            <div className="rank-req-grid">
              {/* Requirement 1: Total XP */}
              <div
                className={`rank-req-card ${
                  userStats.totalXP >= rank.requiredXP ? "met" : ""
                }`}
              >
                <div className="rank-req-header">
                  <span className="rank-req-name">Experience Points (XP)</span>
                  <span className="rank-req-nums">
                    {userStats.totalXP.toLocaleString()} /{" "}
                    {rank.requiredXP.toLocaleString()} XP
                  </span>
                </div>
                <div className="rank-req-track">
                  <div
                    className="rank-req-fill"
                    style={{
                      width: `${xpProgress}%`,
                      backgroundColor: rank.color,
                    }}
                  />
                </div>
                <div className="rank-req-footer">
                  {userStats.totalXP >= rank.requiredXP ? (
                    <span className="req-tag met">
                      <CheckCircle2 size={12} /> Requirement Met
                    </span>
                  ) : (
                    <span className="req-tag pending">
                      {(Math.max(0, rank.requiredXP - userStats.totalXP)).toLocaleString()} XP
                      Remaining
                    </span>
                  )}
                </div>
              </div>

              {/* Requirement 2: Tasks Completed */}
              <div
                className={`rank-req-card ${
                  userStats.tasksCompleted >= rank.requiredTasks ? "met" : ""
                }`}
              >
                <div className="rank-req-header">
                  <span className="rank-req-name">Quests / Tasks Cleared</span>
                  <span className="rank-req-nums">
                    {userStats.tasksCompleted} / {rank.requiredTasks}
                  </span>
                </div>
                <div className="rank-req-track">
                  <div
                    className="rank-req-fill"
                    style={{
                      width: `${taskProgress}%`,
                      backgroundColor: rank.color,
                    }}
                  />
                </div>
                <div className="rank-req-footer">
                  {userStats.tasksCompleted >= rank.requiredTasks ? (
                    <span className="req-tag met">
                      <CheckCircle2 size={12} /> Requirement Met
                    </span>
                  ) : (
                    <span className="req-tag pending">
                      {Math.max(0, rank.requiredTasks - userStats.tasksCompleted)} Tasks
                      Remaining
                    </span>
                  )}
                </div>
              </div>

              {/* Requirement 3: Day Streak */}
              <div
                className={`rank-req-card ${
                  effectiveStreak >= rank.requiredStreak ? "met" : ""
                }`}
              >
                <div className="rank-req-header">
                  <span className="rank-req-name">Discipline Streak</span>
                  <span className="rank-req-nums">
                    {effectiveStreak} / {rank.requiredStreak} Days
                  </span>
                </div>
                <div className="rank-req-track">
                  <div
                    className="rank-req-fill"
                    style={{
                      width: `${streakProgress}%`,
                      backgroundColor: rank.color,
                    }}
                  />
                </div>
                <div className="rank-req-footer">
                  {effectiveStreak >= rank.requiredStreak ? (
                    <span className="req-tag met">
                      <CheckCircle2 size={12} /> Requirement Met
                    </span>
                  ) : (
                    <span className="req-tag pending">
                      {Math.max(0, rank.requiredStreak - effectiveStreak)} Days Needed
                    </span>
                  )}
                </div>
              </div>

              {/* Requirement 4: Special Condition if applicable */}
              {rank.specialConditionText && (
                <div className={`rank-req-card ${specialPassed ? "met" : ""}`}>
                  <div className="rank-req-header">
                    <span className="rank-req-name">Special Directive</span>
                    <span className="rank-req-nums">
                      {specialPassed ? "1 / 1" : "0 / 1"}
                    </span>
                  </div>
                  <div className="rank-special-desc">
                    <Zap size={14} style={{ color: rank.color }} />
                    <span>{rank.specialConditionText}</span>
                  </div>
                  <div className="rank-req-footer">
                    {specialPassed ? (
                      <span className="req-tag met">
                        <CheckCircle2 size={12} /> Special Directive Fulfilled
                      </span>
                    ) : (
                      <span className="req-tag pending">
                        Action Required: Slay Arena Bosses or Raise Stats
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Perks & Buffs Granted */}
          <div className="rank-modal-section">
            <div className="rank-section-title">
              <Sparkles size={16} style={{ color: rank.color }} />
              <span>PRESTIGE BUFFS & UNLOCKS</span>
            </div>

            <div className="rank-perks-list">
              {rank.perks.map((perk, idx) => (
                <div key={idx} className="rank-perk-item">
                  <ChevronRight size={14} style={{ color: rank.color }} />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Action */}
          <div className="rank-modal-footer">
            <button className="rank-modal-done-btn" onClick={onClose}>
              CONFIRM & CLOSE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RankInspectorModal;

