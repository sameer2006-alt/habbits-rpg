import type { MonthlyChallenge } from "../data/monthlyChallenges";
import { getCurrentMonthRange, determineMonthlyChallengeUIState } from "../lib/monthlyChallengesData";
import { Calendar, Gift, CheckCircle2, AlertTriangle, Zap } from "lucide-react";

interface MonthlyChallengeCardProps {
  challenge: MonthlyChallenge | null;
}

export default function MonthlyChallengeCard({ challenge }: MonthlyChallengeCardProps) {
  const { monthLabel, daysRemaining } = getCurrentMonthRange();
  const status = determineMonthlyChallengeUIState(challenge);

  if (!challenge) {
    return (
      <div className="panel-box" style={{ padding: "16px", borderColor: "rgba(138, 107, 112, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8a6b70" }}>
          <Calendar size={18} />
          <span>Synchronizing Monthly Sector Challenge...</span>
        </div>
      </div>
    );
  }

  const isCompleted = challenge.completed;
  const isExpired = status === "expired";

  return (
    <div
      className="panel-box"
      style={{
        padding: "16px 18px",
        borderColor: isCompleted
          ? "rgba(46, 204, 113, 0.55)"
          : isExpired
          ? "rgba(230, 57, 70, 0.45)"
          : "rgba(168, 85, 247, 0.45)",
        background: isCompleted
          ? "linear-gradient(135deg, rgba(46, 204, 113, 0.08) 0%, rgba(13, 17, 23, 0.95) 100%)"
          : "linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(13, 17, 23, 0.95) 100%)",
        boxShadow: isCompleted
          ? "0 0 16px rgba(46, 204, 113, 0.15)"
          : "0 0 16px rgba(168, 85, 247, 0.12)",
        position: "relative",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Calendar size={18} style={{ color: isCompleted ? "#2ecc71" : "#c084fc" }} />
          <div>
            <div style={{ fontSize: "0.75rem", color: "#8a6b70", letterSpacing: "1px", textTransform: "uppercase" }}>
              MONTHLY APEX CAMPAIGN // {monthLabel}
            </div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#f2e9e9", letterSpacing: "0.5px" }}>
              {challenge.title}
            </h3>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: "0.72rem",
              padding: "3px 8px",
              borderRadius: "4px",
              border: `1px solid ${isCompleted ? "rgba(46, 204, 113, 0.6)" : isExpired ? "rgba(230, 57, 70, 0.6)" : "rgba(168, 85, 247, 0.5)"}`,
              color: isCompleted ? "#2ecc71" : isExpired ? "#e63946" : "#c084fc",
              background: "rgba(0,0,0,0.4)",
              fontWeight: "bold",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 size={12} /> CAMPAIGN ACCOMPLISHED
              </>
            ) : isExpired ? (
              <>
                <AlertTriangle size={12} /> CAMPAIGN EXPIRED
              </>
            ) : (
              <>
                <Zap size={12} /> {daysRemaining} DAYS REMAINING
              </>
            )}
          </span>
        </div>
      </div>

      <p style={{ margin: "0 0 14px", color: "#b8a090", fontSize: "0.85rem", lineHeight: 1.4 }}>
        {challenge.description}
      </p>

      {/* Objectives */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {challenge.objectives.map((obj) => {
          const ratio = Math.min(1, Math.max(0, obj.currentValue / obj.targetValue));
          const pct = Math.round(ratio * 100);

          return (
            <div key={obj.id} style={{ background: "rgba(0,0,0,0.3)", padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(138, 107, 112, 0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: 5 }}>
                <span style={{ color: obj.completed ? "#2ecc71" : "#f2e9e9", fontWeight: obj.completed ? "bold" : "normal" }}>
                  {obj.completed ? "✓ " : "○ "} {obj.description}
                </span>
                <span style={{ color: obj.completed ? "#2ecc71" : "#c9a876", fontWeight: "bold" }}>
                  {obj.currentValue.toLocaleString()} / {obj.targetValue.toLocaleString()} ({pct}%)
                </span>
              </div>
              <div style={{ height: "6px", width: "100%", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: obj.completed ? "#2ecc71" : "linear-gradient(90deg, #a855f7, #c084fc)",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Reward Loot */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, paddingTop: 10, borderTop: "1px solid rgba(138, 107, 112, 0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "#8a6b70" }}>
          <Gift size={14} style={{ color: "#ffd700" }} />
          <span>CAMPAIGN REWARD:</span>
          <span style={{ color: "#48cae4", fontWeight: "bold" }}>+{challenge.rewardXP} XP</span>
          <span style={{ color: "#ffd700", fontWeight: "bold" }}>+{challenge.rewardCoins} COINS</span>
          {challenge.rewardItemId && (
            <span style={{ color: "#c084fc", fontWeight: "bold", background: "rgba(192, 132, 252, 0.15)", padding: "1px 6px", borderRadius: "3px", border: "1px solid rgba(192, 132, 252, 0.4)" }}>
              🎁 EPIC GEAR
            </span>
          )}
        </div>

        {challenge.rewardClaimed && (
          <span style={{ fontSize: "0.75rem", color: "#2ecc71", fontWeight: "bold" }}>
            [REWARDS DEPOSITED TO ARMORY]
          </span>
        )}
      </div>
    </div>
  );
}
