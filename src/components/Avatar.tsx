import { motion } from "framer-motion";
import { AVATAR_PRESETS, type AvatarPreset } from "../data/avatars";

interface AvatarProps {
  level: number;
  rank: string;
  size?: number;
  avatarId?: string;
  showRank?: boolean;
  showLevel?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

import { getRankDefinition } from "../data/ranks";

function getRankColors(rank: string) {
  const def = getRankDefinition(rank);
  return {
    aura: def.glowColor,
    badge: def.color,
    glow: def.color,
  };
}

export default function Avatar({
  level,
  rank,
  size = 96,
  avatarId,
  showRank = true,
  showLevel = true,
  interactive = false,
  onClick,
}: AvatarProps) {
  const colors = getRankColors(rank);
  const preset: AvatarPreset =
    AVATAR_PRESETS.find((p) => p.id === avatarId) ?? AVATAR_PRESETS[0];

  const half = size / 2;
  const outerR = half - 4;
  const innerR = half - 11;
  const scale = size / 100;

  const isFemale = preset.gender === "female";
  const cat = preset.category;
  const skin = preset.skinColor;
  const hair = preset.hairColor;
  const accent = preset.accentColor;

  return (
    <div
      className={`avatar-wrapper ${interactive ? "avatar-interactive" : ""}`}
      style={{ width: size, height: size + (showRank ? 16 : 0) }}
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <motion.svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <defs>
          {/* Preset Background Gradient */}
          <radialGradient id={`avatar-bg-${preset.id}-${size}`} cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor={preset.bgGradient[0]} />
            <stop offset="100%" stopColor={preset.bgGradient[1]} />
          </radialGradient>

          {/* Aura glow filter */}
          <filter id={`avatar-glow-${size}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip path inside portrait circle */}
          <clipPath id={`avatar-clip-${preset.id}-${size}`}>
            <circle cx={half} cy={half} r={innerR} />
          </clipPath>
        </defs>

        {/* Outer aura ring */}
        <circle
          cx={half}
          cy={half}
          r={outerR}
          fill="none"
          stroke={colors.badge}
          strokeWidth="2"
          opacity="0.45"
          filter={`url(#avatar-glow-${size})`}
        />

        {/* Background circle */}
        <circle
          cx={half}
          cy={half}
          r={innerR}
          fill={`url(#avatar-bg-${preset.id}-${size})`}
          stroke={colors.badge}
          strokeWidth="1.5"
        />

        {/* Character illustration group clipped to circle */}
        <g clipPath={`url(#avatar-clip-${preset.id}-${size})`}>
          {/* Subtle magical/cyber background elements */}
          {cat === "cyber" && (
            <g opacity="0.25" stroke={accent} strokeWidth="1">
              <line x1={half - 30 * scale} y1={half - 15 * scale} x2={half + 30 * scale} y2={half - 15 * scale} strokeDasharray="3 3" />
              <line x1={half - 25 * scale} y1={half + 5 * scale} x2={half + 25 * scale} y2={half + 5 * scale} strokeDasharray="2 4" />
              <circle cx={half} cy={half - 20 * scale} r={28 * scale} fill="none" strokeDasharray="4 4" />
            </g>
          )}

          {cat === "mage" && (
            <g opacity="0.3">
              <circle cx={half} cy={half - 10 * scale} r={26 * scale} fill="none" stroke={accent} strokeWidth="1" strokeDasharray="2 3" />
              <polygon points={`${half},${half - 36 * scale} ${half + 18 * scale},${half - 5 * scale} ${half - 18 * scale},${half - 5 * scale}`} fill="none" stroke={accent} strokeWidth="0.8" opacity="0.5" />
            </g>
          )}

          {cat === "royal" && (
            <g opacity="0.25">
              <polygon points={`${half},${half - 38 * scale} ${half + 14 * scale},${half - 20 * scale} ${half},${half - 2 * scale} ${half - 14 * scale},${half - 20 * scale}`} fill={accent} opacity="0.35" />
            </g>
          )}

          {/* Long Hair Back for females */}
          {isFemale && (
            <path
              d={`M ${half - 20 * scale} ${half - 10 * scale}
                  C ${half - 24 * scale} ${half + 16 * scale}, ${half - 18 * scale} ${half + 38 * scale}, ${half - 10 * scale} ${half + 45 * scale}
                  L ${half + 10 * scale} ${half + 45 * scale}
                  C ${half + 18 * scale} ${half + 38 * scale}, ${half + 24 * scale} ${half + 16 * scale}, ${half + 20 * scale} ${half - 10 * scale}
                  Z`}
              fill={hair}
              opacity="0.9"
            />
          )}

          {/* Torso / Armor / Clothing */}
          <path
            d={`M ${half - 30 * scale} ${half + 45 * scale}
                Q ${half - 28 * scale} ${half + 14 * scale}, ${half} ${half + 16 * scale}
                Q ${half + 28 * scale} ${half + 14 * scale}, ${half + 30 * scale} ${half + 45 * scale}
                Z`}
            fill="#120c18"
          />

          {/* Armor / Outfit Overlays by Category */}
          {cat === "warrior" || cat === "royal" ? (
            <path
              d={`M ${half - 22 * scale} ${half + 45 * scale}
                  L ${half - 14 * scale} ${half + 19 * scale}
                  L ${half} ${half + 26 * scale}
                  L ${half + 14 * scale} ${half + 19 * scale}
                  L ${half + 22 * scale} ${half + 45 * scale}
                  Z`}
              fill={accent}
              opacity="0.8"
            />
          ) : cat === "rogue" ? (
            <path
              d={`M ${half - 18 * scale} ${half + 45 * scale}
                  Q ${half} ${half + 20 * scale}, ${half + 18 * scale} ${half + 45 * scale}
                  Z`}
              fill="#271836"
              stroke={accent}
              strokeWidth="1"
            />
          ) : cat === "cyber" ? (
            <g>
              <path
                d={`M ${half - 22 * scale} ${half + 45 * scale}
                    L ${half - 12 * scale} ${half + 22 * scale}
                    L ${half + 12 * scale} ${half + 22 * scale}
                    L ${half + 22 * scale} ${half + 45 * scale}
                    Z`}
                fill="#152736"
              />
              <line x1={half} y1={half + 22 * scale} x2={half} y2={half + 45 * scale} stroke={accent} strokeWidth="1.5" />
            </g>
          ) : (
            /* Monk / Mage */
            <path
              d={`M ${half - 16 * scale} ${half + 45 * scale}
                  L ${half} ${half + 22 * scale}
                  L ${half + 16 * scale} ${half + 45 * scale}
                  Z`}
              fill={accent}
              opacity="0.6"
            />
          )}

          {/* Neck */}
          <rect
            x={half - 5 * scale}
            y={half + 4 * scale}
            width={10 * scale}
            height={12 * scale}
            fill={skin}
            opacity="0.9"
          />

          {/* Head */}
          <ellipse
            cx={half}
            cy={half - 6 * scale}
            rx={14 * scale}
            ry={17 * scale}
            fill={skin}
          />

          {/* Facial features - Eyes */}
          {cat === "cyber" ? (
            /* Cyber Visor */
            <rect
              x={half - 11 * scale}
              y={half - 8 * scale}
              width={22 * scale}
              height={5 * scale}
              rx={2 * scale}
              fill={accent}
              opacity="0.9"
            />
          ) : cat === "rogue" ? (
            /* Stealth Eyes + Mask */
            <g>
              <ellipse cx={half - 5 * scale} cy={half - 7 * scale} rx={2 * scale} ry={1.2 * scale} fill="#ffffff" />
              <ellipse cx={half + 5 * scale} cy={half - 7 * scale} rx={2 * scale} ry={1.2 * scale} fill="#ffffff" />
              <circle cx={half - 5 * scale} cy={half - 7 * scale} r={0.9 * scale} fill={accent} />
              <circle cx={half + 5 * scale} cy={half - 7 * scale} r={0.9 * scale} fill={accent} />
              {/* Lower mask */}
              <path
                d={`M ${half - 11 * scale} ${half - 2 * scale}
                    Q ${half} ${half + 10 * scale}, ${half + 11 * scale} ${half - 2 * scale}
                    Z`}
                fill="#160e22"
              />
            </g>
          ) : (
            /* Standard expressive eyes */
            <g>
              <ellipse cx={half - 5 * scale} cy={half - 7 * scale} rx={2.2 * scale} ry={1.5 * scale} fill="#ffffff" />
              <ellipse cx={half + 5 * scale} cy={half - 7 * scale} rx={2.2 * scale} ry={1.5 * scale} fill="#ffffff" />
              <circle cx={half - 5 * scale} cy={half - 7 * scale} r={1.1 * scale} fill={accent} />
              <circle cx={half + 5 * scale} cy={half - 7 * scale} r={1.1 * scale} fill={accent} />
              {/* Eyebrows */}
              <line x1={half - 8 * scale} y1={half - 11 * scale} x2={half - 3 * scale} y2={half - 10 * scale} stroke={hair} strokeWidth="1.2" strokeLinecap="round" />
              <line x1={half + 3 * scale} y1={half - 10 * scale} x2={half + 8 * scale} y2={half - 11 * scale} stroke={hair} strokeWidth="1.2" strokeLinecap="round" />
              {/* Mouth */}
              <path d={`M ${half - 3 * scale} ${half + 4 * scale} Q ${half} ${half + 5.5 * scale}, ${half + 3 * scale} ${half + 4 * scale}`} fill="none" stroke="#683434" strokeWidth="1" strokeLinecap="round" />
            </g>
          )}

          {/* Hair Front / Style */}
          {isFemale ? (
            <g>
              {/* Flowing side bangs */}
              <path
                d={`M ${half - 14 * scale} ${half - 6 * scale}
                    Q ${half - 15 * scale} ${half - 23 * scale}, ${half} ${half - 23 * scale}
                    Q ${half + 15 * scale} ${half - 23 * scale}, ${half + 14 * scale} ${half - 6 * scale}
                    C ${half + 11 * scale} ${half - 2 * scale}, ${half + 13 * scale} ${half + 12 * scale}, ${half + 17 * scale} ${half + 22 * scale}
                    L ${half + 11 * scale} ${half + 15 * scale}
                    Q ${half} ${half - 13 * scale}, ${half - 11 * scale} ${half + 15 * scale}
                    L ${half - 17 * scale} ${half + 22 * scale}
                    C ${half - 13 * scale} ${half + 12 * scale}, ${half - 11 * scale} ${half - 2 * scale}, ${half - 14 * scale} ${half - 6 * scale}
                    Z`}
                fill={hair}
              />
            </g>
          ) : (
            /* Male Hair */
            <g>
              {preset.id === "m_iron_monk" ? (
                /* Monk Headband */
                <rect x={half - 13 * scale} y={half - 15 * scale} width={26 * scale} height={4 * scale} rx={2} fill={accent} />
              ) : (
                /* Male Styled / Spiky / Swept Hair */
                <path
                  d={`M ${half - 15 * scale} ${half - 8 * scale}
                      Q ${half - 16 * scale} ${half - 24 * scale}, ${half - 4 * scale} ${half - 26 * scale}
                      L ${half} ${half - 23 * scale}
                      L ${half + 6 * scale} ${half - 27 * scale}
                      Q ${half + 16 * scale} ${half - 22 * scale}, ${half + 15 * scale} ${half - 8 * scale}
                      L ${half + 11 * scale} ${half - 13 * scale}
                      L ${half + 5 * scale} ${half - 10 * scale}
                      L ${half} ${half - 15 * scale}
                      L ${half - 6 * scale} ${half - 11 * scale}
                      Z`}
                  fill={hair}
                />
              )}
            </g>
          )}

          {/* Head accessory: Crown / Circlet / Runes */}
          {preset.category === "royal" && (
            <path
              d={`M ${half - 8 * scale} ${half - 20 * scale}
                  L ${half - 5 * scale} ${half - 26 * scale}
                  L ${half} ${half - 21 * scale}
                  L ${half + 5 * scale} ${half - 26 * scale}
                  L ${half + 8 * scale} ${half - 20 * scale}
                  Z`}
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="0.8"
            />
          )}

          {preset.category === "warrior" && preset.id === "f_valkyrie" && (
            /* Valkyrie Winged Wings on Head */
            <g fill={accent} opacity="0.9">
              <polygon points={`${half - 13 * scale},${half - 16 * scale} ${half - 22 * scale},${half - 24 * scale} ${half - 12 * scale},${half - 11 * scale}`} />
              <polygon points={`${half + 13 * scale},${half - 16 * scale} ${half + 22 * scale},${half - 24 * scale} ${half + 12 * scale},${half - 11 * scale}`} />
            </g>
          )}

          {/* Preset Archetype Emblem in bottom corner of circle */}
          <text
            x={half + 10 * scale}
            y={half + 25 * scale}
            fontSize={`${12 * scale}px`}
            textAnchor="middle"
            filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.8))"
          >
            {preset.emoji}
          </text>
        </g>

        {/* Animated Rank Emblem Ring */}
        <motion.circle
          cx={half}
          cy={half}
          r={outerR - 2}
          fill="none"
          stroke={colors.badge}
          strokeWidth="1.2"
          strokeDasharray={`${Math.PI * 2 * (outerR - 2)}`}
          strokeDashoffset={`${Math.PI * 2 * (outerR - 2) * 0.3}`}
          opacity="0.65"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />
      </motion.svg>

      {/* Level badge */}
      {showLevel && (
        <div
          className="avatar-level-badge"
          style={{ borderColor: colors.badge, boxShadow: `0 0 8px ${colors.glow}40` }}
        >
          {level}
        </div>
      )}

      {/* Rank label */}
      {showRank && (
        <div className="avatar-rank" style={{ color: colors.badge }}>
          {getRankDefinition(rank).badgeLabel}
        </div>
      )}
    </div>
  );
}

