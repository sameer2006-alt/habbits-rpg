import React from "react";
import { motion } from "framer-motion";
import { Compass, CheckCircle2, Sparkles, Coins } from "lucide-react";
import type { DailyDirective } from "../data/dailyDirectives";
import { StatIcon } from "./icons/StatIcons";

interface DailyDirectiveCardProps {
  directive: DailyDirective | null;
  className?: string;
  onClaimReward?: () => void;
}

export const DailyDirectiveCard: React.FC<DailyDirectiveCardProps> = ({
  directive,
  className = "",
}) => {
  if (!directive) return null;

  const progressPct = Math.min(
    100,
    Math.round((directive.currentValue / Math.max(1, directive.targetValue)) * 100)
  );

  const isCompleted = directive.completed;

  return (
    <div
      className={`panel-box daily-directive-card ${className}`}
      style={{
        border: isCompleted ? "1px solid #ffd700" : "1px solid rgba(201, 168, 118, 0.3)",
        background: isCompleted
          ? "linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(20, 16, 10, 0.7) 100%)"
          : "linear-gradient(135deg, rgba(30, 35, 45, 0.6) 0%, rgba(15, 17, 23, 0.8) 100%)",
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
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Compass size={18} color={isCompleted ? "#ffd700" : "#c9a876"} />
          <span
            style={{
              fontSize: "0.76rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: isCompleted ? "#ffd700" : "#c9a876",
            }}
          >
            SYSTEM DAILY DIRECTIVE
          </span>
        </div>

        <div>
          {isCompleted ? (
            <span
              className="value-badge"
              style={{
                borderColor: "#ffd700",
                color: "#ffd700",
                fontSize: "0.75rem",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 8px",
              }}
            >
              <CheckCircle2 size={13} />
              ACCOMPLISHED
            </span>
          ) : (
            <span
              className="value-badge"
              style={{
                borderColor: "rgba(201, 168, 118, 0.4)",
                color: "#f2e9e9",
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "2px 8px",
              }}
            >
              IN PROGRESS
            </span>
          )}
        </div>
      </div>

      {/* Directive Title & Description */}
      <div style={{ marginBottom: "14px" }}>
        <h3
          style={{
            margin: "0 0 4px 0",
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "#f2e9e9",
            letterSpacing: "0.02em",
          }}
        >
          {directive.title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "0.85rem",
            color: "rgba(242, 233, 233, 0.75)",
            lineHeight: 1.4,
          }}
        >
          {directive.description}
        </p>
      </div>

      {/* Progress Track */}
      <div style={{ marginBottom: "14px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.8rem",
            marginBottom: "6px",
            color: "rgba(242, 233, 233, 0.8)",
          }}
        >
          <span>Progress</span>
          <span style={{ fontWeight: 700, color: isCompleted ? "#ffd700" : "#f2e9e9" }}>
            {directive.currentValue} / {directive.targetValue}
          </span>
        </div>
        <div className="quest-progress-track" style={{ height: "6px" }}>
          <motion.div
            className="quest-progress-bar"
            style={{
              background: isCompleted
                ? "linear-gradient(90deg, #ffd700, #ffae00)"
                : "linear-gradient(90deg, #3b82f6, #60a5fa)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Directive Rewards Display */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "10px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          fontSize: "0.82rem",
        }}
      >
        <span style={{ color: "rgba(242, 233, 233, 0.6)", fontSize: "0.78rem" }}>
          Target Directive Reward:
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              color: "#60a5fa",
              fontWeight: 700,
            }}
          >
            <Sparkles size={13} />
            +{directive.rewardXP} XP
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              color: "#ffd700",
              fontWeight: 700,
            }}
          >
            <Coins size={13} />
            +{directive.rewardCoins}
          </span>

          {directive.rewardStat && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                color: "#a78bfa",
                fontWeight: 700,
              }}
            >
              <StatIcon stat={directive.rewardStat} size={13} color="#a78bfa" />
              +{directive.rewardStatAmount || 1} {directive.rewardStat.toUpperCase().slice(0, 3)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyDirectiveCard;