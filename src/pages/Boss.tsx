import { useState } from "react";
import { motion } from "framer-motion";
import { Skull, Swords, Trophy, Flame, Shield, Sparkles, CheckCircle2, Crown } from "lucide-react";
import { BOSSES, type BossDef, type BossCadence } from "../data/bosses";
import { getOrInitBossState, claimBossReward, type BossProgress } from "../lib/bossData";

interface BossProps {
  userId: string;
  playerLevel?: number;
  playerCoins?: number;
  onBossRewardClaimed: (reward: { xp: number; coins: number; statBonus?: { stat: string; amount: number }; title?: string }) => void;
}

export default function Boss({
  userId,
  playerLevel: _playerLevel,
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

  const [prevUserId, setPrevUserId] = useState(userId);
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setBossProgressMap(loadAllBossProgress(userId));
  }

  const reloadProgress = () => {
    setBossProgressMap(loadAllBossProgress(userId));
  };

  const activeBosses = BOSSES.filter((b) => b.cadence === activeCadence);

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
    }
  };

  return (
    <main>
      <div className="system-header">
        <h1>Raid Boss Arena</h1>

        <div className="inline-meta">
          <span className="value-badge" style={{ borderColor: "#ef4444", color: "#ef4444" }}>
            <Skull size={14} style={{ marginRight: 6 }} />
            Weekly & Monthly Raids
          </span>
          <span className="value-badge">
            <Swords size={14} style={{ marginRight: 6 }} />
            Quests Deal Damage
          </span>
        </div>
      </div>

      {/* Arena Overview Banner */}
      <div className="boss-arena-hero">
        <div className="boss-arena-hero-info">
          <div className="boss-arena-badge">
            <Flame size={14} color="#f97316" />
            <span>GLOBAL CHALLENGE DUNGEON</span>
          </div>
          <h2>Conquer Procrastination & Claim Sovereign Loot</h2>
          <p>
            Bosses possess massive HP pools that cannot be beaten in a single sitting. Every daily quest you complete strikes the active bosses for heavy damage! Clear them before the reset window to unlock huge XP, coin vaults, and legendary titles.
          </p>
        </div>
      </div>

      {/* Cadence Tabs */}
      <div className="filter-tabs" style={{ marginTop: 18 }}>
        <button
          type="button"
          className={`filter-tab ${activeCadence === "WEEKLY" ? "filter-tab-active" : ""}`}
          onClick={() => setActiveCadence("WEEKLY")}
        >
          <Flame size={14} style={{ marginRight: 6 }} />
          Weekly Bosses (7-Day Cycle)
        </button>
        <button
          type="button"
          className={`filter-tab ${activeCadence === "MONTHLY" ? "filter-tab-active" : ""}`}
          onClick={() => setActiveCadence("MONTHLY")}
        >
          <Crown size={14} style={{ marginRight: 6 }} />
          Monthly Apex Raids (30-Day Cycle)
        </button>
      </div>

      {/* Boss Cards Grid */}
      <div className="boss-grid" style={{ marginTop: 20 }}>
        {activeBosses.map((boss) => {
          const progress = bossProgressMap[boss.id] || {
            currentHp: boss.maxHp,
            defeated: false,
            claimed: false,
            totalDamageDealt: 0,
          };

          const remainingHp = Math.max(0, Math.min(boss.maxHp, progress.currentHp));
          const damageDealt = Math.max(0, boss.maxHp - remainingHp);
          const remainingPercent = Math.round((remainingHp / boss.maxHp) * 100);
          const completedPercent = Math.min(100, Math.round((damageDealt / boss.maxHp) * 100));
          const isDefeated = progress.defeated || remainingHp <= 0;
          const isClaimed = progress.claimed;
          const questsRemaining = isDefeated ? 0 : Math.ceil(remainingHp / boss.damagePerQuest);

          return (
            <motion.div
              key={boss.id}
              className={`boss-card ${isDefeated ? "boss-card-defeated" : ""}`}
              style={{
                "--boss-glow": boss.avatarGlow,
                "--boss-color": boss.avatarColor,
              } as React.CSSProperties}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Top Banner */}
              <div className="boss-card-header">
                <div className="boss-card-icon" style={{ borderColor: boss.avatarColor, color: boss.avatarColor }}>
                  <Skull size={32} />
                </div>
                <div>
                  <div className="boss-cadence-tag" style={{ color: boss.avatarColor }}>
                    {boss.subtitle.toUpperCase()}
                  </div>
                  <h3 className="boss-name">{boss.name}</h3>
                </div>
              </div>

              {/* Lore */}
              <p className="boss-lore">{boss.lore}</p>

              {/* HP Bar */}
              <div className="boss-hp-section">
                <div className="boss-hp-labels">
                  <span className="card-title">Boss Health Remaining</span>
                  <span className="mono-value">
                    {remainingHp} / {boss.maxHp} HP ({remainingPercent}% left)
                  </span>
                </div>
                <div className="boss-hp-track">
                  <motion.div
                    className="boss-hp-fill"
                    style={{
                      background: isDefeated
                        ? "#22c55e"
                        : `linear-gradient(90deg, ${boss.avatarColor}, #e63946)`,
                    }}
                    initial={{ width: `${remainingPercent}%` }}
                    animate={{ width: `${remainingPercent}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#9ca3af", marginTop: 6, marginBottom: 4 }}>
                  <span>
                    Raid Progress:{" "}
                    <strong style={{ color: isDefeated ? "#22c55e" : "#f59e0b" }}>
                      {damageDealt} / {boss.maxHp} DMG ({completedPercent}% defeated)
                    </strong>
                  </span>
                  <span>
                    Quests Needed:{" "}
                    <strong style={{ color: "#e5e7eb" }}>
                      {isDefeated ? "Defeated!" : `~${questsRemaining} left`}
                    </strong>
                  </span>
                </div>
                <div className="boss-damage-rate">
                  <Swords size={12} color="#c9a876" style={{ marginRight: 4 }} />
                  <span>Each quest deals <strong>+{boss.damagePerQuest} DMG</strong> to this boss</span>
                </div>
              </div>

              {/* Rewards Box */}
              <div className="boss-loot-box">
                <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <Trophy size={14} color="#ffd700" />
                  <span>Victory Spoils</span>
                </div>
                <div className="boss-loot-grid">
                  <div className="stat-pill">
                    <span className="card-title">XP Bounty</span>
                    <strong style={{ color: "#22c55e" }}>+{boss.rewards.xp} XP</strong>
                  </div>
                  <div className="stat-pill">
                    <span className="card-title">Soul Coins</span>
                    <strong style={{ color: "#ffd700" }}>+{boss.rewards.coins} 🪙</strong>
                  </div>
                  {boss.rewards.statBonus && (
                    <div className="stat-pill">
                      <span className="card-title">Stat Bonus</span>
                      <strong style={{ color: "#60a5fa" }}>
                        +{boss.rewards.statBonus.amount} {boss.rewards.statBonus.stat.toUpperCase()}
                      </strong>
                    </div>
                  )}
                  {boss.rewards.title && (
                    <div className="stat-pill">
                      <span className="card-title">Special Title</span>
                      <strong style={{ color: "#c084fc", fontSize: "0.75rem" }}>"{boss.rewards.title}"</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="boss-card-action" style={{ marginTop: 16 }}>
                {isDefeated ? (
                  isClaimed ? (
                    <div className="boss-claimed-badge">
                      <CheckCircle2 size={16} color="#22c55e" style={{ marginRight: 6 }} />
                      <span>VICTORY SPOILS CLAIMED</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="primary boss-claim-btn"
                      onClick={() => handleClaim(boss)}
                    >
                      <Sparkles size={16} style={{ marginRight: 6 }} />
                      CLAIM EPIC LOOT ({boss.rewards.xp} XP + {boss.rewards.coins} COINS)
                    </button>
                  )
                ) : (
                  <div className="boss-engaged-status">
                    <Shield size={14} style={{ marginRight: 6 }} />
                    <span>RAID IN PROGRESS — COMPLETE QUESTS TO STRIKE</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}

