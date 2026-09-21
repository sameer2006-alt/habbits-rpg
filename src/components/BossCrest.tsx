import React from "react";
import { normalizeBossKey } from "../lib/bossCrestUtils";
export type { BossKey } from "../lib/bossCrestUtils";

export interface BossCrestProps {
  bossId: string;
  size?: "xs" | "sm" | "md" | "lg" | "hero" | number;
  className?: string;
  watermark?: boolean;
  style?: React.CSSProperties;
}

const SIZE_MAP: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 44,
  lg: 60,
  hero: 380,
};

export const BossCrest: React.FC<BossCrestProps> = ({
  bossId,
  size = "md",
  className = "",
  watermark = false,
  style = {},
}) => {
  const bossKey = normalizeBossKey(bossId);
  const dimension = typeof size === "number" ? size : SIZE_MAP[size] || 44;

  const watermarkStyle: React.CSSProperties = watermark
    ? {
        opacity: 0.22,
        filter: "drop-shadow(0 0 35px var(--boss-glow, rgba(220, 38, 38, 0.4)))",
      }
    : {
        filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6))",
      };

  return (
    <div
      className={`boss-crest boss-crest--${bossKey} ${watermark ? "boss-crest--watermark" : ""} ${className}`}
      style={{
        width: dimension,
        height: dimension,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...watermarkStyle,
        ...style,
      }}
    >
      {bossKey === "ignis" && <IgnisCrestSvg watermark={watermark} />}
      {bossKey === "vortex" && <VortexCrestSvg watermark={watermark} />}
      {bossKey === "malakor" && <MalakorCrestSvg watermark={watermark} />}
      {bossKey === "leviathan" && <LeviathanCrestSvg watermark={watermark} />}
    </div>
  );
};

/* ==========================================================================
   BOSS 1: IGNIS — FLAME / EMBER CORE / BURNING SPIRE CREST
   ========================================================================== */
function IgnisCrestSvg({ watermark }: { watermark?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ignisFlameGrad" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff7849" />
          <stop offset="35%" stopColor="#ef4444" />
          <stop offset="75%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>
        <linearGradient id="ignisEmberCore" x1="50" y1="45" x2="50" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff176" />
          <stop offset="40%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <filter id="ignisGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Faceted Diamond Shield Frame */}
      <polygon
        points="50,6 88,38 78,84 50,96 22,84 12,38"
        stroke="url(#ignisFlameGrad)"
        strokeWidth={watermark ? "2" : "2.5"}
        strokeLinejoin="round"
        fill="#180a0c"
        fillOpacity="0.85"
      />

      {/* Outer Flame Spikes */}
      <path
        d="M26 38 C28 26, 38 18, 50 8 C62 18, 72 26, 74 38 C68 34, 62 34, 58 40 C66 48, 72 62, 70 76 C64 68, 62 60, 58 58 C60 70, 56 82, 50 90 C44 82, 40 70, 42 58 C38 60, 36 68, 30 76 C28 62, 34 48, 42 40 C38 34, 32 34, 26 38 Z"
        fill="url(#ignisFlameGrad)"
        stroke="#ff7849"
        strokeWidth="1.2"
        strokeLinejoin="round"
        filter="url(#ignisGlow)"
      />

      {/* Central Towering Blazing Spire */}
      <path
        d="M50 14 C47 28, 41 42, 41 58 C41 72, 46 82, 50 88 C54 82, 59 72, 59 58 C59 42, 53 28, 50 14 Z"
        fill="#26080b"
        stroke="url(#ignisFlameGrad)"
        strokeWidth="1.5"
      />

      {/* Inner Glowing Ember Crystal Core */}
      <polygon
        points="50,44 60,58 50,74 40,58"
        fill="url(#ignisEmberCore)"
        stroke="#ffffff"
        strokeWidth="1"
      />

      {/* Spark Diamonds */}
      <polygon points="50,30 52,34 50,38 48,34" fill="#fff176" />
      <polygon points="34,26 36,30 34,34 32,30" fill="#f97316" />
      <polygon points="66,26 68,30 66,34 64,30" fill="#f97316" />
    </svg>
  );
}

/* ==========================================================================
   BOSS 2: VORTEX — SPIRAL CYCLONE / DISTORTION / EYE OF SINGULARITY
   ========================================================================== */
function VortexCrestSvg({ watermark }: { watermark?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="vortexBladeGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="60%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#1e0508" />
        </linearGradient>
        <linearGradient id="vortexCyanHighlight" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#042f2e" />
        </linearGradient>
      </defs>

      {/* Outer Runic Distortion Ring */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke="url(#vortexBladeGrad)"
        strokeWidth={watermark ? "1.5" : "2"}
        strokeDasharray="14 6 4 6"
        fill="#12080a"
        fillOpacity="0.85"
      />

      {/* Secondary Concentric Calibration Track */}
      <circle
        cx="50"
        cy="50"
        r="38"
        stroke="rgba(220, 38, 38, 0.35)"
        strokeWidth="1"
        strokeDasharray="2 6"
      />

      {/* Triple Interlocking Cyclone Spiral Blades */}
      <g transform="rotate(15 50 50)">
        {/* Blade 1 */}
        <path
          d="M50 12 C68 12, 86 28, 86 50 C86 64, 76 76, 64 80 C60 72, 62 60, 56 54 C50 48, 42 50, 44 42 C46 32, 54 26, 50 12 Z"
          fill="url(#vortexBladeGrad)"
          stroke="url(#vortexCyanHighlight)"
          strokeWidth="1.2"
        />

        {/* Blade 2 (Rotated 120 deg) */}
        <path
          d="M50 12 C68 12, 86 28, 86 50 C86 64, 76 76, 64 80 C60 72, 62 60, 56 54 C50 48, 42 50, 44 42 C46 32, 54 26, 50 12 Z"
          fill="url(#vortexBladeGrad)"
          stroke="url(#vortexCyanHighlight)"
          strokeWidth="1.2"
          transform="rotate(120 50 50)"
        />

        {/* Blade 3 (Rotated 240 deg) */}
        <path
          d="M50 12 C68 12, 86 28, 86 50 C86 64, 76 76, 64 80 C60 72, 62 60, 56 54 C50 48, 42 50, 44 42 C46 32, 54 26, 50 12 Z"
          fill="url(#vortexBladeGrad)"
          stroke="url(#vortexCyanHighlight)"
          strokeWidth="1.2"
          transform="rotate(240 50 50)"
        />
      </g>

      {/* Central Singularity Eye & Cyan Aperture */}
      <circle cx="50" cy="50" r="10" fill="#0c0709" stroke="#dc2626" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="6" fill="#180407" stroke="#22d3ee" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="2.5" fill="#ffffff" />
    </svg>
  );
}

/* ==========================================================================
   BOSS 3: MALAKOR — FRACTURED SOVEREIGN MONARCH CROWN
   ========================================================================== */
function MalakorCrestSvg({ watermark }: { watermark?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="malakorDarkCrown" x1="50" y1="8" x2="50" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="25%" stopColor="#991b1b" />
          <stop offset="70%" stopColor="#450a0a" />
          <stop offset="100%" stopColor="#1a0406" />
        </linearGradient>
        <linearGradient id="malakorGoldTrim" x1="16" y1="74" x2="84" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="malakorEyeGlow" x1="50" y1="42" x2="50" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="50%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
      </defs>

      {/* Outer Monumental Hexagonal Shield Base */}
      <polygon
        points="50,4 90,24 90,72 50,96 10,72 10,24"
        stroke="rgba(220, 38, 38, 0.4)"
        strokeWidth={watermark ? "1.5" : "2"}
        fill="#140608"
        fillOpacity="0.9"
      />

      {/* 5-Pointed Fractured Sovereign Crown Silhouette */}
      <path
        d="M16 68 L14 36 L28 46 L38 22 L50 8 L62 22 L72 46 L86 36 L84 68 Z"
        fill="url(#malakorDarkCrown)"
        stroke="#dc2626"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Central Spire Inset Facet */}
      <path
        d="M50 16 L56 34 L50 44 L44 34 Z"
        fill="#2a080d"
        stroke="url(#malakorGoldTrim)"
        strokeWidth="1"
      />

      {/* Throne Base Band with Gold Trim */}
      <polygon
        points="18,68 82,68 84,80 16,80"
        fill="#26060a"
        stroke="url(#malakorGoldTrim)"
        strokeWidth="1.5"
      />

      {/* Inset Gold Runes on Base Band */}
      <line x1="30" y1="74" x2="42" y2="74" stroke="url(#malakorGoldTrim)" strokeWidth="2" />
      <circle cx="50" cy="74" r="2.5" fill="#fbbf24" />
      <line x1="58" y1="74" x2="70" y2="74" stroke="url(#malakorGoldTrim)" strokeWidth="2" />

      {/* Central Sovereign Monolith Eye / Core Sigil */}
      <polygon
        points="50,44 62,56 50,68 38,56"
        fill="url(#malakorEyeGlow)"
        stroke="#fbbf24"
        strokeWidth="1.2"
      />
      <circle cx="50" cy="56" r="3" fill="#ffffff" />

      {/* Monarch Gold Accents on Crown Spire Tips */}
      <polygon points="50,6 52,10 50,14 48,10" fill="#fbbf24" />
      <polygon points="38,20 40,24 38,28 36,24" fill="#d97706" />
      <polygon points="62,20 64,24 62,28 60,24" fill="#d97706" />
    </svg>
  );
}

/* ==========================================================================
   BOSS 4: LEVIATHAN — ABYSSAL SERPENT / DEEP SEA TIDAL WAVE SIGIL
   ========================================================================== */
function LeviathanCrestSvg({ watermark }: { watermark?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="leviathanAbyssGrad" x1="50" y1="6" x2="50" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="40%" stopColor="#991b1b" />
          <stop offset="85%" stopColor="#450a0a" />
          <stop offset="100%" stopColor="#080305" />
        </linearGradient>
        <linearGradient id="leviathanCyanWave" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#0e7490" />
          <stop offset="100%" stopColor="#083344" />
        </linearGradient>
      </defs>

      {/* Outer Coiled Ring with Dorsal Spine Notches */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke="url(#leviathanAbyssGrad)"
        strokeWidth={watermark ? "1.5" : "2.5"}
        fill="#0b080a"
        fillOpacity="0.9"
      />

      {/* Serpent Coiled Body Forming an Ominous Crescent & Wave */}
      <path
        d="M50 10 C66 10, 84 24, 86 44 C88 64, 76 82, 54 88 C34 94, 16 80, 14 62 C12 46, 22 36, 32 36 C42 36, 44 48, 52 52 C58 56, 68 54, 70 44 C72 34, 62 24, 50 22 C42 22, 36 26, 34 30"
        stroke="url(#leviathanAbyssGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Dorsal Spine Fins Along Serpent Coil */}
      <polygon points="76,24 86,18 82,30" fill="#dc2626" />
      <polygon points="86,46 94,46 88,56" fill="#991b1b" />
      <polygon points="74,74 80,82 68,80" fill="#dc2626" />
      <polygon points="46,88 44,96 36,90" fill="#7f1d1d" />

      {/* Serpent Head / Gaping Jaws with Curved Recurved Fangs */}
      <path
        d="M50 12 L62 26 L56 34 L50 28 L44 34 L38 26 Z"
        fill="#26080c"
        stroke="url(#leviathanCyanWave)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Twin Venom Fangs */}
      <polygon points="44,30 46,38 43,38" fill="#e2e8f0" />
      <polygon points="56,30 57,38 54,38" fill="#e2e8f0" />

      {/* Central Abyssal Trench Eye / Tidal Core */}
      <ellipse
        cx="50"
        cy="54"
        rx="10"
        ry="14"
        fill="#070e14"
        stroke="url(#leviathanCyanWave)"
        strokeWidth="1.5"
      />
      <ellipse cx="50" cy="54" rx="4" ry="9" fill="#06b6d4" />
      <line x1="50" y1="46" x2="50" y2="62" stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  );
}

/* ==========================================================================
   BOSS-SPECIFIC ATMOSPHERIC BACKGROUND COMPONENT
   ========================================================================== */
export interface BossAtmosphereProps {
  bossId: string;
}

export const BossAtmosphere: React.FC<BossAtmosphereProps> = ({ bossId }) => {
  const bossKey = normalizeBossKey(bossId);

  return (
    <div className={`boss-atmosphere boss-atmosphere--${bossKey}`}>
      {bossKey === "ignis" && (
        <>
          <div className="boss-atmo-ignis-glow" />
          <div className="boss-atmo-ignis-sparks" />
        </>
      )}
      {bossKey === "vortex" && (
        <>
          <div className="boss-atmo-vortex-cyclone" />
          <div className="boss-atmo-vortex-ring" />
        </>
      )}
      {bossKey === "malakor" && (
        <>
          <div className="boss-atmo-malakor-aura" />
          <div className="boss-atmo-malakor-gold-pulse" />
        </>
      )}
      {bossKey === "leviathan" && (
        <>
          <div className="boss-atmo-leviathan-trench" />
          <div className="boss-atmo-leviathan-wave" />
        </>
      )}
    </div>
  );
};
