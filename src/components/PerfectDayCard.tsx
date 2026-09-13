import React from "react";
import { motion } from "framer-motion";
import { Award, CheckCircle2, Circle, Sparkles, Coins, AlertCircle } from "lucide-react";
import type { DailyDirective } from "../data/dailyDirectives";
import {
  type PerfectDayRecord,
  PERFECT_DAY_REWARDS,
} from "../data/perfectDay";
import { determinePerfectDayUIState } from "../lib/perfectDayData";

interface PerfectDayCardProps {
  record: PerfectDayRecord | null;
  directive: DailyDirective | null;
  className?: string;
}

export const PerfectDayCard: React.FC<PerfectDayCardProps> = ({
  record,
  directive,
  className = "",
}) => {
  const uiState = determinePerfectDayUIState(record, directive);

  const isAchieved = uiState === "achieved";
  const isInProgress = uiState === "in_progress";
  const isMissed = uiState === "missed";
  const isNotStarted = uiState === "not_started";

  const targetValue = directive?.targetValue ?? 1;
  const currentValue = directive ? Math.min(targetValue, directive.currentValue) : 0;
  const progressPct = Math.min(100, Math.round((currentValue / targetValue) * 100));

  const isDirectiveComplete = Boolean(directive?.completed);
  const isRewardProcessed = Boolean(directive?.rewardClaimed);

  return (
    <div
      className={`panel-box perfect-day-card ${className}`}
      style={{
        border: isAchieved
          ? "1px solid #ffd700"
          : isMissed
          ? "1px solid rgba(230, 57, 70, 0.4)"
          : "1px solid rgba(201, 168, 118, 0.35)",
        background: isAchieved
          ? "linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(30, 24, 12, 0.85) 100%)"
          : isMissed
          ? "linear-gradient(135deg, rgba(230, 57, 70, 0.08) 0%, rgba(20, 15, 17, 0.8) 100%)"
          : "linear-gradient(135deg, rgba(24, 28, 36, 0.8) 0%, rgba(14, 16, 22, 0.95) 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Award size={19} color={isAchieved ? "#ffd700" : "#c9a876"} />
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: isAchieved ? "#ffd700" : "#c9a876",
            }}
          >
            {isAchieved ? "✦ PERFECT DAY ✦" : "PERFECT DAY SYSTEM"}
          </span>
        </div>

        <div>
          {isAchieved && (
            <span
              className="value-badge"
              style={{
                borderColor: "#ffd700",
                color: "#ffd700",
                background: "rgba(255, 215, 0, 0.1)",
                fontSize: "0.74rem",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 10px",
              }}
            >
              <CheckCircle2 size={13} />
              PERFECT DAY ACHIEVED
            </span>
          )}

          {isInProgress && (
            <span
              className="value-badge"
              style={{
                borderColor: "#06b6d4",
                color: "#06b6d4",
                background: "rgba(6, 182, 212, 0.08)",
                fontSize: "0.74rem",
                fontWeight: 700,
                padding: "3px 10px",
              }}
            >
              IN PROGRESS
            </span>
          )}

          {isNotStarted && (
            <span
              className="value-badge"
              style={{
                borderColor: "rgba(201, 168, 118, 0.4)",
                color: "#c9a876",
                fontSize: "0.74rem",
                fontWeight: 600,
                padding: "3px 10px",
              }}
            >
              NOT STARTED
            </span>
          )}

          {isMissed && (
            <span
              className="value-badge"
              style={{
                borderColor: "rgba(230, 57, 70, 0.5)",
                color: "#e63946",
                fontSize: "0.74rem",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "3px 10px",
              }}
            >
              <AlertCircle size={13} />
              MISSED / EXPIRED
            </span>
          )}
        </div>
      </div>

      {/* Achieved State View */}
      {isAchieved ? (
        <div style={{ padding: "4px 0" }}>
          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#ffd700",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              DAY COMPLETE
            </div>
            <p style={{ fontSize: "0.85rem", color: "#d1c4b2", margin: "4px 0 0 0" }}>
              All authoritative daily objectives and directives have been fulfilled for today.
            </p>
          </div>

          {/* Reward Badges */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "10px",
              background: "rgba(0, 0, 0, 0.35)",
              padding: "10px 14px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 215, 0, 0.25)",
            }}
          >
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ffd700", letterSpacing: "0.05em" }}>
              BONUS REWARD:
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                color: "#06b6d4",
                fontSize: "0.84rem",
                fontWeight: 700,
              }}
            >
              <Sparkles size={14} /> +{record?.rewardXP ?? PERFECT_DAY_REWARDS.xp} XP
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                color: "#eab308",
                fontSize: "0.84rem",
                fontWeight: 700,
              }}
            >
              <Coins size={14} /> +{record?.rewardCoins ?? PERFECT_DAY_REWARDS.coins} COINS
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.72rem",
                color: "#8a6b70",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              [CLAIMED]
            </span>
          </div>
        </div>
      ) : isMissed ? (
        /* Missed View */
        <div style={{ padding: "4px 0" }}>
          <p style={{ fontSize: "0.86rem", color: "#a89094", margin: 0 }}>
            Yesterday&apos;s daily objectives expired without completion. A fresh Daily Directive has been assigned for today.
          </p>
        </div>
      ) : (
        /* In Progress or Not Started View */
        <div>
          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "0.74rem",
                fontWeight: 700,
                color: "#8a6b70",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              ◇ DAILY OBJECTIVES ◇
            </div>

            {/* Directive Progress Bar */}
            <div style={{ marginBottom: "8px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.82rem",
                  color: "#f2e9e9",
                  marginBottom: "4px",
                }}
              >
                <span>
                  {directive ? directive.title : "Today's Daily Directive"}
                </span>
                <strong style={{ color: isDirectiveComplete ? "#ffd700" : "#c9a876" }}>
                  {currentValue} / {targetValue}
                </strong>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "rgba(0, 0, 0, 0.4)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  border: "1px solid rgba(201, 168, 118, 0.2)",
                }}
              >
                <motion.div
                  style={{
                    height: "100%",
                    background: isDirectiveComplete
                      ? "linear-gradient(90deg, #ffd700, #f59e0b)"
                      : "linear-gradient(90deg, #c9a876, #e63946)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            {/* Requirement Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "10px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "0.8rem",
                  color: isDirectiveComplete ? "#22c55e" : "#8a6b70",
                }}
              >
                {isDirectiveComplete ? <CheckCircle2 size={13} color="#22c55e" /> : <Circle size={13} />}
                <span>Complete required daily directive quests ({currentValue}/{targetValue})</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "0.8rem",
                  color: isRewardProcessed ? "#22c55e" : "#8a6b70",
                }}
              >
                {isRewardProcessed ? <CheckCircle2 size={13} color="#22c55e" /> : <Circle size={13} />}
                <span>Claim directive rewards &amp; achieve Perfect Day</span>
              </div>
            </div>
          </div>

          {/* Potential Reward Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(0, 0, 0, 0.3)",
              padding: "8px 12px",
              borderRadius: "5px",
              border: "1px solid rgba(201, 168, 118, 0.15)",
            }}
          >
            <span style={{ fontSize: "0.72rem", color: "#8a6b70", fontWeight: 700, letterSpacing: "0.05em" }}>
              PERFECT DAY BONUS:
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  color: "#06b6d4",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                <Sparkles size={13} /> +{PERFECT_DAY_REWARDS.xp} XP
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  color: "#eab308",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                <Coins size={13} /> +{PERFECT_DAY_REWARDS.coins} COINS
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfectDayCard;

