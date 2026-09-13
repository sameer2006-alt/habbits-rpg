
import { useState } from "react";
import type { Player, Achievement } from "../types/game";
import XPBar from "../components/XPBar";
import Avatar from "../components/Avatar";
import AvatarSelector from "../components/AvatarSelector";
import { AVATAR_PRESETS } from "../data/avatars";
import { Link } from "react-router-dom";
import { Trophy, UserCog, Sparkles, Pencil, Check, X, ShieldAlert, Award, ChevronRight, Zap, Shield } from "lucide-react";
import SystemIdentityModal from "../components/SystemIdentityModal";
import { getRankDefinition } from "../data/ranks";
import StreakCalendar from "../components/StreakCalendar";
import type { TitleDefinition } from "../data/titles";
import type { PlayerRecordsMap } from "../lib/personalRecordsData";
import PersonalRecordsSection from "../components/PersonalRecordsSection";
import PlayerAnalyticsSection from "../components/PlayerAnalyticsSection";

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
  title = "Player Profile & Stats",
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

  const statItems = [
    { label: "STRENGTH", value: player.stats.strength },
    { label: "INTELLIGENCE", value: player.stats.intelligence },
    { label: "VITALITY", value: player.stats.vitality },
    { label: "FOCUS", value: player.stats.focus },
    { label: "DISCIPLINE", value: player.stats.discipline },
    { label: "CONSISTENCY", value: player.stats.consistency },
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

  return (
    <main>
      <div className="system-header">
        <h1>{title}</h1>
        <div className="inline-meta">
          <Link
            to="/ranks"
            className="value-badge status-rank-link"
            title="Inspect Rank Progression Roadmap"
            style={{
              borderColor: getRankDefinition(player.progress.rank).color,
              color: getRankDefinition(player.progress.rank).color,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Award size={13} />
            <span>{getRankDefinition(player.progress.rank).badgeLabel}</span>
            <ChevronRight size={11} />
          </Link>
          <span
            className="value-badge"
            style={{
              borderColor: "#ffd700",
              color: "#ffd700",
              fontWeight: "bold",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Zap size={13} />
            POWER: {powerScore.toLocaleString()}
          </span>
          <span className="value-badge">STREAK: {player.progress.currentStreak} DAYS</span>
          <span className="value-badge">COINS: {player.progress.coins} 🪙</span>
        </div>

      </div>

      {/* Avatar Profile Card */}
      <div className="profile-hero-card">
        <div className="profile-avatar-column">
          <Avatar
            avatarId={player.profile?.avatarId}
            level={level}
            rank={player.progress.rank}
            size={110}
            showRank={true}
            showLevel={true}
          />
        </div>

        <div className="profile-hero-details">
          <div className="profile-hero-meta">
            <span
              className="profile-archetype-pill"
              style={{
                borderColor: currentPreset.accentColor,
                color: currentPreset.accentColor,
              }}
            >
              <Sparkles size={12} />
              {currentPreset.gender === "female" ? "Female" : "Male"} • {currentPreset.category.toUpperCase()}
            </span>
          </div>

          <div className="profile-name-row">
            {isEditingName ? (
              <div className="profile-name-edit-box">
                <input
                  type="text"
                  className="profile-name-inline-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={24}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveInlineName();
                    if (e.key === "Escape") setIsEditingName(false);
                  }}
                  placeholder="Enter custom name..."
                />
                <button
                  className="profile-name-btn save"
                  onClick={handleSaveInlineName}
                  title="Save Name"
                >
                  <Check size={14} />
                </button>
                <button
                  className="profile-name-btn cancel"
                  onClick={() => setIsEditingName(false)}
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="profile-name-display">
                <h2 className="profile-character-name">
                  {displayedName}
                </h2>
                <button
                  className="profile-name-edit-icon"
                  onClick={() => {
                    setNameInput(displayedName);
                    setIsEditingName(true);
                  }}
                  title="Rename Character / Avatar"
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}
          </div>

          {equippedTitle && (
            <div style={{ marginTop: "4px", marginBottom: "8px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  border: `1px solid ${equippedTitle.badgeColor}`,
                  color: equippedTitle.badgeColor,
                  background: "rgba(0, 0, 0, 0.4)",
                  boxShadow: `0 0 8px ${equippedTitle.glowColor}`,
                }}
                title={equippedTitle.description}
              >
                <Award size={12} />
                {equippedTitle.name}
              </span>
            </div>
          )}

          <div className="profile-avatar-actions">
            <Link
              to="/armory"
              className="action-btn avatar-customize-btn"
              style={{
                borderColor: "#ffd700",
                color: "#ffd700",
                background: "rgba(255, 215, 0, 0.12)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
              }}
            >
              <Shield size={14} style={{ color: "#ffd700" }} /> Armory Hub
            </Link>
            <Link
              to="/ranks"
              className="action-btn avatar-customize-btn"
              style={{
                borderColor: "#631826",
                color: "#f2e9e9",
                background: "rgba(230, 57, 70, 0.15)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
              }}
            >
              <Award size={15} style={{ color: "#e63946" }} /> Rank Roadmap
            </Link>
            <button
              className="action-btn avatar-customize-btn"
              onClick={() => setIsAvatarSelectorOpen(true)}
            >
              <UserCog size={15} /> Customize Avatar
            </button>
            <button
              className="action-btn avatar-customize-btn"
              onClick={() => setIsIdentityModalOpen(true)}
              style={{
                borderColor: "#631826",
                color: "#f2e9e9",
                background: "rgba(230, 57, 70, 0.12)",
              }}
            >
              <ShieldAlert size={14} style={{ color: "#e63946" }} /> System Identity
            </button>
          </div>

        </div>
      </div>

      {/* XP Bar */}
      <div className="xp-shell" style={{ marginTop: "16px" }}>
        <div className="xp-header">
          <span>Level {level} — Rank {player.progress.rank}</span>
          <span>{xpIntoLevel} XP</span>
        </div>
        <XPBar level={level} currentXP={xpIntoLevel} />
      </div>

      {/* ── SECTION B: CORE STATS ── */}
      <div style={{ marginTop: "22px" }}>
        <div style={{ fontSize: "0.8rem", color: "#8a6b70", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px", fontWeight: "bold" }}>
          CORE ATTRIBUTES
        </div>
        <div className="status-grid">
          {statItems.map((s) => (
            <div key={s.label} className="stat-pill">
              <span className="card-title">{s.label}</span>
              <strong>{s.value}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION C: STREAK & ACTIVITY ── */}
      <div style={{ marginTop: "22px" }}>
        <div style={{ fontSize: "0.8rem", color: "#8a6b70", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px", fontWeight: "bold" }}>
          STREAK & DAILY ACTIVITY
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 12 }}>
          <div className="stat-pill" style={{ background: "rgba(0,0,0,0.35)", padding: "10px 14px" }}>
            <span className="card-title" style={{ fontSize: "0.72rem", color: "#8a6b70" }}>CURRENT STREAK</span>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#ffaa00" }}>
              {player.progress.currentStreak} <span style={{ fontSize: "0.75rem", color: "#8a6b70", fontWeight: "normal" }}>Days</span>
            </div>
          </div>
          <div className="stat-pill" style={{ background: "rgba(0,0,0,0.35)", padding: "10px 14px" }}>
            <span className="card-title" style={{ fontSize: "0.72rem", color: "#8a6b70" }}>BEST STREAK (LOCKED)</span>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#ffd700" }}>
              {Math.max(player.progress.bestStreak || 0, player.progress.currentStreak || 0)} <span style={{ fontSize: "0.75rem", color: "#8a6b70", fontWeight: "normal" }}>Days</span>
            </div>
          </div>
          <div className="stat-pill" style={{ background: "rgba(0,0,0,0.35)", padding: "10px 14px" }}>
            <span className="card-title" style={{ fontSize: "0.72rem", color: "#8a6b70" }}>PERFECT DAYS</span>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#2ecc71" }}>
              {records?.total_perfect_days?.recordValue ?? 0} <span style={{ fontSize: "0.75rem", color: "#8a6b70", fontWeight: "normal" }}>Attained</span>
            </div>
          </div>
        </div>
        <StreakCalendar userId={userId || player.profile?.id || ""} />
      </div>

      {/* ── SECTION D & E: PERSONAL RECORDS & LIFETIME STATISTICS ── */}
      <PersonalRecordsSection records={records ?? {}} player={player} powerScore={powerScore} />

      {/* ── SECTION F: TACTICAL INTELLIGENCE & ANALYTICS ── */}
      <PlayerAnalyticsSection userId={userId || player.profile?.id || ""} player={player} records={records ?? {}} />

      {/* Achievements Overview */}
      <div className="panel-box" style={{ marginTop: "18px" }}>
        <div className="panel-topbar">
          <div className="card-title">Achievements Overview</div>
          <Link
            to="/achievements"
            style={{
              color: "#c9a876",
              fontSize: "0.75rem",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              textDecoration: "none",
            }}
          >
            <Trophy size={14} /> View All ({unlockedCount}/{achievements.length})
          </Link>
        </div>
        <p style={{ margin: "6px 0 0", color: "#8a6b70", fontSize: "0.85rem" }}>
          You have unlocked {unlockedCount} of {achievements.length} achievements. Head to the Achievements section to track unlocked badges, tiers, and progress.
        </p>
      </div>

      {/* Avatar Selection Modal with custom name support */}
      <AvatarSelector
        isOpen={isAvatarSelectorOpen}
        currentAvatarId={player.profile?.avatarId}
        currentName={displayedName}
        onSelectAvatar={handleSelectAvatar}
        onClose={() => setIsAvatarSelectorOpen(false)}
        playerLevel={level}
        playerRank={player.progress.rank}
      />

      {/* System Identification Directive Modal */}
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
