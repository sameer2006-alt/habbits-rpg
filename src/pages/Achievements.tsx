import { useState } from "react";
import { motion } from "framer-motion";
import type { Achievement, AchievementTier } from "../types/game";
import AchievementIconSvg from "../components/icons/AchievementIcons";

interface AchievementsProps {
  achievements: Achievement[];
}

type FilterTab = "all" | "unlocked" | "locked" | AchievementTier;

const TIER_CONFIG: Record<AchievementTier, { label: string; color: string; glow: string }> = {
  BRONZE: { label: "Bronze", color: "#cd7f32", glow: "rgba(205, 127, 50, 0.25)" },
  SILVER: { label: "Silver", color: "#c0c0c0", glow: "rgba(192, 192, 192, 0.25)" },
  GOLD: { label: "Gold", color: "#ffd700", glow: "rgba(255, 215, 0, 0.25)" },
  PLATINUM: { label: "Platinum", color: "#a855f7", glow: "rgba(168, 85, 247, 0.3)" },
  LEGENDARY: { label: "Legendary", color: "#e63946", glow: "rgba(230, 57, 70, 0.35)" },
};

const TIER_ORDER: AchievementTier[] = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "LEGENDARY"];

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unlocked", label: "Unlocked" },
  { key: "locked", label: "Locked" },
];

export default function Achievements({ achievements }: AchievementsProps) {
  const [filter, setFilter] = useState<FilterTab>("all");

  // Ensure unique achievements by ID
  const uniqueAchievements = Array.from(
    new Map(achievements.map((a) => [a.id, a])).values()
  );

  const unlockedCount = uniqueAchievements.filter((a) => a.unlocked).length;
  const progressPct =
    uniqueAchievements.length > 0
      ? Math.round((unlockedCount / uniqueAchievements.length) * 100)
      : 0;

  const filtered = uniqueAchievements.filter((a) => {
    if (filter === "unlocked") return a.unlocked;
    if (filter === "locked") return !a.unlocked;
    if (TIER_ORDER.includes(filter as AchievementTier)) return a.tier === filter;
    return true;
  });

  // Group by tier for display
  const grouped = TIER_ORDER.map((tier) => ({
    tier,
    config: TIER_CONFIG[tier],
    items: filtered.filter((a) => a.tier === tier),
  })).filter((g) => g.items.length > 0);

  return (
    <main>
      <div className="system-header">
        <h1>Achievements</h1>
        <div className="inline-meta">
          <span className="mono-value">
            {unlockedCount} / {uniqueAchievements.length}
          </span>
        </div>
      </div>

      {/* Overall progress */}
      <div className="ach-progress-shell">
        <div className="quest-progress-header">
          <span className="card-title">Achievement Progress</span>
          <span className="mono-value">{progressPct}%</span>
        </div>
        <div className="quest-progress-track">
          <motion.div
            className="ach-progress-bar"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="quest-progress-counts">
          <span>{unlockedCount} of {uniqueAchievements.length} achievements unlocked</span>
        </div>
      </div>

      {/* Tier legend */}
      <div className="ach-tier-legend">
        {TIER_ORDER.map((tier) => {
          const cfg = TIER_CONFIG[tier];
          const count = uniqueAchievements.filter((a) => a.tier === tier).length;
          const unlocked = uniqueAchievements.filter((a) => a.tier === tier && a.unlocked).length;
          return (
            <button
              key={tier}
              type="button"
              className={`ach-tier-pill ${filter === tier ? "ach-tier-pill-active" : ""}`}
              style={{ "--tier-color": cfg.color } as React.CSSProperties}
              onClick={() => setFilter(filter === tier ? "all" : tier)}
            >
              <span className="ach-tier-dot" style={{ background: cfg.color }} />
              {cfg.label}
              <span className="filter-tab-count">{unlocked}/{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`filter-tab ${filter === tab.key ? "filter-tab-active" : ""}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Achievement cards grouped by tier */}
      {grouped.map(({ tier, config, items }) => (
        <div key={tier} className="ach-tier-group">
          <div className="ach-tier-header" style={{ color: config.color }}>
            <span className="ach-tier-dot" style={{ background: config.color }} />
            {config.label} Tier
            <span className="ach-tier-count">
              {items.filter((a) => a.unlocked).length}/{items.length}
            </span>
          </div>

          <div className="ach-grid">
            {items.map((achievement) => {
              const cfg = TIER_CONFIG[achievement.tier];
              const unlocked = achievement.unlocked;

              return (
                <motion.div
                  key={achievement.id}
                  className={`ach-card ${unlocked ? "ach-card-unlocked" : "ach-card-locked"}`}
                  style={{
                    "--tier-color": cfg.color,
                    "--tier-glow": cfg.glow,
                  } as React.CSSProperties}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="ach-card-icon" style={{ color: unlocked ? cfg.color : "#3a1319" }}>
                    <AchievementIconSvg icon={achievement.icon} size={28} color={unlocked ? cfg.color : "#3a1319"} />
                  </div>

                  <div className="ach-card-info">
                    <div className="ach-card-title">{achievement.title}</div>
                    <div className="ach-card-desc">{achievement.description}</div>
                  </div>

                  <div className="ach-card-badge" style={{ borderColor: unlocked ? cfg.color : "#3a1319", color: unlocked ? cfg.color : "#3a1319" }}>
                    {unlocked ? "✦" : "🔒"}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="panel-box" style={{ marginTop: 18 }}>
          <div className="card-title">No achievements found</div>
          <p style={{ marginTop: 10 }}>Try changing the filter.</p>
        </div>
      )}
    </main>
  );
}
