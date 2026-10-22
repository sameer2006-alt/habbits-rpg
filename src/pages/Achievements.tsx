import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import type { Achievement, AchievementTier, Player } from "../types/game";
import { ACHIEVEMENTS, type AchievementDef } from "../data/achievements";
import { getCachedEarnedPerfectDaysCount, getEarnedPerfectDaysCount } from "../lib/perfectDayData";
import AchievementIconSvg from "../components/icons/AchievementIcons";
import "./Achievements.css";

interface AchievementsProps {
  achievements: Achievement[];
  player?: Player | null;
  perfectDayCount?: number;
}

type FilterCategory =
  | "all"
  | "unlocked"
  | "locked"
  | "streaks"
  | "quests"
  | "ascension"
  | "vault"
  | "stats"
  | AchievementTier;

type SortOption = "tier" | "progress" | "recent" | "alpha";

const TIER_CONFIG: Record<
  AchievementTier,
  { label: string; color: string; glow: string; bonus: string }
> = {
  BRONZE: {
    label: "Bronze",
    color: "#cd7f32",
    glow: "rgba(205, 127, 50, 0.3)",
    bonus: "+100 XP • +50 COINS",
  },
  SILVER: {
    label: "Silver",
    color: "#c0c0c0",
    glow: "rgba(192, 192, 192, 0.3)",
    bonus: "+250 XP • +150 COINS",
  },
  GOLD: {
    label: "Gold",
    color: "#ffd700",
    glow: "rgba(255, 215, 0, 0.35)",
    bonus: "+500 XP • +300 COINS • TITLE",
  },
  PLATINUM: {
    label: "Platinum",
    color: "#a855f7",
    glow: "rgba(168, 85, 247, 0.4)",
    bonus: "+1,000 XP • +750 COINS • AURA",
  },
  LEGENDARY: {
    label: "Legendary",
    color: "#dc2626",
    glow: "rgba(220, 38, 38, 0.45)",
    bonus: "+2,500 XP • +2,000 COINS • 1.2X YIELD",
  },
};

const TIER_ORDER: AchievementTier[] = [
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "LEGENDARY",
];

const TIER_WEIGHT: Record<AchievementTier, number> = {
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
  LEGENDARY: 5,
};

export default function Achievements({
  achievements,
  player,
  perfectDayCount,
}: AchievementsProps) {
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [sortBy, setSortBy] = useState<SortOption>("tier");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [perfectDaysCount, setPerfectDaysCount] = useState<number>(() => {
    return player?.profile?.id ? getCachedEarnedPerfectDaysCount(player.profile.id) : 0;
  });

  useEffect(() => {
    if (typeof perfectDayCount === "number" || !player?.profile?.id) {
      return;
    }
    let isMounted = true;
    void getEarnedPerfectDaysCount(player.profile.id).then((count) => {
      if (isMounted) {
        setPerfectDaysCount(count);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [player?.profile?.id, perfectDayCount]);

  const resolvedPerfectDaysCount =
    typeof perfectDayCount === "number" ? perfectDayCount : perfectDaysCount;

  // Map of static definitions by ID
  const defMap = useMemo(
    () => new Map<string, AchievementDef>(ACHIEVEMENTS.map((d) => [d.id, d])),
    []
  );

  // Deduplicate incoming achievements
  const uniqueAchievements = useMemo(
    () => Array.from(new Map(achievements.map((a) => [a.id, a])).values()),
    [achievements]
  );

  // Read player completed quests count from storage or player if present
  const totalQuestsCompleted = useMemo(() => {
    if (!player?.profile?.id) return 0;
    const stored = localStorage.getItem(`total_quests_completed_${player.profile.id}`);
    return stored ? Number(stored) : 0;
  }, [player]);

  // Compute live progress and unit for an achievement
  const getProgressDetails = useMemo(() => {
    return (achievement: Achievement) => {
      const def = defMap.get(achievement.id);
      if (!def) {
        return {
          current: achievement.unlocked ? 1 : 0,
          target: 1,
          pct: achievement.unlocked ? 100 : 0,
          unit: "STEP",
          categoryTag: "FEAT",
        };
      }

      if (achievement.unlocked) {
        return {
          current: def.requirementValue,
          target: def.requirementValue,
          pct: 100,
          unit: getUnitLabel(def.requirementType),
          categoryTag: getCategoryTag(def.requirementType),
        };
      }

      let currentVal = 0;
      if (player) {
        switch (def.requirementType) {
          case "quests_completed":
            currentVal = totalQuestsCompleted;
            break;
          case "streak":
            currentVal = Math.max(
              player.progress.currentStreak || 0,
              player.progress.bestStreak || 0
            );
            break;
          case "level":
            currentVal = player.progress.level || 1;
            break;
          case "coins":
            currentVal = player.progress.coins || 0;
            break;
          case "stat_strength":
            currentVal = player.stats.strength || 0;
            break;
          case "stat_intelligence":
            currentVal = player.stats.intelligence || 0;
            break;
          case "stat_vitality":
            currentVal = player.stats.vitality || 0;
            break;
          case "stat_focus":
            currentVal = player.stats.focus || 0;
            break;
          case "stat_discipline":
            currentVal = player.stats.discipline || 0;
            break;
          case "stat_consistency":
            currentVal = player.stats.consistency || 0;
            break;
          case "perfect_day":
            currentVal = resolvedPerfectDaysCount;
            break;
          default:
            currentVal = 0;
        }
      }

      const clampedCurrent = Math.min(currentVal, def.requirementValue);
      const pct = Math.min(
        100,
        Math.max(0, Math.round((clampedCurrent / def.requirementValue) * 100))
      );

      return {
        current: clampedCurrent,
        target: def.requirementValue,
        pct,
        unit: getUnitLabel(def.requirementType),
        categoryTag: getCategoryTag(def.requirementType),
      };
    };
  }, [defMap, player, totalQuestsCompleted, resolvedPerfectDaysCount]);

  // Overall totals
  const totalCount = uniqueAchievements.length;
  const unlockedCount = uniqueAchievements.filter((a) => a.unlocked).length;
  const lockedCount = totalCount - unlockedCount;
  const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const habitYieldMultiplier = (1 + unlockedCount * 0.015).toFixed(2);

  // Highest feat ready / closest locked achievement
  const closestLocked = useMemo(() => {
    const lockedList = uniqueAchievements.filter((a) => !a.unlocked);
    if (lockedList.length === 0) return null;

    let best = lockedList[0];
    let bestPct = -1;

    for (const item of lockedList) {
      const { pct } = getProgressDetails(item);
      if (pct > bestPct) {
        bestPct = pct;
        best = item;
      }
    }
    return { achievement: best, details: getProgressDetails(best) };
  }, [uniqueAchievements, getProgressDetails]);

  // Next Milestones: Top closest locked achievements with meaningful progress
  const nextMilestones = useMemo(() => {
    const lockedList = uniqueAchievements.filter((a) => !a.unlocked);
    if (lockedList.length === 0) return [];

    const withProgress = lockedList.map((a) => {
      const details = getProgressDetails(a);
      const remaining = Math.max(0, details.target - details.current);
      return {
        achievement: a,
        details,
        remaining,
      };
    });

    // Sort by highest completion percentage first, then smallest remaining requirement
    withProgress.sort((a, b) => {
      if (b.details.pct !== a.details.pct) {
        return b.details.pct - a.details.pct;
      }
      return a.remaining - b.remaining;
    });

    return withProgress.slice(0, 3);
  }, [uniqueAchievements, getProgressDetails]);

  // Filtered list
  const filtered = useMemo(() => {
    return uniqueAchievements.filter((a) => {
      const def = defMap.get(a.id);
      if (filter === "unlocked") return a.unlocked;
      if (filter === "locked") return !a.unlocked;
      if (filter === "streaks") return def?.requirementType === "streak";
      if (filter === "quests") return def?.requirementType === "quests_completed";
      if (filter === "ascension")
        return def?.requirementType === "level" || a.tier === "LEGENDARY";
      if (filter === "vault") return def?.requirementType === "coins";
      if (filter === "stats") return def?.requirementType.startsWith("stat_");
      if (TIER_ORDER.includes(filter as AchievementTier)) return a.tier === filter;
      return true;
    });
  }, [uniqueAchievements, filter, defMap]);

  // Sorted list
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "tier") {
        const diff = (TIER_WEIGHT[b.tier] || 0) - (TIER_WEIGHT[a.tier] || 0);
        if (diff !== 0) return diff;
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "progress") {
        const pctA = getProgressDetails(a).pct;
        const pctB = getProgressDetails(b).pct;
        if (pctB !== pctA) return pctB - pctA;
        return (TIER_WEIGHT[b.tier] || 0) - (TIER_WEIGHT[a.tier] || 0);
      }
      if (sortBy === "recent") {
        if (a.unlocked && !b.unlocked) return -1;
        if (!a.unlocked && b.unlocked) return 1;
        return (b.unlockedAt || "").localeCompare(a.unlockedAt || "");
      }
      if (sortBy === "alpha") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [filtered, sortBy, getProgressDetails]);

  // Ensure an achievement is selected for the Inspector
  const selectedAchievement = useMemo(() => {
    if (selectedId) {
      const found = uniqueAchievements.find((a) => a.id === selectedId);
      if (found) return found;
    }
    return sorted[0] || uniqueAchievements[0] || null;
  }, [selectedId, uniqueAchievements, sorted]);

  const selectedDetails = selectedAchievement
    ? getProgressDetails(selectedAchievement)
    : null;
  const selectedConfig = selectedAchievement
    ? TIER_CONFIG[selectedAchievement.tier]
    : TIER_CONFIG.BRONZE;

  return (
    <main className="achievements-root">
      {/* Ambient background flares */}
      <div className="ach-ambient-flare-1" />
      <div className="ach-ambient-flare-2" />
      <div className="ach-ambient-flare-3" />

      <div className="ach-container">
        {/* 1. TOP PROTOCOL BREADCRUMB STRIP */}
        <div className="ach-breadcrumb-bar">
          <div className="ach-protocol-tag">
            <span className="ach-protocol-prefix">[ SYSTEM PROTOCOL</span>
            <span>//</span>
            <span>RECORD_INDEX 0xAC-99 ]</span>
          </div>
          <div className="ach-clearance-badge">
            <span className="ach-clearance-dot" />
            <span style={{ color: "var(--ach-tertiary)", fontWeight: 700 }}>
              CLEARANCE: HUNTER-RANK-{player?.progress?.rank || "E"}
            </span>
            <span style={{ color: "var(--ach-text-muted)", fontSize: "10px" }}>
              [AUTH-2025]
            </span>
          </div>
        </div>

        {/* 2. HEADER & TITLE LOCKUP */}
        <header className="ach-header-lockup">
          <div>
            <h1 className="ach-main-title">
              <span>ACHIEVEMENTS</span>
              <span className="ach-title-divider">//</span>
              <span className="ach-title-sub">TRIAL ARCHIVE</span>
            </h1>
            <p className="ach-subtitle-text">
              Prove what you have accomplished. Inscribe your discipline into the System
              Codex and unlock dormant combat multipliers.
            </p>
          </div>
          <div className="ach-sync-pill">
            <span style={{ fontSize: "1rem" }}>✦</span>
            <span>SYNC PROTOCOL: VERIFIED</span>
          </div>
        </header>

        {/* 3. 4-METRIC PROGRESSION TELEMETRY GRID */}
        <section className="ach-telemetry-grid" aria-label="Achievement Progression Metrics">
          {/* Card 1: Unlocked Archive */}
          <div className="ach-metric-card">
            <div className="ach-metric-top">
              <span>UNLOCKED ARCHIVE</span>
              <span style={{ color: "var(--ach-tertiary)" }}>🎖</span>
            </div>
            <div className="ach-metric-value-row">
              <span className="ach-metric-number">{unlockedCount}</span>
              <span className="ach-metric-label">/ {totalCount} ACHIEVED</span>
            </div>
            <span className="ach-metric-sub">
              {lockedCount} REMAIN IN DEEP SHADOW
            </span>
          </div>

          {/* Card 2: Completion Ratio */}
          <div className="ach-metric-card">
            <div className="ach-metric-top">
              <span>COMPLETION RATIO</span>
              <span style={{ color: "var(--ach-text-main)", fontWeight: 700 }}>
                {progressPct}%
              </span>
            </div>
            {/* Segmented Progress Track */}
            <div className="ach-segmented-track">
              {Array.from({ length: 24 }).map((_, i) => {
                const filledRatio = i / 24;
                const isFilled = filledRatio < progressPct / 100;
                const isTertiary = i >= 10 && i < 18;
                return (
                  <div
                    key={i}
                    className={`ach-segment ${
                      isFilled
                        ? isTertiary
                          ? "ach-segment-filled-tertiary"
                          : "ach-segment-filled-primary"
                        : ""
                    }`}
                  />
                );
              })}
            </div>
            <span className="ach-metric-sub">
              TIER BREAKPOINT: 15 REQUIRED FOR BONUS
            </span>
          </div>

          {/* Card 3: Multiplier */}
          <div className="ach-metric-card">
            <div className="ach-metric-top">
              <span>RECORD MULTIPLIER</span>
              <span style={{ color: "var(--ach-primary-container)" }}>⚡</span>
            </div>
            <div className="ach-metric-value-row">
              <span className="ach-metric-number" style={{ color: "var(--ach-primary)" }}>
                {habitYieldMultiplier}x
              </span>
              <span className="ach-metric-label" style={{ fontWeight: 600 }}>
                HABIT YIELD
              </span>
            </div>
            <span className="ach-metric-sub" style={{ color: "var(--ach-primary)" }}>
              ACTIVE IN SANCTUM ENGINE
            </span>
          </div>

          {/* Card 4: Feat Status / Closest Next Unlock */}
          <div className="ach-metric-card">
            <div className="ach-metric-top">
              <span>NEXT FEAT IN SIGHT</span>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--ach-primary-container)",
                  boxShadow: "0 0 8px var(--ach-primary-container)",
                }}
              />
            </div>
            <div className="ach-metric-value-row">
              <span
                className="ach-metric-number"
                style={{
                  fontSize: "1.15rem",
                  color: "var(--ach-text-main)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {closestLocked?.achievement.title || "ALL FEATS CONQUERED"}
              </span>
            </div>
            <span className="ach-metric-sub" style={{ color: "var(--ach-tertiary)" }}>
              {closestLocked
                ? `PROGRESS: ${closestLocked.details.current} / ${closestLocked.details.target} ${closestLocked.details.unit} (${closestLocked.details.pct}%)`
                : "SANCTUM MASTER REACHED"}
            </span>
          </div>
        </section>

        {/* 4. FILTER & SORT NAVIGATION BAR */}
        <section className="ach-filter-bar" aria-label="Filters and Sorting">
          <div className="ach-filters-left">
            <button
              type="button"
              className={`ach-filter-chip ${
                filter === "all" ? "ach-filter-chip-active" : ""
              }`}
              onClick={() => setFilter("all")}
            >
              <span>ALL</span>
              <span className="ach-chip-count">{totalCount}</span>
            </button>
            <button
              type="button"
              className={`ach-filter-chip ${
                filter === "unlocked" ? "ach-filter-chip-active" : ""
              }`}
              onClick={() => setFilter("unlocked")}
            >
              <span>UNLOCKED</span>
              <span className="ach-chip-count">{unlockedCount}</span>
            </button>
            <button
              type="button"
              className={`ach-filter-chip ${
                filter === "locked" ? "ach-filter-chip-active" : ""
              }`}
              onClick={() => setFilter("locked")}
            >
              <span>LOCKED</span>
              <span className="ach-chip-count">{lockedCount}</span>
            </button>

            <span className="ach-filter-divider" />

            <button
              type="button"
              className={`ach-filter-chip ${
                filter === "streaks" ? "ach-filter-chip-active" : ""
              }`}
              onClick={() => setFilter("streaks")}
            >
              <span>HABIT STREAKS</span>
            </button>
            <button
              type="button"
              className={`ach-filter-chip ${
                filter === "quests" ? "ach-filter-chip-active" : ""
              }`}
              onClick={() => setFilter("quests")}
            >
              <span>QUEST HUNTER</span>
            </button>
            <button
              type="button"
              className={`ach-filter-chip ${
                filter === "ascension" ? "ach-filter-chip-active" : ""
              }`}
              onClick={() => setFilter("ascension")}
            >
              <span>ASCENSION</span>
            </button>
            <button
              type="button"
              className={`ach-filter-chip ${
                filter === "vault" ? "ach-filter-chip-active" : ""
              }`}
              onClick={() => setFilter("vault")}
            >
              <span>SOUL VAULT</span>
            </button>
            <button
              type="button"
              className={`ach-filter-chip ${
                filter === "stats" ? "ach-filter-chip-active" : ""
              }`}
              onClick={() => setFilter("stats")}
            >
              <span>STAT MASTERY</span>
            </button>
          </div>

          <div className="ach-filters-right">
            <div className="ach-sort-wrapper">
              <select
                className="ach-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort achievements"
              >
                <option value="tier">SORT: SEVERITY TIER</option>
                <option value="progress">SORT: PROGRESS (HIGH-LOW)</option>
                <option value="recent">SORT: RECENTLY UNLOCKED</option>
                <option value="alpha">SORT: CHRONO / TITLE</option>
              </select>
              <span className="ach-sort-arrow">▼</span>
            </div>
          </div>
        </section>

        {/* 5. MAIN DUAL-COLUMN WIDESCREEN LAYOUT (8 cols left / 4 cols right) */}
        <div className="ach-main-layout">
          {/* LEFT COLUMN: ACHIEVEMENT CARDS GRID */}
          <div>
            <div className="ach-grid-header">
              <span>
                SANCTUM RECORD TILES • SHOWING {sorted.length} OF {totalCount} ARCHIVES
              </span>
              <span className="ach-telemetry-active">
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--ach-tertiary)",
                  }}
                />
                TELEMETRY SENSOR: ONLINE
              </span>
            </div>

            {sorted.length === 0 ? (
              <div
                style={{
                  background: "var(--ach-bg-surface)",
                  borderRadius: 12,
                  padding: "3rem 1.5rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  No Achievements Matched Filter
                </div>
                <p style={{ color: "var(--ach-text-muted)" }}>
                  Try selecting "ALL" or another category tab above.
                </p>
              </div>
            ) : (
              <div className="ach-cards-grid">
                {sorted.map((achievement) => {
                  const cfg = TIER_CONFIG[achievement.tier];
                  const details = getProgressDetails(achievement);
                  const isSelected = selectedAchievement?.id === achievement.id;

                  return (
                    <motion.div
                      key={achievement.id}
                      className={`ach-card ${
                        achievement.unlocked ? "ach-card-unlocked" : "ach-card-locked"
                      } ${isSelected ? "ach-card-selected" : ""}`}
                      style={
                        {
                          "--card-accent": cfg.color,
                          "--card-glow": cfg.glow,
                        } as React.CSSProperties
                      }
                      onClick={() => setSelectedId(achievement.id)}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.15 }}
                    >
                      {/* Corner bracket */}
                      <div className="ach-card-bracket" />

                      <div>
                        <div className="ach-card-head">
                          <div className="ach-card-icon-box">
                            <AchievementIconSvg
                              icon={achievement.icon}
                              size={22}
                              color={achievement.unlocked ? cfg.color : "var(--ach-text-muted)"}
                            />
                          </div>
                          <span
                            className={`ach-card-tag ${
                              achievement.unlocked ? "" : "ach-card-tag-locked"
                            }`}
                          >
                            {achievement.unlocked
                              ? `VERIFIED // ${cfg.label.toUpperCase()}`
                              : `LOCKED // ${details.categoryTag}`}
                          </span>
                        </div>

                        <h2 className="ach-card-title">{achievement.title}</h2>
                        <p className="ach-card-desc">{achievement.description}</p>
                      </div>

                      <div className="ach-card-footer">
                        <div className="ach-card-progress-labels">
                          <span
                            style={{
                              color: achievement.unlocked
                                ? "var(--ach-tertiary)"
                                : "var(--ach-text-muted)",
                            }}
                          >
                            {details.current} / {details.target} {details.unit}
                          </span>
                          <span
                            style={{
                              color: achievement.unlocked
                                ? "var(--ach-primary)"
                                : "var(--ach-text-muted)",
                            }}
                          >
                            {details.pct}%
                          </span>
                        </div>
                        <div className="ach-progress-track">
                          <div
                            className="ach-progress-bar-fill"
                            style={{
                              width: `${details.pct}%`,
                              background: achievement.unlocked
                                ? "var(--ach-primary-container)"
                                : "var(--ach-bg-high)",
                              boxShadow: achievement.unlocked
                                ? `0 0 8px ${cfg.glow}`
                                : "none",
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Bottom Teaser Strip: Ascension Pathway */}
            <div className="ach-ascension-teaser">
              <div className="ach-teaser-left">
                <div className="ach-teaser-icon">🎖</div>
                <div>
                  <div className="ach-teaser-title">
                    NEXT SANCTUM ASCENSION REWARD
                  </div>
                  <div className="ach-teaser-desc">
                    Unlock {Math.max(1, 5 - (unlockedCount % 5))} more feats to trigger the
                    +5% EXP Sanctum Rune Multiplier
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="ach-teaser-btn"
                onClick={() => setFilter("ascension")}
              >
                VIEW ASCENSION PATHWAY →
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: ARCHIVE INSPECTOR // FEAT DOSSIER */}
          <aside className="ach-inspector-col" aria-label="Archive Inspector">
            {selectedAchievement && selectedDetails ? (
              <div className="ach-dossier-box">
                <div className="ach-dossier-watermark" />

                <div className="ach-dossier-header">
                  <span>[ ARCHIVE INSPECTOR // FEAT DOSSIER ]</span>
                  <span className="ach-dossier-active-badge">ACTIVE FOCUS</span>
                </div>

                {/* Large Emblem Preview */}
                <div className="ach-dossier-emblem-wrap">
                  <div
                    className="ach-dossier-icon-glow"
                    style={
                      {
                        "--card-glow": selectedConfig.glow,
                      } as React.CSSProperties
                    }
                  >
                    <AchievementIconSvg
                      icon={selectedAchievement.icon}
                      size={40}
                      color={
                        selectedAchievement.unlocked
                          ? selectedConfig.color
                          : "var(--ach-text-muted)"
                      }
                    />
                    <div className="ach-emblem-pulse-dot" />
                  </div>
                  <span className="ach-dossier-feat-tag">
                    {selectedAchievement.unlocked
                      ? `FEAT // UNLOCKED RECORD`
                      : `FEAT // ENCRYPTED IN SHADOW`}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="ach-dossier-title">{selectedAchievement.title}</h3>
                  <p className="ach-dossier-desc" style={{ marginTop: "0.4rem" }}>
                    {selectedAchievement.description}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="ach-dossier-meta-grid">
                  <div className="ach-meta-item">
                    <span className="ach-meta-key">RECORD ID</span>
                    <span className="ach-meta-val" style={{ fontFamily: "monospace" }}>
                      {selectedAchievement.id}
                    </span>
                  </div>
                  <div className="ach-meta-item">
                    <span className="ach-meta-key">TIER LEVEL</span>
                    <span className="ach-meta-val" style={{ color: selectedConfig.color }}>
                      {selectedConfig.label.toUpperCase()} // RANK {getRankLetterForTier(selectedAchievement.tier)}
                    </span>
                  </div>
                  <div className="ach-meta-item">
                    <span className="ach-meta-key">PROGRESS</span>
                    <span className="ach-meta-val">
                      {selectedDetails.current} / {selectedDetails.target}{" "}
                      {selectedDetails.unit} ({selectedDetails.pct}%)
                    </span>
                  </div>
                  <div className="ach-meta-item">
                    <span className="ach-meta-key">BONUS PERK</span>
                    <span className="ach-meta-val" style={{ color: "var(--ach-primary)" }}>
                      {selectedConfig.bonus}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* NEXT MILESTONES (Inside Right Column below Inspector) */}
            {nextMilestones.length > 0 && (
              <section className="ach-milestones-section" aria-label="Next Achievement Milestones">
                <div className="ach-milestones-header">
                  <div>
                    <h2 className="ach-milestones-title">NEXT MILESTONES</h2>
                    <p className="ach-milestones-subtitle">Your closest achievements.</p>
                  </div>
                  <span className="ach-milestones-badge">
                    {nextMilestones.length} IN REACH
                  </span>
                </div>

                <div className="ach-milestones-grid">
                  {nextMilestones.map(({ achievement, details, remaining }) => {
                    const cfg = TIER_CONFIG[achievement.tier];
                    const isSelected = selectedAchievement?.id === achievement.id;

                    return (
                      <motion.div
                        key={achievement.id}
                        className={`ach-milestone-card ${isSelected ? "ach-card-selected" : ""}`}
                        style={
                          {
                            "--card-accent": cfg.color,
                            "--card-glow": cfg.glow,
                          } as React.CSSProperties
                        }
                        onClick={() => setSelectedId(achievement.id)}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div>
                          <div className="ach-milestone-top">
                            <div className="ach-milestone-icon-box">
                              <AchievementIconSvg
                                icon={achievement.icon}
                                size={20}
                                color={cfg.color}
                              />
                            </div>
                            <span className="ach-milestone-tier-pill">
                              {cfg.label.toUpperCase()}
                            </span>
                          </div>

                          <h3 className="ach-milestone-name">{achievement.title}</h3>
                          <p className="ach-milestone-desc">{achievement.description}</p>
                        </div>

                        <div className="ach-milestone-footer">
                          <div className="ach-milestone-progress-row">
                            <span className="ach-milestone-counts">
                              {details.current} / {details.target} {details.unit}
                            </span>
                            <span className="ach-milestone-pct">
                              {details.pct}%
                            </span>
                          </div>

                          <div className="ach-progress-track">
                            <div
                              className="ach-progress-bar-fill"
                              style={{
                                width: `${details.pct}%`,
                                background:
                                  "linear-gradient(90deg, var(--ach-primary-container), var(--ach-tertiary))",
                                boxShadow: `0 0 8px ${cfg.glow}`,
                              }}
                            />
                          </div>

                          <div className="ach-milestone-remaining">
                            {remaining} {details.unit} REMAINING
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

// Helpers
function getUnitLabel(reqType: string): string {
  switch (reqType) {
    case "quests_completed":
      return "QUESTS";
    case "streak":
      return "DAYS";
    case "level":
      return "LVL";
    case "coins":
      return "COINS";
    case "perfect_day":
      return "DAYS";
    default:
      if (reqType.startsWith("stat_")) return "PTS";
      return "PTS";
  }
}

function getCategoryTag(reqType: string): string {
  switch (reqType) {
    case "quests_completed":
      return "QUEST";
    case "streak":
      return "STREAK";
    case "level":
      return "LEVEL";
    case "coins":
      return "VAULT";
    case "perfect_day":
      return "DIRECTIVE";
    default:
      if (reqType.startsWith("stat_")) return "STAT";
      return "FEAT";
  }
}

function getRankLetterForTier(tier: AchievementTier): string {
  switch (tier) {
    case "BRONZE":
      return "E";
    case "SILVER":
      return "D";
    case "GOLD":
      return "C";
    case "PLATINUM":
      return "B";
    case "LEGENDARY":
      return "S";
    default:
      return "E";
  }
}
