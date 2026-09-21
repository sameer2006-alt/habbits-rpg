import { useState } from "react";
import type { Player, Achievement } from "../types/game";
import Avatar from "../components/Avatar";
import AvatarSelector from "../components/AvatarSelector";
import { AVATAR_PRESETS } from "../data/avatars";
import { Link } from "react-router-dom";
import {
  Trophy,
  UserCog,
  Sparkles,
  Pencil,
  Check,
  X,
  ShieldAlert,
  Award,
  ChevronRight,
  Zap,
  Shield,
  Flame,
  Coins,
  Calendar as CalendarIcon,
} from "lucide-react";
import SystemIdentityModal from "../components/SystemIdentityModal";
import { getRankDefinition } from "../data/ranks";
import StreakCalendar from "../components/StreakCalendar";
import type { TitleDefinition } from "../data/titles";
import type { PlayerRecordsMap } from "../lib/personalRecordsData";
import PersonalRecordsSection from "../components/PersonalRecordsSection";
import PlayerAnalyticsSection from "../components/PlayerAnalyticsSection";
import { getRequiredXP } from "../utils/levelSystem";
import "./Status.css";

interface StatusProps {
  userId?: string;
  level: number;
  xpIntoLevel: number;
  player: Player;
  achievements: Achievement[];
  title?: string;
  mode?: "stats" | "awards";
  powerScore?: number;
  equippedTitle?: TitleDefinition | null;
  records?: PlayerRecordsMap;
  onAvatarChange?: (avatarId: string, customName?: string) => void;
  onNameChange?: (name: string) => void;
}

export default function Status({
  userId,
  level,
  xpIntoLevel,
  player,
  achievements,
  title = "Hunter Profile & Status",
  powerScore = 0,
  equippedTitle,
  records,
  onAvatarChange,
  onNameChange,
}: StatusProps) {
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const currentPreset =
    AVATAR_PRESETS.find((p) => p.id === player.profile?.avatarId) ??
    AVATAR_PRESETS[0];

  const rankDef = getRankDefinition(player.progress.rank);

  // Level & XP math
  const requiredXP = getRequiredXP(level);
  const safeRequiredXP = Math.max(1, requiredXP || 1);
  const safeCurrentXP = Math.max(0, xpIntoLevel || 0);
  const xpPercentage = Math.min(100, Math.round((safeCurrentXP / safeRequiredXP) * 100));
  const remainingXP = Math.max(0, safeRequiredXP - safeCurrentXP);

  // Streaks & Milestones
  const currentStreak = player.progress.currentStreak || 0;
  const bestStreak = Math.max(player.progress.bestStreak || 0, currentStreak);
  const perfectDaysCount = records?.total_perfect_days?.recordValue ?? 0;

  const getNextMilestone = (streak: number) => {
    if (streak < 7) {
      return {
        title: "7-DAY RECKONING",
        desc: "Complete all scheduled directives to secure the Week 1 Sovereign node.",
        target: 7,
        coins: 50,
        xp: 100,
      };
    }
    if (streak < 14) {
      return {
        title: "14-DAY VANGUARD TRIAL",
        desc: "Maintain unbroken operational consistency across the two-week threshold.",
        target: 14,
        coins: 100,
        xp: 250,
      };
    }
    if (streak < 30) {
      return {
        title: "30-DAY TRANSCENDENCE",
        desc: "Achieve the full monthly continuum milestone and solidify neural discipline.",
        target: 30,
        coins: 250,
        xp: 600,
      };
    }
    if (streak < 60) {
      return {
        title: "60-DAY IRON DISCIPLINE",
        desc: "Ascend to elite hunter persistence across two full seasonal periods.",
        target: 60,
        coins: 500,
        xp: 1200,
      };
    }
    const nextTarget = Math.ceil((streak + 1) / 30) * 30;
    return {
      title: `${nextTarget}-DAY OMNI PROTOCOL`,
      desc: `Sustain supreme hunter discipline towards the ${nextTarget}-day monument.`,
      target: nextTarget,
      coins: 1000,
      xp: 2500,
    };
  };

  const milestone = getNextMilestone(currentStreak);
  const milestonePct = Math.min(100, Math.round((currentStreak / milestone.target) * 100));

  // Core Attributes
  const statItems = [
    {
      key: "STR",
      label: "STRENGTH",
      category: "PHYSICAL HABITS",
      value: player.stats.strength,
      desc: "Workouts, Kinetic Stride",
      variant: "crimson",
    },
    {
      key: "INT",
      label: "INTELLIGENCE",
      category: "STUDY & CODEX",
      value: player.stats.intelligence,
      desc: "Daily Reading, Skill Sync",
      variant: "gold",
    },
    {
      key: "VIT",
      label: "VITALITY",
      category: "RECOVERY & HYDRATION",
      value: player.stats.vitality,
      desc: "Hydration, 7h+ Sleep",
      variant: "crimson",
    },
    {
      key: "FOC",
      label: "FOCUS",
      category: "DEEP WORK DIRECTIVES",
      value: player.stats.focus,
      desc: "Sprint Sessions",
      variant: "crimson",
    },
    {
      key: "DIS",
      label: "DISCIPLINE",
      category: "EXECUTION ON SCHEDULE",
      value: player.stats.discipline,
      desc: "No Missed Directives",
      variant: "crimson",
    },
    {
      key: "CON",
      label: "CONSISTENCY",
      category: "STREAK RETENTION",
      value: player.stats.consistency,
      desc: "Daily Sync Retention",
      variant: "gold",
    },
  ];

  const handleSelectAvatar = (avatarId: string, customName?: string) => {
    if (onAvatarChange) {
      onAvatarChange(avatarId, customName);
    }
  };

  const handleSaveInlineName = () => {
    const trimmed = nameInput.trim();
    if (trimmed && onNameChange) {
      onNameChange(trimmed);
    }
    setIsEditingName(false);
  };

  const displayedName = player.profile?.name || currentPreset.name;
  const sysId = userId ? `SYS-ID // ${userId.slice(0, 8).toUpperCase()}` : `SYS-ID // 0948-${displayedName.toUpperCase()}`;

  return (
    <main className="status-root">
      {/* ── TOP HEADER & TELEMETRY ── */}
      <div className="status-top-bar">
        <div className="status-top-title-group">
          <div className="status-top-tag">
            <span className="status-top-tag-pulse" />
            <span>SYSTEM // COMMAND</span>
          </div>
          <h1 className="status-top-title">{title}</h1>
        </div>

        <div className="status-top-metrics">
          <Link
            to="/ranks"
            className="status-metric-pill status-metric-pill--rank"
            title="Inspect Rank Progression Roadmap"
            style={{
              borderColor: rankDef.color,
              color: rankDef.color,
            }}
          >
            <Award size={14} />
            <span>{rankDef.badgeLabel}</span>
            <ChevronRight size={12} />
          </Link>

          <span className="status-metric-pill status-metric-pill--power">
            <Zap size={14} />
            <span>POWER: {powerScore.toLocaleString()}</span>
          </span>

          <span className="status-metric-pill status-metric-pill--streak">
            <Flame size={14} />
            <span>STREAK: {currentStreak}D</span>
          </span>

          <span className="status-metric-pill status-metric-pill--coins">
            <Coins size={14} />
            <span>{player.progress.coins} 🪙</span>
          </span>
        </div>
      </div>

      {/* ── TIER 1: HUNTER HERO OVERVIEW ── */}
      <section className="status-hero-card">
        {/* Tag & Status Row */}
        <div className="status-hero-tag-row">
          <div className="status-hero-tags">
            <span className="status-hero-sys-badge">
              <span className="status-top-tag-pulse" />
              {sysId}
            </span>
            <span className="status-hero-verified-badge">
              DOSSIER LEVEL VERIFIED
            </span>
          </div>
          <span className="status-hero-sync-time">
            ACTIVE SYSTEM TELEMETRY
          </span>
        </div>

        {/* Identity & HUD Grid Layout */}
        <div className="status-hero-layout">
          {/* Avatar & Name Lockup */}
          <div className="status-hero-identity-group">
            <div className="status-avatar-wrapper">
              <div className="status-avatar-glow-ring" />
              <Avatar
                avatarId={player.profile?.avatarId}
                level={level}
                rank={player.progress.rank}
                size={100}
                showRank={false}
                showLevel={false}
              />
              <span className="status-avatar-lvl-tag">LVL {level}</span>
            </div>

            <div className="status-identity-details">
              <div className="status-name-row">
                {isEditingName ? (
                  <div className="status-rename-box">
                    <input
                      type="text"
                      className="status-rename-input"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      maxLength={24}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveInlineName();
                        if (e.key === "Escape") setIsEditingName(false);
                      }}
                      placeholder="Custom name..."
                    />
                    <button
                      type="button"
                      className="status-rename-action-btn status-rename-action-btn--save"
                      onClick={handleSaveInlineName}
                      title="Save Name"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      className="status-rename-action-btn status-rename-action-btn--cancel"
                      onClick={() => setIsEditingName(false)}
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="status-character-name">{displayedName}</h2>
                    <button
                      type="button"
                      className="status-rename-btn"
                      onClick={() => {
                        setNameInput(displayedName);
                        setIsEditingName(true);
                      }}
                      title="Rename Character"
                    >
                      <Pencil size={14} />
                    </button>
                  </>
                )}

                <span
                  className="status-archetype-badge"
                  style={{
                    borderColor: currentPreset.accentColor,
                    color: currentPreset.accentColor,
                  }}
                >
                  <Sparkles size={11} />
                  {currentPreset.gender === "female" ? "Female" : "Male"} • {currentPreset.category.toUpperCase()}
                </span>
              </div>

              <div className="status-rank-subrow">
                <Link
                  to="/ranks"
                  style={{
                    color: rankDef.color,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>{rankDef.badgeLabel} // {rankDef.name.toUpperCase()}</span>
                  <ChevronRight size={11} />
                </Link>
              </div>

              {equippedTitle && (
                <div
                  className="status-title-display"
                  style={{
                    border: `1px solid ${equippedTitle.badgeColor}`,
                    color: equippedTitle.badgeColor,
                    background: "rgba(0, 0, 0, 0.4)",
                    boxShadow: `0 0 8px ${equippedTitle.glowColor}`,
                  }}
                  title={equippedTitle.description}
                >
                  <Award size={12} />
                  <span>{equippedTitle.name}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="status-hero-action-buttons">
                <Link to="/armory" className="status-action-pill status-action-pill--armory">
                  <Shield size={14} /> Armory Hub
                </Link>
                <Link to="/ranks" className="status-action-pill status-action-pill--ranks">
                  <Award size={14} /> Rank Roadmap
                </Link>
                <button
                  type="button"
                  className="status-action-pill"
                  onClick={() => setIsAvatarSelectorOpen(true)}
                >
                  <UserCog size={14} /> Avatar
                </button>
                <button
                  type="button"
                  className="status-action-pill status-action-pill--identity"
                  onClick={() => setIsIdentityModalOpen(true)}
                >
                  <ShieldAlert size={14} /> Identity
                </button>
              </div>
            </div>
          </div>

          {/* Core HUD Stat Cards */}
          <div className="status-hud-grid">
            <div className="status-hud-tile">
              <div className="status-hud-tile-top">
                <span>POWER</span>
                <Zap size={14} style={{ color: "#ffd700" }} />
              </div>
              <div className="status-hud-tile-value" style={{ color: "#ffd700" }}>
                {powerScore.toLocaleString()}
              </div>
              <div className="status-hud-tile-sub">CP RATING</div>
            </div>

            <div className="status-hud-tile">
              <div className="status-hud-tile-top">
                <span>STREAK</span>
                <Flame size={14} style={{ color: "#f59e0b" }} />
              </div>
              <div className="status-hud-tile-value" style={{ color: "#f59e0b" }}>
                {currentStreak} DAYS
              </div>
              <div className="status-hud-tile-sub">ACTIVE CYCLE</div>
            </div>

            <div className="status-hud-tile">
              <div className="status-hud-tile-top">
                <span>COINS</span>
                <Coins size={14} style={{ color: "#ffdcc3" }} />
              </div>
              <div className="status-hud-tile-value" style={{ color: "#ffdcc3" }}>
                {player.progress.coins.toLocaleString()}
              </div>
              <div className="status-hud-tile-sub">VAULT RESERVE</div>
            </div>

            <div className="status-hud-tile">
              <div className="status-hud-tile-top">
                <span>TOTAL XP</span>
                <Award size={14} style={{ color: "#ffb4ab" }} />
              </div>
              <div className="status-hud-tile-value" style={{ color: "#ffb4ab" }}>
                {(player.progress.totalXP ?? safeCurrentXP).toLocaleString()}
              </div>
              <div className="status-hud-tile-sub">CUMULATIVE</div>
            </div>
          </div>
        </div>

        {/* Level XP Gauge Card */}
        <div className="status-level-gauge-card">
          <div className="status-level-gauge-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="status-level-gauge-title">LEVEL {level} PROGRESS</span>
              <span className="status-level-gauge-numbers">
                {safeCurrentXP.toLocaleString()} / {safeRequiredXP.toLocaleString()} XP
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "#fff", fontWeight: 700 }}>{xpPercentage}%</span>
              <span className="status-level-gauge-remaining">
                ({remainingXP.toLocaleString()} XP to Level {level + 1})
              </span>
            </div>
          </div>

          <div className="status-level-track">
            <div className="status-level-bar" style={{ width: `${xpPercentage}%` }} />
          </div>
        </div>
      </section>

      {/* ── TIER 2: CORE ATTRIBUTES ── */}
      <section className="status-attributes-section">
        <div className="status-section-header">
          <div className="status-section-title-group">
            <span className="status-section-indicator" />
            <h2 className="status-section-title">CORE ATTRIBUTES</h2>
            <span className="status-section-subtitle">[ BEHAVIORAL PROTOCOL MATRIX ]</span>
          </div>
          <span className="status-metric-pill" style={{ fontSize: "0.6875rem" }}>
            RANK {player.progress.rank} CAP: 30
          </span>
        </div>

        <div className="status-attributes-grid">
          {statItems.map((item) => {
            const attrPct = Math.min(
              95,
              Math.max(15, Math.round(((safeCurrentXP + item.value * 17) % safeRequiredXP) / safeRequiredXP * 100))
            );
            return (
              <div key={item.key} className="status-attribute-card">
                <div className="status-attr-top">
                  <div>
                    <span className="status-attr-category">{item.category}</span>
                    <h3 className="status-attr-name">{item.label}</h3>
                  </div>
                  <div className="status-attr-val-box">
                    <span className="status-attr-val">{item.value}</span>
                    <span className="status-attr-tier">TIER {player.progress.rank}</span>
                  </div>
                </div>

                <div className="status-attr-bottom">
                  <div className="status-attr-desc-row">
                    <span>{item.desc}</span>
                    <span>{attrPct}% to {item.key} {item.value + 1}</span>
                  </div>
                  <div className="status-attr-track">
                    <div
                      className={`status-attr-fill ${
                        item.variant === "gold" ? "status-attr-fill--gold" : ""
                      }`}
                      style={{ width: `${attrPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── TIER 3: STREAK & PROTOCOL HEALTH ── */}
      <section className="status-protocol-section">
        <div className="status-section-header">
          <div className="status-section-title-group">
            <CalendarIcon size={18} style={{ color: "var(--crimson-vivid, #dc2626)" }} />
            <h2 className="status-section-title">PROTOCOL HEALTH CALENDAR</h2>
            <span className="status-section-subtitle">[ OPERATIONAL CONTINUITY ]</span>
          </div>
        </div>

        <div className="status-protocol-layout">
          {/* Streak Calendar Component */}
          <div className="status-calendar-wrapper">
            <StreakCalendar userId={userId || player.profile?.id || ""} />
          </div>

          {/* Sidebar: Quick Metric Trio & Next Milestone */}
          <div className="status-protocol-sidebar">
            {/* Quick Metric Trio */}
            <div className="status-streak-trio">
              <div className="status-streak-trio-item">
                <span className="status-streak-trio-label">CURRENT</span>
                <span className="status-streak-trio-val status-streak-trio-val--crimson">
                  {currentStreak}D
                </span>
              </div>
              <div className="status-streak-trio-item status-streak-trio-item--highlight">
                <span className="status-streak-trio-label">BEST</span>
                <span className="status-streak-trio-val status-streak-trio-val--gold">
                  {bestStreak}D
                </span>
              </div>
              <div className="status-streak-trio-item">
                <span className="status-streak-trio-label">PERFECT</span>
                <span className="status-streak-trio-val status-streak-trio-val--green">
                  {perfectDaysCount}
                </span>
              </div>
            </div>

            {/* Next Milestone Card */}
            <div className="status-milestone-card">
              <div>
                <div className="status-milestone-top">
                  <span className="status-milestone-tag">
                    <Award size={14} />
                    NEXT PROTOCOL MILESTONE
                  </span>
                  <span className="status-milestone-badge">IN PROGRESS</span>
                </div>

                <h3 className="status-milestone-title">{milestone.title}</h3>
                <p className="status-milestone-desc">{milestone.desc}</p>

                <div className="status-milestone-rewards">
                  <div className="status-milestone-reward-item">
                    <Coins size={14} />
                    <span>+{milestone.coins} COINS</span>
                  </div>
                  <div className="status-milestone-reward-divider" />
                  <div className="status-milestone-reward-item" style={{ color: "var(--crimson-light, #ffb4ab)" }}>
                    <Zap size={14} />
                    <span>+{milestone.xp} XP</span>
                  </div>
                </div>
              </div>

              <div className="status-milestone-progress">
                <div className="status-milestone-progress-header">
                  <span>Progress: {currentStreak} / {milestone.target} Days</span>
                  <span style={{ color: "var(--gold-amber, #f59e0b)", fontWeight: 700 }}>
                    {milestonePct}%
                  </span>
                </div>
                <div className="status-milestone-track">
                  <div className="status-milestone-fill" style={{ width: `${milestonePct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIER 4: PERSONAL RECORDS (HIGH-WATER MARKS) ── */}
      <PersonalRecordsSection
        records={records ?? {}}
        player={player}
        powerScore={powerScore}
        mode="records"
      />

      {/* ── TIER 5 & 6: CAREER MATRIX & PERFORMANCE TELEMETRY ── */}
      <div className="status-career-telemetry-grid">
        {/* Tier 5: Lifetime Statistics / Career Matrix */}
        <PersonalRecordsSection
          records={records ?? {}}
          player={player}
          powerScore={powerScore}
          mode="lifetime"
        />

        {/* Tier 6: Tactical Intelligence & Analytics */}
        <PlayerAnalyticsSection
          userId={userId || player.profile?.id || ""}
          player={player}
          records={records ?? {}}
        />
      </div>

      {/* ── ACHIEVEMENTS ARCHIVE BANNER ── */}
      <div className="status-achievements-banner">
        <div className="status-achievements-left">
          <div className="status-achievements-icon-box">
            <Trophy size={24} />
          </div>
          <div className="status-achievements-info">
            <h3 className="status-achievements-title">HUNTER ACHIEVEMENTS ARCHIVE</h3>
            <p className="status-achievements-sub">
              You have unlocked {unlockedCount} of {achievements.length} operational badges. Inspect all badges, tiers, and honors.
            </p>
          </div>
        </div>

        <Link to="/achievements" className="status-achievements-link">
          <Trophy size={14} /> View All ({unlockedCount}/{achievements.length})
        </Link>
      </div>

      {/* ── MODALS ── */}
      <AvatarSelector
        isOpen={isAvatarSelectorOpen}
        currentAvatarId={player.profile?.avatarId}
        currentName={displayedName}
        onSelectAvatar={handleSelectAvatar}
        onClose={() => setIsAvatarSelectorOpen(false)}
        playerLevel={level}
        playerRank={player.progress.rank}
      />

      <SystemIdentityModal
        isOpen={isIdentityModalOpen}
        currentName={displayedName}
        currentAvatarId={player.profile?.avatarId}
        playerLevel={level}
        playerRank={player.progress.rank}
        onConfirm={(name, avatarId) => handleSelectAvatar(avatarId, name)}
        onClose={() => setIsIdentityModalOpen(false)}
      />
    </main>
  );
}
