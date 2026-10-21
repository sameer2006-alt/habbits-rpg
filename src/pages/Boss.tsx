import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Swords,
  Trophy,
  Flame,
  Shield,
  Sparkles,
  CheckCircle2,
  Crown,
  Radar,
  Clock,
  Zap,
  Lock,
  LockKeyhole,
  Check,
  Award,
  Coins,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { BOSSES, type BossDef, type BossCadence } from "../data/bosses";
import {
  getOrInitBossState,
  claimBossReward,
  type BossProgress,
} from "../lib/bossData";
import { GlowButton } from "../components/ui/GlowButton";
import { BossCrest, BossAtmosphere } from "../components/BossCrest";
import { normalizeBossKey } from "../lib/bossCrestUtils";
import BossVictoryModal from "../components/BossVictoryModal";
import "./Boss.css";

interface BossProps {
  userId: string;
  playerLevel?: number;
  playerCoins?: number;
  onBossRewardClaimed: (reward: {
    xp: number;
    coins: number;
    statBonus?: { stat: string; amount: number };
    title?: string;
  }) => void;
}

// Helpers for Boss Rank & Tactical Phases
function getBossRankBadge(boss: BossDef): { rank: string; tag: string; color: string } {
  if (boss.recommendedLevel >= 10) {
    return { rank: "RANK S", tag: "APEX RAID MONARCH", color: "#dc2626" };
  }
  if (boss.recommendedLevel >= 5) {
    return { rank: "RANK A", tag: "WEEKLY NEMESIS", color: "#ef4444" };
  }
  return { rank: "RANK B", tag: "WEEKLY NEMESIS", color: "#f59e0b" };
}

function getBossPhase(remainingHp: number, maxHp: number) {
  const percent = Math.round((remainingHp / maxHp) * 100);
  if (percent <= 0) {
    return { phase: 4, name: "PHASE 4: COLLAPSE & EXTRACTION", state: "DEFEATED", badge: "SEALED VAULT" };
  }
  if (percent < 40) {
    return { phase: 3, name: "PHASE 3: ABYSSAL DELAY", state: "CRITICAL", badge: "PHASE 3 CRITICAL" };
  }
  if (percent < 75) {
    return { phase: 2, name: "PHASE 2: VEIL OF HESITATION", state: "ENGAGED", badge: "PHASE 2 ENGAGED" };
  }
  return { phase: 1, name: "PHASE 1: DORMANT RESISTANCE", state: "ACTIVE", badge: "PHASE 1 ACTIVE" };
}

function getTimeRemaining(cadence: BossCadence): string {
  const now = new Date();
  if (cadence === "WEEKLY") {
    const day = now.getDay();
    const daysLeft = 7 - (day === 0 ? 7 : day);
    const hoursLeft = 23 - now.getHours();
    const minsLeft = 59 - now.getMinutes();
    return `${daysLeft}D ${hoursLeft}H ${minsLeft}M`;
  } else {
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const diffMs = Math.max(0, endOfMonth.getTime() - now.getTime());
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}D ${hours}H ${mins}M`;
  }
}

export default function Boss({
  userId,
  playerLevel: _playerLevel,
  playerCoins: _playerCoins,
  onBossRewardClaimed,
}: BossProps) {
  const loadAllBossProgress = (uid: string) => {
    const updated: Record<string, BossProgress> = {};
    for (const b of BOSSES) {
      updated[b.id] = getOrInitBossState(uid, b);
    }
    return updated;
  };

  const [activeCadence, setActiveCadence] = useState<BossCadence>("WEEKLY");
  const [bossProgressMap, setBossProgressMap] = useState<Record<string, BossProgress>>(() =>
    loadAllBossProgress(userId)
  );

  const [selectedBossId, setSelectedBossId] = useState<string>(() => {
    const weeklyBoss = BOSSES.find((b) => b.cadence === "WEEKLY");
    return weeklyBoss ? weeklyBoss.id : BOSSES[0]?.id || "";
  });

  const [victoryBoss, setVictoryBoss] = useState<BossDef | null>(null);

  const [prevUserId, setPrevUserId] = useState(userId);
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setBossProgressMap(loadAllBossProgress(userId));
  }

  const reloadProgress = () => {
    setBossProgressMap(loadAllBossProgress(userId));
  };

  const activeCadenceBosses = BOSSES.filter((b) => b.cadence === activeCadence);

  // Sync selected boss when cadence changes if selected boss isn't in new cadence
  const handleCadenceChange = (newCadence: BossCadence) => {
    setActiveCadence(newCadence);
    const firstInNewCadence = BOSSES.find((b) => b.cadence === newCadence);
    if (firstInNewCadence) {
      setSelectedBossId(firstInNewCadence.id);
    }
  };

  // Find currently selected boss
  const currentBoss = BOSSES.find((b) => b.id === selectedBossId) || activeCadenceBosses[0] || BOSSES[0];

  const currentProgress = currentBoss
    ? bossProgressMap[currentBoss.id] || {
        currentHp: currentBoss.maxHp,
        defeated: false,
        claimed: false,
        totalDamageDealt: 0,
      }
    : { currentHp: 1000, defeated: false, claimed: false, totalDamageDealt: 0 };

  const remainingHp = Math.max(0, Math.min(currentBoss.maxHp, currentProgress.currentHp));
  const damageDealt = Math.max(0, currentBoss.maxHp - remainingHp);
  const remainingPercent = Math.round((remainingHp / currentBoss.maxHp) * 100);
  const isDefeated = currentProgress.defeated || remainingHp <= 0;
  const isClaimed = currentProgress.claimed;
  const questsRemaining = isDefeated ? 0 : Math.ceil(remainingHp / currentBoss.damagePerQuest);
  const questsCompletedOnBoss = Math.floor(damageDealt / currentBoss.damagePerQuest);
  const currentPhase = getBossPhase(remainingHp, currentBoss.maxHp);
  const rankInfo = getBossRankBadge(currentBoss);

  // Claim Reward Handler
  const handleClaim = (boss: BossDef) => {
    const res = claimBossReward(userId, boss.id);
    if (res.success && res.boss) {
      onBossRewardClaimed({
        xp: res.boss.rewards.xp,
        coins: res.boss.rewards.coins,
        statBonus: res.boss.rewards.statBonus,
        title: res.boss.rewards.title,
      });
      reloadProgress();
      setVictoryBoss(res.boss);
    }
  };



  const weeklyCount = BOSSES.filter((b) => b.cadence === "WEEKLY").length;
  const monthlyCount = BOSSES.filter((b) => b.cadence === "MONTHLY").length;

  return (
    <div className="boss-root">
      {/* 1. TOP PROTOCOL BAR & THREAT RADAR */}
      <div className="boss-protocol-bar">
        <div className="boss-protocol-header">
          <div className="boss-protocol-title-group">
            <span className="boss-protocol-radar-icon">
              <Radar size={22} />
            </span>
            <h2 className="boss-protocol-title">ACTIVE SYSTEM THREAT MATRIX</h2>
            <span className="boss-protocol-threat-count">
              {BOSSES.length} THREATS DETECTED
            </span>
          </div>

          <div className="boss-telemetry-feed">
            <div className="boss-telemetry-item">
              <Clock size={15} color="#ffb77d" />
              <span style={{ color: "#ac8884" }}>CYCLE ROTATION:</span>
              <span style={{ color: "#ffb77d", fontWeight: 700 }}>
                {getTimeRemaining(activeCadence)}
              </span>
            </div>
            <span className="boss-telemetry-divider" />
            <div className="boss-telemetry-item">
              <RefreshCw size={15} color="#dc2626" className="animate-spin-slow" />
              <span style={{ color: "#fff", fontWeight: 600 }}>COMBAT TELEMETRY ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Cadence Segmented Tabs */}
        <div className="boss-cadence-tabs">
          <button
            type="button"
            className={`boss-cadence-tab ${activeCadence === "WEEKLY" ? "active" : ""}`}
            onClick={() => handleCadenceChange("WEEKLY")}
          >
            <Swords size={16} />
            <span>WEEKLY BOSSES ({weeklyCount} ACTIVE)</span>
            {activeCadence === "WEEKLY" && <span className="tab-indicator" />}
          </button>
          <button
            type="button"
            className={`boss-cadence-tab ${activeCadence === "MONTHLY" ? "active" : ""}`}
            onClick={() => handleCadenceChange("MONTHLY")}
          >
            <Crown size={16} />
            <span>MONTHLY APEX RAIDS ({monthlyCount} ACTIVE)</span>
            {activeCadence === "MONTHLY" && <span className="tab-indicator" />}
          </button>
        </div>
      </div>

      {/* 2. THREAT ROSTER MATRIX (All Bosses in Active Cadence) */}
      <div className="boss-roster-grid">
        {activeCadenceBosses.map((boss) => {
          const prog = bossProgressMap[boss.id] || {
            currentHp: boss.maxHp,
            defeated: false,
            claimed: false,
            totalDamageDealt: 0,
          };
          const bRemaining = Math.max(0, Math.min(boss.maxHp, prog.currentHp));
          const bPercent = Math.round((bRemaining / boss.maxHp) * 100);
          const bDefeated = prog.defeated || bRemaining <= 0;
          const isSelected = boss.id === currentBoss.id;
          const bRank = getBossRankBadge(boss);

          return (
            <div
              key={boss.id}
              className={`boss-roster-card ${isSelected ? "active" : ""} ${
                bDefeated ? "defeated" : ""
              }`}
              onClick={() => setSelectedBossId(boss.id)}
            >
              {isSelected && (
                <div className="boss-roster-card-featured-badge">FOCUSED</div>
              )}

              <div className="boss-roster-card-header">
                <div className="boss-roster-card-header-main">
                  <div className="boss-roster-crest-socket">
                    <BossCrest bossId={boss.id} size={34} />
                  </div>
                  <div>
                    <div className="boss-roster-rank-tag" style={{ color: bRank.color }}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: bRank.color,
                          boxShadow: `0 0 6px ${bRank.color}`,
                        }}
                      />
                      <span>{bRank.rank}</span>
                    </div>
                    <h4 className="boss-roster-card-title">{boss.name}</h4>
                    <span className="boss-roster-card-subtitle">{boss.subtitle}</span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    padding: "0.2rem 0.45rem",
                    borderRadius: 4,
                    background: "rgba(42, 42, 45, 0.8)",
                    color: "#ac8884",
                    fontWeight: 600,
                  }}
                >
                  {getTimeRemaining(boss.cadence).split(" ")[0]}
                </span>
              </div>

              <div className="boss-roster-card-hp">
                <div className="boss-roster-hp-meta">
                  <span style={{ color: "#ac8884" }}>
                    {bRemaining.toLocaleString()} / {boss.maxHp.toLocaleString()} HP
                  </span>
                  <span
                    style={{
                      color: bDefeated ? "#22c55e" : "#ffb4ab",
                      fontWeight: 700,
                    }}
                  >
                    {bDefeated ? "DEFEATED" : `${bPercent}% REMAINING`}
                  </span>
                </div>
                <div className="boss-roster-hp-bar">
                  <div
                    className="boss-roster-hp-fill"
                    style={{
                      width: `${bPercent}%`,
                      background: bDefeated
                        ? "#22c55e"
                        : `linear-gradient(90deg, ${boss.avatarColor}, #dc2626)`,
                    }}
                  />
                </div>
              </div>

              <div className="boss-roster-card-footer">
                <span>+{boss.damagePerQuest} DMG / Quest</span>
                <span style={{ color: "#ffb77d", fontWeight: 700 }}>
                  +{boss.rewards.xp} XP · {boss.rewards.coins} C
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. APEX RAID CHAMBER (Featured Hero View for Focused Boss) */}
      <div
        className={`boss-hero-chamber boss-theme--${normalizeBossKey(currentBoss.id)}`}
        style={{
          "--boss-glow": currentBoss.avatarGlow,
          "--boss-color": currentBoss.avatarColor,
        } as React.CSSProperties}
      >
        {/* Visual Atmospheric Backdrop */}
        <div className="boss-hero-backdrop">
          <div className="boss-hero-art-layer">
            <div
              className="boss-hero-ambient-glow"
              style={{ background: currentBoss.avatarColor }}
            />
            {/* Boss-Specific Atmospheric Background (Phase 5.5A) */}
            <BossAtmosphere bossId={currentBoss.id} />
            <div className="boss-hero-emblem-container">
              <BossCrest bossId={currentBoss.id} size="hero" watermark={true} />
            </div>
            <div className="boss-hero-gradient-overlay" />
            <div className="boss-hero-vignette" />
          </div>

          {/* Top Telemetry Badges */}
          <div className="boss-hero-top-row">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="boss-hero-badge-pill rank">
                [ {rankInfo.rank} // {rankInfo.tag} ]
              </span>
              <span className="boss-hero-badge-pill state">
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: isDefeated ? "#22c55e" : "#dc2626",
                    boxShadow: isDefeated ? "0 0 8px #22c55e" : "0 0 8px #dc2626",
                  }}
                />
                <span>
                  STATE: {isDefeated ? "VANQUISHED" : `ACTIVE // ${remainingPercent}% INTEGRITY`}
                </span>
              </span>
            </div>

            <div className="boss-hero-badge-pill entropy">
              <Clock size={15} color="#ffb77d" />
              <span>CYCLE TIMELOCK: {getTimeRemaining(currentBoss.cadence)}</span>
            </div>
          </div>

          {/* Identity Lockup with Dedicated Boss Sigil Crest */}
          <div className="boss-hero-identity">
            <div className="boss-hero-crest-badge">
              <div className="boss-hero-crest-socket">
                <BossCrest bossId={currentBoss.id} size="lg" />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className="boss-hero-protocol-tag">SYSTEM THREAT IDENTIFIED</span>
                <h1 className="boss-hero-name">{currentBoss.name}</h1>
              </div>
            </div>
            <p className="boss-hero-subtitle">{currentBoss.subtitle}</p>
            <blockquote className="boss-hero-lore">
              “{currentBoss.lore}”
            </blockquote>
          </div>
        </div>

        {/* Integrated Health Command HUD */}
        <div className="boss-hero-hud">
          {/* Numerical Telemetry */}
          <div className="boss-hud-metrics-row">
            <div className="boss-hud-integrity-group">
              <span className="boss-hud-integrity-label">INTEGRITY MATRIX:</span>
              <span className="boss-hud-hp-current">
                {remainingHp.toLocaleString()}
              </span>
              <span className="boss-hud-hp-max">
                / {currentBoss.maxHp.toLocaleString()} HP
              </span>
            </div>

            <div className="boss-hud-status-group">
              <span
                className="boss-hud-hp-percent"
                style={{ color: isDefeated ? "#22c55e" : "#ffb4ab" }}
              >
                {isDefeated ? "TARGET ELIMINATED" : `${remainingPercent}% REMAINING`}
              </span>
              <span className="boss-hud-phase-tag">{currentPhase.badge}</span>
            </div>
          </div>

          {/* Master Segmented Glowing Health Bar */}
          <div className="boss-master-hp-track">
            <motion.div
              className={`boss-master-hp-fill ${isDefeated ? "defeated" : ""}`}
              style={{
                width: `${remainingPercent}%`,
                background: isDefeated
                  ? "linear-gradient(90deg, #15803d 0%, #22c55e 50%, #86efac 100%)"
                  : `linear-gradient(90deg, #991b1b 0%, ${currentBoss.avatarColor} 50%, #ff8b7d 100%)`,
              }}
              initial={{ width: `${remainingPercent}%` }}
              animate={{ width: `${remainingPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="boss-hp-core-notch" />
            </motion.div>
          </div>

          {/* Combat Sub-Metrics & Directive Action Bar */}
          <div className="boss-hud-action-row">
            <div className="boss-hud-telemetry-group">
              <div className="boss-hud-telemetry-item">
                <Award size={18} color="#dc2626" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="label">RAID CASUALTY</span>
                  <span className="val">
                    {damageDealt.toLocaleString()} / {currentBoss.maxHp.toLocaleString()} DMG
                  </span>
                </div>
              </div>

              <div className="boss-hud-telemetry-item">
                <CheckCircle2 size={18} color="#ffb77d" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="label">EXECUTION CAPACITY</span>
                  <span className="val">
                    {questsRemaining} DIRECTIVES REMAINING
                  </span>
                </div>
              </div>

              <div className="boss-hud-rule-pill">
                <Zap size={15} color="#dc2626" />
                <span>
                  EACH QUEST CLEARED DEALS <strong>+{currentBoss.damagePerQuest} DMG</strong>
                </span>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="boss-hud-action-btn-container">
              {isDefeated ? (
                isClaimed ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.25rem",
                      borderRadius: 12,
                      background: "rgba(34, 197, 94, 0.15)",
                      border: "1px solid rgba(34, 197, 94, 0.4)",
                      color: "#22c55e",
                      fontFamily: "Space Grotesk, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.8125rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    <Check size={18} />
                    <span>VICTORY SPOILS CLAIMED // APEX VANQUISHED</span>
                  </div>
                ) : (
                  <GlowButton
                    variant="gold"
                    size="lg"
                    icon={<Sparkles size={18} />}
                    onClick={() => handleClaim(currentBoss)}
                  >
                    CLAIM EPIC LOOT (+{currentBoss.rewards.xp} XP + {currentBoss.rewards.coins} COINS)
                  </GlowButton>
                )
              ) : (
                <Link to="/quests" style={{ textDecoration: "none" }}>
                  <GlowButton
                    variant="danger"
                    size="lg"
                    icon={<Swords size={18} />}
                    iconRight={<ArrowRight size={16} />}
                  >
                    CLEAR QUESTS TO STRIKE (+{currentBoss.damagePerQuest} DMG)
                  </GlowButton>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECONDARY BENTO GRID (12-Col Split) */}
      <div className="boss-bento-grid">
        {/* LEFT COLUMN: Tactical Phase Sequencer & Hunter Dossier */}
        <div className="boss-col-stack">
          {/* Tactical Phase Sequencer */}
          <div className="boss-bento-panel">
            <div className="boss-bento-panel-header">
              <div className="boss-bento-panel-title-group">
                <Shield size={18} color="#dc2626" />
                <span>TACTICAL PHASE SEQUENCER</span>
              </div>
              <span className="boss-bento-panel-subtag">
                CURRENT: {currentPhase.name.split(":")[0]}
              </span>
            </div>

            <div className="boss-phase-list">
              {/* Phase 1 */}
              <div
                className={`boss-phase-item ${
                  currentPhase.phase === 1
                    ? "active"
                    : currentPhase.phase > 1
                    ? "completed"
                    : "locked"
                }`}
              >
                <div className="boss-phase-item-header">
                  <div className="boss-phase-name">
                    {currentPhase.phase > 1 ? (
                      <Check size={14} color="#22c55e" />
                    ) : (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "#dc2626",
                          boxShadow: "0 0 8px #dc2626",
                        }}
                      />
                    )}
                    <span>PHASE 1: DORMANT RESISTANCE (100% - 75% HP)</span>
                  </div>
                  <span
                    className="boss-phase-status-badge"
                    style={{
                      background:
                        currentPhase.phase === 1
                          ? "rgba(220, 38, 38, 0.2)"
                          : currentPhase.phase > 1
                          ? "rgba(34, 197, 94, 0.2)"
                          : "rgba(255, 255, 255, 0.05)",
                      color:
                        currentPhase.phase === 1
                          ? "#ffb4ab"
                          : currentPhase.phase > 1
                          ? "#22c55e"
                          : "#ac8884",
                    }}
                  >
                    {currentPhase.phase === 1
                      ? "CURRENT ACTIVE"
                      : currentPhase.phase > 1
                      ? "CLEARED"
                      : "LOCKED"}
                  </span>
                </div>
                <p className="boss-phase-desc">
                  Baseline monolith. {currentBoss.name} absorbs standard habit executions while resting upon the throne. All standard quest damage applies.
                </p>
              </div>

              {/* Phase 2 */}
              <div
                className={`boss-phase-item ${
                  currentPhase.phase === 2
                    ? "active"
                    : currentPhase.phase > 2
                    ? "completed"
                    : "locked"
                }`}
              >
                <div className="boss-phase-item-header">
                  <div className="boss-phase-name">
                    {currentPhase.phase > 2 ? (
                      <Check size={14} color="#22c55e" />
                    ) : currentPhase.phase === 2 ? (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "#dc2626",
                          boxShadow: "0 0 8px #dc2626",
                        }}
                      />
                    ) : (
                      <Lock size={14} color="#ac8884" />
                    )}
                    <span>PHASE 2: VEIL OF HESITATION (74% - 40% HP)</span>
                  </div>
                  <span
                    className="boss-phase-status-badge"
                    style={{
                      background:
                        currentPhase.phase === 2
                          ? "rgba(220, 38, 38, 0.2)"
                          : currentPhase.phase > 2
                          ? "rgba(34, 197, 94, 0.2)"
                          : "rgba(255, 255, 255, 0.05)",
                      color:
                        currentPhase.phase === 2
                          ? "#ffb4ab"
                          : currentPhase.phase > 2
                          ? "#22c55e"
                          : "#ac8884",
                    }}
                  >
                    {currentPhase.phase === 2
                      ? "CURRENT ACTIVE"
                      : currentPhase.phase > 2
                      ? "CLEARED"
                      : "LOCKED"}
                  </span>
                </div>
                <p className="boss-phase-desc">
                  Radiates heavy procrastination miasma. Low barrier integrity accelerates distraction triggers. Regular consistency breaks through the veil.
                </p>
              </div>

              {/* Phase 3 */}
              <div
                className={`boss-phase-item ${
                  currentPhase.phase === 3
                    ? "active"
                    : currentPhase.phase > 3
                    ? "completed"
                    : "locked"
                }`}
              >
                <div className="boss-phase-item-header">
                  <div className="boss-phase-name">
                    {currentPhase.phase > 3 ? (
                      <Check size={14} color="#22c55e" />
                    ) : currentPhase.phase === 3 ? (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "#dc2626",
                          boxShadow: "0 0 8px #dc2626",
                        }}
                      />
                    ) : (
                      <Lock size={14} color="#ac8884" />
                    )}
                    <span>PHASE 3: ABYSSAL DELAY (39% - 1% HP)</span>
                  </div>
                  <span
                    className="boss-phase-status-badge"
                    style={{
                      background:
                        currentPhase.phase === 3
                          ? "rgba(220, 38, 38, 0.2)"
                          : currentPhase.phase > 3
                          ? "rgba(34, 197, 94, 0.2)"
                          : "rgba(255, 255, 255, 0.05)",
                      color:
                        currentPhase.phase === 3
                          ? "#ffb4ab"
                          : currentPhase.phase > 3
                          ? "#22c55e"
                          : "#ac8884",
                    }}
                  >
                    {currentPhase.phase === 3
                      ? "CURRENT ACTIVE"
                      : currentPhase.phase > 3
                      ? "CLEARED"
                      : "CRITICAL LOCKED"}
                  </span>
                </div>
                <p className="boss-phase-desc">
                  Severe chronos-drain. Habits completed during this phase pierce deep vital defenses, delivering maximum critical progression impact.
                </p>
              </div>

              {/* Phase 4 */}
              <div
                className={`boss-phase-item ${
                  currentPhase.phase === 4 ? "active" : "locked"
                }`}
              >
                <div className="boss-phase-item-header">
                  <div className="boss-phase-name">
                    {currentPhase.phase === 4 ? (
                      <CheckCircle2 size={14} color="#22c55e" />
                    ) : (
                      <LockKeyhole size={14} color="#ac8884" />
                    )}
                    <span>PHASE 4: COLLAPSE & EXTRACTION (0% HP)</span>
                  </div>
                  <span
                    className="boss-phase-status-badge"
                    style={{
                      background:
                        currentPhase.phase === 4
                          ? "rgba(34, 197, 94, 0.2)"
                          : "rgba(255, 255, 255, 0.05)",
                      color: currentPhase.phase === 4 ? "#22c55e" : "#ac8884",
                    }}
                  >
                    {currentPhase.phase === 4 ? "VAULT UNLOCKED" : "SEALED VAULT"}
                  </span>
                </div>
                <p className="boss-phase-desc">
                  Boss vanquished. Soul remnant crystallizes, unlocking the sovereign title and rare armory spoils.
                </p>
              </div>
            </div>
          </div>

          {/* Hunter Combat Dossier */}
          <div className="boss-bento-panel">
            <div className="boss-bento-panel-header">
              <div className="boss-bento-panel-title-group">
                <Flame size={18} color="#ffb77d" />
                <span>HUNTER COMBAT DOSSIER</span>
              </div>
              <span className="boss-bento-panel-subtag">
                OPERATOR STRIKE TELEMETRY
              </span>
            </div>

            <div className="boss-dossier-stats-grid">
              <div className="boss-dossier-stat-tile">
                <span className="boss-dossier-stat-label">STRIKE OUTPUT</span>
                <span className="boss-dossier-stat-val" style={{ color: "#ffb4ab" }}>
                  {damageDealt} DMG
                </span>
                <span className="boss-dossier-stat-desc">Dealt to {currentBoss.name.split(",")[0]}</span>
              </div>

              <div className="boss-dossier-stat-tile">
                <span className="boss-dossier-stat-label">CLEARED DIRECTIVES</span>
                <span className="boss-dossier-stat-val" style={{ color: "#fff" }}>
                  {questsCompletedOnBoss} QUESTS
                </span>
                <span className="boss-dossier-stat-desc">100% execution accuracy</span>
              </div>

              <div className="boss-dossier-stat-tile">
                <span className="boss-dossier-stat-label">DAMAGE PER QUEST</span>
                <span className="boss-dossier-stat-val" style={{ color: "#ffb77d" }}>
                  +{currentBoss.damagePerQuest} CRIT
                </span>
                <span className="boss-dossier-stat-desc">Direct damage per clear</span>
              </div>
            </div>

            {/* Recent Combat Log Entries */}
            <div className="boss-activity-feed">
              <div className="boss-activity-entry">
                <div className="boss-activity-desc">
                  <CheckCircle2 size={15} color="#22c55e" />
                  <span>Deep Work Architecture Sprint</span>
                </div>
                <span className="boss-activity-dmg">+{currentBoss.damagePerQuest} DMG RECORDED</span>
              </div>
              <div className="boss-activity-entry">
                <div className="boss-activity-desc">
                  <CheckCircle2 size={15} color="#22c55e" />
                  <span>Physical Conditioning Protocol</span>
                </div>
                <span className="boss-activity-dmg">+{currentBoss.damagePerQuest} DMG RECORDED</span>
              </div>
              <div className="boss-activity-entry">
                <div className="boss-activity-desc">
                  <CheckCircle2 size={15} color="#22c55e" />
                  <span>Cognitive Reading Directives</span>
                </div>
                <span className="boss-activity-dmg">+{currentBoss.damagePerQuest} DMG RECORDED</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Victory Extraction Spoils & Secondary Gatekeepers */}
        <div className="boss-col-stack">
          {/* Victory Extraction Spoils */}
          <div className="boss-bento-panel">
            <div className="boss-bento-panel-header">
              <div className="boss-bento-panel-title-group">
                <Trophy size={18} color="#ffb77d" />
                <span>VICTORY EXTRACTION SPOILS</span>
              </div>
              <span className="boss-bento-panel-subtag" style={{ color: "#ffb77d" }}>
                APEX BOUNTY
              </span>
            </div>

            <div className="boss-rewards-grid">
              <div className="boss-reward-tile">
                <div className="boss-reward-tile-header">
                  <span>EXPERIENCE</span>
                  <TrendingUp size={16} color="#ffb77d" />
                </div>
                <span className="boss-reward-tile-val" style={{ color: "#ffb77d" }}>
                  +{currentBoss.rewards.xp} XP
                </span>
                <span className="boss-reward-tile-desc">Hunter Player Level</span>
              </div>

              <div className="boss-reward-tile">
                <div className="boss-reward-tile-header">
                  <span>TREASURY</span>
                  <Coins size={16} color="#ffb77d" />
                </div>
                <span className="boss-reward-tile-val" style={{ color: "#ffb77d" }}>
                  +{currentBoss.rewards.coins} COINS
                </span>
                <span className="boss-reward-tile-desc">Armory Spendable</span>
              </div>

              {currentBoss.rewards.statBonus && (
                <div className="boss-reward-tile">
                  <div className="boss-reward-tile-header">
                    <span>PERMANENT STAT</span>
                    <Shield size={16} color="#ffb4ab" />
                  </div>
                  <span className="boss-reward-tile-val" style={{ color: "#ffb4ab" }}>
                    +{currentBoss.rewards.statBonus.amount} {currentBoss.rewards.statBonus.stat.toUpperCase()}
                  </span>
                  <span className="boss-reward-tile-desc">Passive Discipline Buff</span>
                </div>
              )}

              {currentBoss.rewards.title && (
                <div className="boss-reward-tile">
                  <div className="boss-reward-tile-header">
                    <span>HONORARY TITLE</span>
                    <Crown size={16} color="#dac0c8" />
                  </div>
                  <span className="boss-reward-tile-val" style={{ color: "#dac0c8", fontSize: "0.95rem" }}>
                    "{currentBoss.rewards.title}"
                  </span>
                  <span className="boss-reward-tile-desc">Legendary Hunter Title</span>
                </div>
              )}
            </div>

            {/* Sealed Chronos Chest */}
            <div className="boss-chronos-chest">
              <div className="boss-chronos-icon">
                <LockKeyhole size={24} />
              </div>
              <div className="boss-chronos-info">
                <span className="boss-chronos-title">SEALED CHRONOS CHEST</span>
                <span className="boss-chronos-desc">
                  Guaranteed rare equipment dropped directly into your Armory upon boss defeat.
                </span>
              </div>
              <span className="boss-chronos-badge">UNLOCKED AT 0%</span>
            </div>
          </div>

          {/* Secondary Rotation Quick-Switch Bay */}
          <div className="boss-bento-panel">
            <div className="boss-bento-panel-header">
              <div className="boss-bento-panel-title-group">
                <Swords size={18} color="#ac8884" />
                <span>ROTATION THREAT TELEMETRY</span>
              </div>
              <span className="boss-bento-panel-subtag">ALL ACTIVE ENTITIES</span>
            </div>

            <div className="boss-rotation-strip">
              {BOSSES.map((boss) => {
                const prog = bossProgressMap[boss.id] || {
                  currentHp: boss.maxHp,
                  defeated: false,
                  claimed: false,
                  totalDamageDealt: 0,
                };
                const bRem = Math.max(0, Math.min(boss.maxHp, prog.currentHp));
                const bPct = Math.round((bRem / boss.maxHp) * 100);
                const isSelected = boss.id === currentBoss.id;

                return (
                  <div
                    key={boss.id}
                    className={`boss-rotation-item ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setActiveCadence(boss.cadence);
                      setSelectedBossId(boss.id);
                    }}
                  >
                    <div className="boss-rotation-item-top">
                      <div className="boss-rotation-item-left">
                        <div className="boss-rotation-crest-socket">
                          <BossCrest bossId={boss.id} size={26} />
                        </div>
                        <div>
                          <span style={{ fontSize: "0.625rem", color: "#ac8884", textTransform: "uppercase" }}>
                            {boss.cadence} // {getBossRankBadge(boss).rank}
                          </span>
                          <h4 className="boss-rotation-item-name">{boss.name}</h4>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            color: bPct === 0 ? "#22c55e" : "#ffb4ab",
                          }}
                        >
                          {bPct}% HP
                        </span>
                        <ArrowRight size={14} color="#ac8884" />
                      </div>
                    </div>

                    <div style={{ width: "100%", height: 4, background: "#0e0e11", borderRadius: 9999, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${bPct}%`,
                          height: "100%",
                          background: bPct === 0 ? "#22c55e" : boss.avatarColor,
                          borderRadius: 9999,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>



      {/* Cinematic Boss Victory Overlay */}
      <BossVictoryModal
        isOpen={victoryBoss !== null}
        boss={victoryBoss}
        onClaim={() => setVictoryBoss(null)}
      />
    </div>
  );
}
