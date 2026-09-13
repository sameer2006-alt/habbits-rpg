import { useState } from "react";
import type { PlayerSeason, SeasonMilestone } from "../data/seasons";
import { getCurrentSeasonWindow, claimSeasonMilestone } from "../lib/seasonsData";
import { Trophy, CheckCircle2, Clock } from "lucide-react";

interface SeasonProgressCardProps {
  playerSeason: PlayerSeason | null;
  onClaimMilestone?: (milestone: SeasonMilestone, reward: { xp: number; coins: number; itemId?: string; titleId?: string }) => void;
}

export default function SeasonProgressCard({ playerSeason, onClaimMilestone }: SeasonProgressCardProps) {
  const season = getCurrentSeasonWindow();
  const [claimingLvl, setClaimingLvl] = useState<number | null>(null);

  if (!playerSeason) return null;

  const currentLevel = playerSeason.seasonLevel;
  const currentXP = playerSeason.seasonXP;

  const handleClaim = async (m: SeasonMilestone) => {
    if (claimingLvl !== null) return;
    setClaimingLvl(m.level);
    try {
      const res = await claimSeasonMilestone(playerSeason.userId, m.level);
      if (res.success && res.reward && onClaimMilestone) {
        onClaimMilestone(m, res.reward);
      }
    } finally {
      setClaimingLvl(null);
    }
  };

  return (
    <div
      className="panel-box"
      style={{
        padding: "16px 18px",
        borderColor: "rgba(255, 215, 0, 0.45)",
        background: "linear-gradient(135deg, rgba(255, 215, 0, 0.07) 0%, rgba(13, 17, 23, 0.95) 100%)",
        boxShadow: "0 0 16px rgba(255, 215, 0, 0.12)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Trophy size={18} style={{ color: "#ffd700" }} />
          <div>
            <div style={{ fontSize: "0.75rem", color: "#8a6b70", letterSpacing: "1px", textTransform: "uppercase" }}>
              15-DAY SEASONAL TRIAL // {season.startDate} - {season.endDate}
            </div>
            <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#ffd700", letterSpacing: "0.5px" }}>
              {season.name}
            </h3>
          </div>
        </div>

        <span
          style={{
            fontSize: "0.72rem",
            padding: "3px 8px",
            borderRadius: "4px",
            border: "1px solid rgba(255, 215, 0, 0.5)",
            color: "#ffd700",
            background: "rgba(0,0,0,0.4)",
            fontWeight: "bold",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Clock size={12} /> {season.daysRemaining} DAYS REMAINING
        </span>
      </div>

      {/* Season Level & XP Bar */}
      <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: "6px", border: "1px solid rgba(138, 107, 112, 0.2)", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 6 }}>
          <span style={{ color: "#f2e9e9", fontWeight: "bold" }}>
            SEASON LEVEL {currentLevel} / 10
          </span>
          <span style={{ color: "#ffd700", fontWeight: "bold" }}>
            {currentXP.toLocaleString()} SEASON XP
          </span>
        </div>
        <div style={{ height: "7px", width: "100%", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, Math.round((currentLevel / 10) * 100))}%`,
              background: "linear-gradient(90deg, #ffd700, #ffaa00)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Milestones Track */}
      <div style={{ fontSize: "0.78rem", color: "#8a6b70", marginBottom: 8, letterSpacing: "0.5px", textTransform: "uppercase" }}>
        SEASON PROGRESSION MILESTONES:
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
        {season.milestones.map((m) => {
          const isReached = currentLevel >= m.level;
          const isClaimed = playerSeason.milestonesClaimed.includes(m.level);
          const canClaim = isReached && !isClaimed;

          return (
            <div
              key={m.level}
              style={{
                background: isClaimed
                  ? "rgba(46, 204, 113, 0.08)"
                  : canClaim
                  ? "rgba(255, 215, 0, 0.12)"
                  : "rgba(0,0,0,0.3)",
                border: `1px solid ${isClaimed ? "rgba(46, 204, 113, 0.5)" : canClaim ? "rgba(255, 215, 0, 0.6)" : "rgba(138, 107, 112, 0.2)"}`,
                padding: "8px 10px",
                borderRadius: "5px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: isClaimed ? "#2ecc71" : canClaim ? "#ffd700" : "#8a6b70" }}>
                  LVL {m.level}
                </span>
                {isClaimed && <CheckCircle2 size={12} style={{ color: "#2ecc71" }} />}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#b8a090", lineHeight: 1.2 }}>
                {m.rewardLabel}
              </div>
              {canClaim ? (
                <button
                  onClick={() => handleClaim(m)}
                  disabled={claimingLvl !== null}
                  style={{
                    background: "rgba(255, 215, 0, 0.25)",
                    border: "1px solid #ffd700",
                    color: "#ffd700",
                    padding: "3px 6px",
                    borderRadius: "3px",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    marginTop: 2,
                  }}
                >
                  {claimingLvl === m.level ? "CLAIMING..." : "CLAIM"}
                </button>
              ) : isClaimed ? (
                <span style={{ fontSize: "0.68rem", color: "#2ecc71", fontWeight: "bold" }}>
                  CLAIMED
                </span>
              ) : (
                <span style={{ fontSize: "0.68rem", color: "#8a6b70" }}>
                  LOCKED
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
