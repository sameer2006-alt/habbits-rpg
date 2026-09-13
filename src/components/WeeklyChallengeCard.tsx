import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Clock,
  CheckCircle2,
  Sparkles,
  Coins,
  Gift,
  Zap,
} from "lucide-react";
import type { WeeklyChallenge } from "../data/weeklyChallenges";
import { determineWeeklyChallengeUIState } from "../lib/weeklyChallengesData";
import { getItemById } from "../data/items";

interface WeeklyChallengeCardProps {
  challenge: WeeklyChallenge | null;
  className?: string;
}

export const WeeklyChallengeCard: React.FC<WeeklyChallengeCardProps> = ({
  challenge,
  className = "",
}) => {
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");

  useEffect(() => {
    if (!challenge) return;

    const updateCountdown = () => {
      const [endY, endM, endD] = challenge.weekEnd.split("-").map(Number);
      const weekEndDate = new Date(endY, endM - 1, endD, 23, 59, 59, 999);
      const diffMs = weekEndDate.getTime() - Date.now();

      if (diffMs <= 0) {
        setTimeLeftStr("WEEK ENDED");
        return;
      }

      const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

      if (days > 0) {
        setTimeLeftStr(`${days}D ${hours}H REMAINING`);
      } else {
        setTimeLeftStr(`${hours}H ${minutes}M REMAINING`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [challenge]);

  const uiState = useMemo(() => {
    return determineWeeklyChallengeUIState(challenge);
  }, [challenge]);

  const rewardItem = useMemo(() => {
    return challenge?.rewardItemId ? getItemById(challenge.rewardItemId) : null;
  }, [challenge]);

  if (!challenge) return null;

  const isCompleted = challenge.completed;
  const isExpired = uiState === "expired";

  const borderColor = isCompleted
    ? "#38bdf8"
    : isExpired
    ? "#ef4444"
    : "rgba(56, 189, 248, 0.35)";

  const bgGradient = isCompleted
    ? "linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(10, 20, 35, 0.8) 100%)"
    : isExpired
    ? "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(20, 10, 10, 0.8) 100%)"
    : "linear-gradient(135deg, rgba(16, 24, 39, 0.7) 0%, rgba(10, 15, 26, 0.85) 100%)";

  return (
    <div
      className={`panel-box weekly-challenge-card ${className}`}
      style={{
        border: `1px solid ${borderColor}`,
        background: bgGradient,
        position: "relative",
        overflow: "hidden",
        boxShadow: isCompleted ? "0 0 20px rgba(56, 189, 248, 0.2)" : "none",
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
          <Trophy size={18} color={isCompleted ? "#38bdf8" : "#93c5fd"} />
          <span
            style={{
              fontSize: "0.76rem",
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: isCompleted ? "#38bdf8" : "#93c5fd",
            }}
          >
            WEEKLY HUNTER PROTOCOL
          </span>
        </div>

        {/* Countdown pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "0.72rem",
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: "4px",
            background: isExpired ? "rgba(239, 68, 68, 0.2)" : "rgba(56, 189, 248, 0.15)",
            color: isExpired ? "#ef4444" : "#38bdf8",
            border: `1px solid ${isExpired ? "rgba(239, 68, 68, 0.4)" : "rgba(56, 189, 248, 0.3)"}`,
          }}
        >
          <Clock size={12} />
          <span>{timeLeftStr}</span>
        </div>
      </div>

      {/* Challenge Title & Description */}
      <div style={{ marginBottom: "14px" }}>
        <h3
          style={{
            margin: "0 0 4px 0",
            fontSize: "1.05rem",
            fontWeight: 800,
            color: "#f8fafc",
            letterSpacing: "0.02em",
          }}
        >
          {challenge.title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "0.82rem",
            color: "#94a3b8",
            lineHeight: 1.4,
          }}
        >
          {challenge.description}
        </p>
      </div>

      {/* Multi-Objectives List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
        {challenge.objectives.map((obj) => {
          const pct = obj.targetValue > 0
            ? Math.min(100, Math.round((obj.currentValue / obj.targetValue) * 100))
            : 100;
          const isObjDone = obj.completed;

          return (
            <div
              key={obj.id}
              style={{
                background: "rgba(15, 23, 42, 0.5)",
                padding: "8px 12px",
                borderRadius: "6px",
                border: isObjDone ? "1px solid rgba(56, 189, 248, 0.4)" : "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "5px",
                  fontSize: "0.78rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {isObjDone ? (
                    <CheckCircle2 size={14} color="#38bdf8" />
                  ) : (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#64748b",
                      }}
                    />
                  )}
                  <span style={{ color: isObjDone ? "#f1f5f9" : "#cbd5e1", fontWeight: 600 }}>
                    {obj.description}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: isObjDone ? "#38bdf8" : "#94a3b8",
                  }}
                >
                  {obj.currentValue} / {obj.targetValue}
                </span>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: "100%",
                  height: "5px",
                  background: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  style={{
                    height: "100%",
                    background: isObjDone
                      ? "linear-gradient(90deg, #38bdf8, #818cf8)"
                      : "linear-gradient(90deg, #0284c7, #38bdf8)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer: Rewards and Status Badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "12px",
          borderTop: "1px solid rgba(255, 255, 255, 0.07)",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {/* Reward Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
            Bounty:
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 7px",
              borderRadius: "4px",
              background: "rgba(34, 197, 94, 0.12)",
              color: "#22c55e",
              fontSize: "0.75rem",
              fontWeight: 700,
              border: "1px solid rgba(34, 197, 94, 0.25)",
            }}
          >
            <Sparkles size={12} />
            <span>+{challenge.rewardXP} XP</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 7px",
              borderRadius: "4px",
              background: "rgba(250, 204, 21, 0.12)",
              color: "#facc15",
              fontSize: "0.75rem",
              fontWeight: 700,
              border: "1px solid rgba(250, 204, 21, 0.25)",
            }}
          >
            <Coins size={12} />
            <span>+{challenge.rewardCoins}</span>
          </div>

          {rewardItem && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "3px 7px",
                borderRadius: "4px",
                background: "rgba(168, 85, 247, 0.12)",
                color: "#c084fc",
                fontSize: "0.75rem",
                fontWeight: 700,
                border: "1px solid rgba(168, 85, 247, 0.25)",
              }}
              title={rewardItem.description}
            >
              <Gift size={12} />
              <span>{rewardItem.name}</span>
            </div>
          )}
        </div>

        {/* State Badge */}
        <div>
          {isCompleted ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "4px",
                background: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
                fontSize: "0.74rem",
                fontWeight: 800,
                letterSpacing: "0.05em",
                border: "1px solid rgba(56, 189, 248, 0.4)",
              }}
            >
              <CheckCircle2 size={13} />
              <span>✦ COMPLETE ✦</span>
            </div>
          ) : isExpired ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 10px",
                borderRadius: "4px",
                background: "rgba(239, 68, 68, 0.15)",
                color: "#ef4444",
                fontSize: "0.74rem",
                fontWeight: 800,
                letterSpacing: "0.05em",
                border: "1px solid rgba(239, 68, 68, 0.4)",
              }}
            >
              <span>EXPIRED</span>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 10px",
                borderRadius: "4px",
                background: "rgba(148, 163, 184, 0.1)",
                color: "#94a3b8",
                fontSize: "0.74rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              }}
            >
              <Zap size={12} color="#38bdf8" />
              <span>IN PROGRESS ({challenge.currentProgress}%)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
