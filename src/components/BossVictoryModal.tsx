import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Swords } from "lucide-react";
import type { BossDef } from "../data/bosses";
import "./BossVictoryModal.css";

const BOSS_ART_MAP: Record<string, string> = {
  weekly_ignis: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
  weekly_vortex: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop",
  weekly_gorgon: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop",
  monthly_malakor: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
  monthly_titan: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop",
  monthly_abyss: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop",
};

interface BossVictoryModalProps {
  isOpen: boolean;
  boss: BossDef | null;
  onClaim: () => void;
  rewardOverride?: {
    xp?: number;
    coins?: number;
    statBonus?: { stat: string; amount: number };
    title?: string;
    itemId?: string;
  };
}

export const BossVictoryModal: React.FC<BossVictoryModalProps> = ({
  isOpen,
  boss,
  onClaim,
  rewardOverride,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClaim();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClaim]);

  if (!isOpen || !boss) return null;

  const xpReward = rewardOverride?.xp ?? boss.rewards.xp;
  const coinsReward = rewardOverride?.coins ?? boss.rewards.coins;
  const statReward = rewardOverride?.statBonus ?? boss.rewards.statBonus;
  const titleReward = rewardOverride?.title ?? boss.rewards.title;
  const bossImage = BOSS_ART_MAP[boss.id] || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop";

  return (
    <AnimatePresence>
      <div className="boss-victory-backdrop" role="dialog" aria-modal="true" aria-label="Boss Victory Modal">
        {/* Ambient Vortex Flare */}
        <div className="boss-ambient-vortex" aria-hidden="true" />

        <motion.div
          className="boss-victory-container"
          initial={{ opacity: 0, scale: 0.82, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.82, y: -30 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top System Directive Tag */}
          <div className="boss-directive-strip">
            <span className="boss-pulse-dot" aria-hidden="true" />
            <span>[ SYSTEM DIRECTIVE // PROTOCOL: RAID-VICTORY-RESOLVE ]</span>
          </div>

          {/* Hero Headline */}
          <h1 className="boss-hero-title">
            BOSS <span className="accent-defeated">DEFEATED</span>
          </h1>

          <p className="boss-lore-quote">
            “The shadow entity’s temporal distortion has collapsed. Discipline reigns supreme.”
          </p>

          {/* Boss Portrait in Collapsing Energy Frame */}
          <div className="boss-avatar-frame">
            <img
              src={bossImage}
              alt={boss.name}
              className="boss-avatar-img"
            />
            <div className="boss-scrim-overlay" aria-hidden="true" />
            <div className="boss-stamp-banner">
              [ DEFEATED // HP: 0 / {boss.maxHp.toLocaleString()} ]
            </div>
          </div>

          {/* Boss Metadata */}
          <h2 className="boss-name">{boss.name}</h2>
          <div className="boss-subtitle-row">
            <span>DESIGNATION: {boss.subtitle.toUpperCase()}</span>
            <span>•</span>
            <span style={{ color: boss.avatarColor }}>{boss.cadence} RAID</span>
          </div>

          {/* Depleted HP Bar */}
          <div className="boss-hp-bar">
            <div className="boss-hp-track">
              <div className="boss-hp-fill" />
            </div>
            <div className="boss-hp-labels">
              <span>HP: 0.00%</span>
              <span style={{ color: "#ef4444" }}>TARGET INTEGRITY TERMINATED</span>
            </div>
          </div>

          {/* Extraction Spoils Breakdown */}
          <div className="boss-spoils-grid">
            <div className="boss-spoil-cell">
              <span className="spoil-label">EXP REWARD</span>
              <span className="spoil-val xp">+{xpReward.toLocaleString()} XP</span>
            </div>

            <div className="boss-spoil-cell">
              <span className="spoil-label">GOLD BOUNTY</span>
              <span className="spoil-val coins">+{coinsReward} COINS</span>
            </div>

            {statReward && (
              <div className="boss-spoil-cell">
                <span className="spoil-label">STAT TRAIT</span>
                <span className="spoil-val stat">
                  +{statReward.amount} {statReward.stat.slice(0, 3).toUpperCase()}
                </span>
              </div>
            )}

            {titleReward && (
              <div className="boss-spoil-cell">
                <span className="spoil-label">EXCLUSIVE TITLE</span>
                <span className="spoil-val title">"{titleReward}"</span>
              </div>
            )}
          </div>

          {/* Harvest Spoils CTA */}
          <button
            type="button"
            className="boss-harvest-btn"
            onClick={onClaim}
          >
            <Swords size={18} aria-hidden="true" />
            <span>HARVEST BOSS SPOILS &amp; CONTINUE</span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BossVictoryModal;
