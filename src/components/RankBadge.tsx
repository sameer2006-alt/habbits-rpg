import React from "react";
import { getRankDefinition } from "../data/ranks";
import { Crown, Flame, Shield, Sparkles, Zap } from "lucide-react";

interface RankBadgeProps {
  rankId: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  showName?: boolean;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

const sizeConfig = {
  xs: { box: 26, font: 11, iconSize: 10, stroke: 1.5 },
  sm: { box: 38, font: 14, iconSize: 13, stroke: 2 },
  md: { box: 54, font: 19, iconSize: 16, stroke: 2.5 },
  lg: { box: 80, font: 28, iconSize: 22, stroke: 3 },
  xl: { box: 110, font: 40, iconSize: 32, stroke: 3.5 },
};

export const RankBadge: React.FC<RankBadgeProps> = ({
  rankId,
  size = "md",
  showLabel = false,
  showName = false,
  className = "",
  onClick,
  interactive = false,
}) => {
  const rank = getRankDefinition(rankId);
  const cfg = sizeConfig[size] || sizeConfig.md;
  const isHighTier = rank.tierOrder >= 6; // S, SS, Heroic, Legendary
  const isGodTier = rank.tierOrder >= 8; // Heroic, Legendary

  // Unique top accent icon for higher ranks
  const getCrestIcon = () => {
    if (rank.id === "LEGENDARY") return <Sparkles size={cfg.iconSize} className="crest-icon god" />;
    if (rank.id === "HEROIC") return <Crown size={cfg.iconSize} className="crest-icon heroic" />;
    if (rank.id === "SS") return <Zap size={cfg.iconSize} className="crest-icon ss" />;
    if (rank.id === "S") return <Crown size={cfg.iconSize} className="crest-icon s" />;
    if (rank.id === "A") return <Flame size={cfg.iconSize} className="crest-icon a" />;
    if (rank.id === "B") return <Shield size={cfg.iconSize} className="crest-icon b" />;
    return null;
  };

  return (
    <div
      className={`rank-badge-wrapper size-${size} ${interactive ? "interactive-badge" : ""} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={
        {
          "--rank-color": rank.color,
          "--rank-glow": rank.glowColor,
          "--rank-bg-1": rank.bgGradient[0],
          "--rank-bg-2": rank.bgGradient[1],
        } as React.CSSProperties
      }
    >
      <div
        className={`rank-crest tier-${rank.tierOrder} ${isHighTier ? "high-tier" : ""} ${
          isGodTier ? "god-tier" : ""
        }`}
        style={{
          width: cfg.box,
          height: cfg.box,
        }}
      >
        {/* Outer Radiant Aura Ring */}
        <div className="rank-aura-ring" />

        {/* Top Crest Accessory for High Tiers */}
        {size !== "xs" && getCrestIcon()}

        {/* SVG Shield / Diamond Crest Geometry */}
        <svg
          viewBox="0 0 100 100"
          className="rank-crest-svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`grad-${rank.id}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={rank.bgGradient[0]} />
              <stop offset="100%" stopColor={rank.bgGradient[1]} />
            </linearGradient>
            <filter id={`glow-${rank.id}-${size}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation={cfg.stroke * 1.5} floodColor={rank.color} floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Octagon / Diamond Shield Body */}
          <polygon
            points="50,4 92,25 92,75 50,96 8,75 8,25"
            fill={`url(#grad-${rank.id}-${size})`}
            stroke={rank.color}
            strokeWidth={cfg.stroke * 1.2}
            className="rank-shield-outer"
          />

          {/* Inner Accent Inscription */}
          <polygon
            points="50,12 84,29 84,71 50,88 16,71 16,29"
            fill="none"
            stroke={rank.color}
            strokeWidth={cfg.stroke * 0.5}
            strokeOpacity="0.35"
            strokeDasharray={isHighTier ? "6,3" : "none"}
            className="rank-shield-inner"
          />
        </svg>

        {/* Main Rank Letter / Symbol */}
        <div
          className="rank-symbol"
          style={{
            fontSize: rank.symbol.length > 2 ? cfg.font * 0.65 : cfg.font,
            color: rank.color,
            textShadow: `0 0 ${cfg.stroke * 3}px ${rank.glowColor}, 0 2px 4px rgba(0,0,0,0.8)`,
          }}
        >
          {rank.symbol.length <= 3 ? rank.symbol : rank.id.slice(0, 3)}
        </div>

        {/* High Tier Radiant Sparkles */}
        {isGodTier && size !== "xs" && (
          <div className="god-tier-sparks">
            <span className="spark spark-1" />
            <span className="spark spark-2" />
          </div>
        )}
      </div>

      {/* Optional Metadata Labels */}
      {(showLabel || showName) && (
        <div className="rank-badge-info">
          {showLabel && (
            <span
              className="rank-badge-tag"
              style={{ color: rank.color, borderColor: rank.color }}
            >
              {rank.badgeLabel}
            </span>
          )}
          {showName && <span className="rank-badge-name">{rank.name}</span>}
        </div>
      )}
    </div>
  );
};

export default RankBadge;

