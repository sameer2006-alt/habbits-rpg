import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Crown, Sparkles, Zap, Award } from "lucide-react";
import type { RankDefinition } from "../types/game";
import RankBadge from "./RankBadge";

interface CinematicRankUpModalProps {
  newRank: RankDefinition | null;
  previousRank: RankDefinition | null;
  isOpen: boolean;
  onClaim: () => void;
}

export const CinematicRankUpModal: React.FC<CinematicRankUpModalProps> = ({
  newRank,
  previousRank,
  isOpen,
  onClaim,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Audio synth chime simulation or haptic feedback if available
      try {
        if ("vibrate" in navigator) {
          navigator.vibrate([100, 50, 200, 100, 300]);
        }
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen]);

  if (!isOpen || !newRank) return null;

  return (
    <AnimatePresence>
      <div className="rankup-cinematic-backdrop">
        {/* Pulsing Energy Shockwaves */}
        <div className="rankup-shockwave shockwave-1" />
        <div className="rankup-shockwave shockwave-2" />
        <div className="rankup-shockwave shockwave-3" />

        {/* Ambient Dark Particles */}
        <div className="rankup-ambient-flare" style={{ "--flare-color": newRank.glowColor } as React.CSSProperties} />

        <motion.div
          className="rankup-content-container"
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -30 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top System Alarm Banner */}
          <div className="rankup-system-badge">
            <Zap size={14} className="flash-icon" />
            <span>THE SYSTEM HAS RECOGNIZED YOUR PROWESS</span>
            <Zap size={14} className="flash-icon" />
          </div>

          <h1 className="rankup-headline">
            RANK ASCENSION
          </h1>

          <div className="rankup-subheadline">
            YOU HAVE TRANSCENDED YOUR PREVIOUS LIMITS
          </div>

          {/* Transformation Stage: Old Rank -> New Rank */}
          <div className="rankup-stage">
            {previousRank && (
              <div className="rankup-prev-badge">
                <RankBadge rankId={previousRank.id} size="md" />
                <span className="rankup-prev-label">{previousRank.badgeLabel}</span>
              </div>
            )}

            {previousRank && (
              <div className="rankup-arrow-divider">
                <ChevronRight size={24} className="arrow-pulse" />
                <ChevronRight size={24} className="arrow-pulse delay" />
              </div>
            )}

            <motion.div
              className="rankup-main-badge-wrapper"
              initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
              animate={{ scale: 1.1, rotate: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5, type: "spring", stiffness: 200 }}
            >
              <div className="badge-halo" style={{ background: newRank.glowColor }} />
              <RankBadge rankId={newRank.id} size="xl" />
            </motion.div>
          </div>

          {/* New Rank Titles */}
          <div className="rankup-title-block">
            <div className="rankup-tier-tag" style={{ color: newRank.color, borderColor: newRank.color }}>
              TIER {newRank.tierOrder + 1} HUNTER
            </div>
            <h2 className="rankup-rank-name" style={{ color: newRank.color }}>
              {newRank.name}
            </h2>
            <p className="rankup-lore-quote">"{newRank.lore}"</p>
          </div>

          {/* Newly Unlocked Perks */}
          <div className="rankup-perks-box">
            <div className="rankup-perks-title">
              <Sparkles size={15} style={{ color: newRank.color }} />
              <span>NEW POWERS & PRIVILEGES UNLOCKED</span>
            </div>
            <div className="rankup-perks-grid">
              {newRank.perks.map((perk, i) => (
                <div key={i} className="rankup-perk-item">
                  <Award size={14} style={{ color: newRank.color }} />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Claim Action */}
          <button
            className="rankup-claim-btn"
            onClick={onClaim}
            style={{
              background: `linear-gradient(135deg, ${newRank.bgGradient[0]}, ${newRank.color})`,
              boxShadow: `0 0 25px ${newRank.glowColor}`,
            }}
          >
            <Crown size={18} />
            <span>ACCEPT ASCENSION POWER</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CinematicRankUpModal;

