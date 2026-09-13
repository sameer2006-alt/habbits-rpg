import React from "react";
import { motion } from "framer-motion";
import { Zap, Clock, Sparkles, Coins } from "lucide-react";
import type { RandomEventInstance } from "../data/randomEvents";

interface RandomEventCardProps {
  event: RandomEventInstance | null;
  className?: string;
}

export const RandomEventCard: React.FC<RandomEventCardProps> = ({ event, className = "" }) => {
  const [mountedAt] = React.useState(() => Date.now());

  const diffHours = React.useMemo(() => {
    if (!event) return 0;
    const expiry = new Date(event.expiryTime).getTime();
    return Math.max(0, Math.round((expiry - mountedAt) / (1000 * 60 * 60)));
  }, [event, mountedAt]);

  if (!event) return null;

  const isCompleted = event.completed;
  const progressPct = Math.min(100, Math.round((event.currentValue / Math.max(1, event.targetValue)) * 100));

  return (
    <div
      className={`panel-box random-event-card ${className}`}
      style={{
        border: isCompleted ? "1px solid #22c55e" : "1px solid rgba(245, 158, 11, 0.4)",
        background: isCompleted
          ? "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(15, 25, 18, 0.85) 100%)"
          : "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(25, 20, 12, 0.85) 100%)",
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
          <Zap size={17} color={isCompleted ? "#22c55e" : "#f59e0b"} />
          <span
            style={{
              fontSize: "0.76rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: isCompleted ? "#22c55e" : "#f59e0b",
            }}
          >
            {isCompleted ? "EVENT ACCOMPLISHED" : "SYSTEM RANDOM EVENT"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {!isCompleted && (
            <span
              style={{
                fontSize: "0.72rem",
                color: "#8a6b70",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <Clock size={12} /> {diffHours}h left
            </span>
          )}
          <span
            className="value-badge"
            style={{
              borderColor: isCompleted ? "#22c55e" : "rgba(245, 158, 11, 0.5)",
              color: isCompleted ? "#22c55e" : "#f59e0b",
              fontSize: "0.72rem",
              padding: "2px 8px",
            }}
          >
            {isCompleted ? "CLAIMED" : "ACTIVE"}
          </span>
        </div>
      </div>

      {/* Title & Description */}
      <div style={{ marginBottom: "12px" }}>
        <h4 style={{ margin: "0 0 4px 0", fontSize: "0.95rem", color: "#f2e9e9" }}>
          {event.title}
        </h4>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "#a89094" }}>
          {event.description}
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.78rem",
            color: "#d1c4b2",
            marginBottom: "4px",
          }}
        >
          <span>Progress</span>
          <strong>{event.currentValue} / {event.targetValue}</strong>
        </div>
        <div
          style={{
            height: "7px",
            background: "rgba(0, 0, 0, 0.4)",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid rgba(245, 158, 11, 0.2)",
          }}
        >
          <motion.div
            style={{
              height: "100%",
              background: isCompleted
                ? "linear-gradient(90deg, #22c55e, #4ade80)"
                : "linear-gradient(90deg, #f59e0b, #e63946)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Rewards Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "0.78rem",
          fontWeight: 700,
          background: "rgba(0,0,0,0.3)",
          padding: "6px 10px",
          borderRadius: "4px",
        }}
      >
        <span style={{ fontSize: "0.7rem", color: "#8a6b70", letterSpacing: "0.05em" }}>REWARD:</span>
        <span style={{ color: "#06b6d4", display: "inline-flex", alignItems: "center", gap: "3px" }}>
          <Sparkles size={12} /> +{event.rewardXP} XP
        </span>
        <span style={{ color: "#eab308", display: "inline-flex", alignItems: "center", gap: "3px" }}>
          <Coins size={12} /> +{event.rewardCoins} COINS
        </span>
        {event.rewardStat && (
          <span style={{ color: "#c9a876" }}>
            +{event.rewardStatAmount || 1} {event.rewardStat.toUpperCase().slice(0, 3)}
          </span>
        )}
      </div>
    </div>
  );
};

export default RandomEventCard;
