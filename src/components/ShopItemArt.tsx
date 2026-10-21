import React from "react";
import type { RewardCategory } from "../data/rewards";

export interface ShopItemArtProps {
  itemId: string;
  category?: RewardCategory | string;
  title?: string;
  size?: number;
  className?: string;
}

/**
 * High-fidelity, dark cinematic RPG item artwork.
 * Strictly bound to item.id with rich multi-stop gradients, metallic highlights,
 * glowing alchemical cores, and atmospheric rim lighting.
 */
export const ShopItemArt: React.FC<ShopItemArtProps> = ({
  itemId,
  category = "consumable",
  title = "Item",
  size = 84,
  className = "",
}) => {
  const s = size;

  // Helper gradient and filter defs ID prefix to prevent SVG def ID collisions
  const uid = React.useId().replace(/:/g, "_");

  const renderArt = () => {
    switch (itemId) {
      // ═══════════════════════════════════════════════════════
      // 1. DOUBLE XP ELIXIR (potion_xp)
      // ═══════════════════════════════════════════════════════
      case "potion_xp":
        return (
          <g>
            <defs>
              <radialGradient id={`${uid}-xp-glow`} cx="50%" cy="55%" r="45%">
                <stop offset="0%" stopColor="#ffb77d" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#dc2626" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#450a0a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`${uid}-glass`} x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
                <stop offset="30%" stopColor="#ff8c00" stopOpacity="0.1" />
                <stop offset="70%" stopColor="#b91c1c" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#450a0a" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id={`${uid}-liquid`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="40%" stopColor="#ea580c" />
                <stop offset="85%" stopColor="#b91c1c" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>
            </defs>
            {/* Ambient liquid glow */}
            <circle cx="60" cy="68" r="32" fill={`url(#${uid}-xp-glow)`} />
            {/* Flask base shadow */}
            <ellipse cx="60" cy="100" rx="26" ry="6" fill="#070709" opacity="0.8" />
            {/* Flask Body Silhouette */}
            <path
              d="M48 24 L72 24 L72 38 L88 66 C95 78 90 96 76 98 L44 98 C30 96 25 78 32 66 L48 38 Z"
              fill="#181318"
              stroke="#ac8884"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
            {/* Liquid Fill */}
            <path
              d="M49 46 L71 46 L84 68 C89 77 86 94 74 95 L46 95 C34 94 31 77 36 68 Z"
              fill={`url(#${uid}-liquid)`}
            />
            {/* Liquid Surface Meniscus */}
            <ellipse cx="60" cy="47" rx="11" ry="3.5" fill="#fde047" opacity="0.8" />
            {/* Swirling XP Power Core */}
            <circle cx="60" cy="72" r="10" fill="#fef08a" opacity="0.9" />
            <path
              d="M56 65 L64 79 M64 65 L56 79"
              stroke="#7f1d1d"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M60 62 L60 82 M50 72 L70 72"
              stroke="#ffd700"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Glass Facet Shimmer */}
            <path
              d="M38 68 L48 40 L50 26"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.45"
            />
            {/* Golden Runic Neck & Stopper */}
            <rect x="52" y="14" width="16" height="10" rx="2" fill="#ffd700" stroke="#78350f" strokeWidth="1" />
            <polygon points="54,14 60,8 66,14" fill="#b45309" />
            <ellipse cx="60" cy="24" rx="8" ry="2.5" fill="#d97706" />
            {/* Floating Energy Particles */}
            <circle cx="44" cy="56" r="1.5" fill="#fef08a" opacity="0.8" />
            <circle cx="74" cy="62" r="2" fill="#ffd700" opacity="0.9" />
            <circle cx="68" cy="80" r="1.5" fill="#ffedd5" opacity="0.75" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 2. CHRONO STREAK FREEZE (streak_freeze)
      // ═══════════════════════════════════════════════════════
      case "streak_freeze":
        return (
          <g>
            <defs>
              <radialGradient id={`${uid}-chrono-glow`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.8" />
                <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#070709" stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`${uid}-chrono-brass`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffd700" />
                <stop offset="50%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#26171d" />
              </linearGradient>
            </defs>
            {/* Outer Chrono Ring Distortion */}
            <circle cx="60" cy="60" r="42" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 6" opacity="0.5" />
            <circle cx="60" cy="60" r="34" fill="none" stroke="#00e5ff" strokeWidth="1.5" opacity="0.6" />
            {/* Deep Ambient Stasis Glow */}
            <circle cx="60" cy="60" r="28" fill={`url(#${uid}-chrono-glow)`} />
            {/* Capsule Frame (Hourglass / Stasis Capsule) */}
            <path
              d="M40 22 L80 22 C78 44 68 54 64 58 C68 62 78 72 80 94 L40 94 C42 72 52 62 56 58 C52 54 42 44 40 22 Z"
              fill="#18161b"
              stroke={`url(#${uid}-chrono-brass)`}
              strokeWidth="2.5"
            />
            {/* Frozen Crystalline Core */}
            <polygon points="60,38 70,58 60,78 50,58" fill="#e0f2fe" opacity="0.95" />
            <polygon points="60,44 66,58 60,72 54,58" fill="#38bdf8" opacity="0.8" />
            {/* Center Chrono Eye */}
            <circle cx="60" cy="58" r="4" fill="#ffffff" />
            <circle cx="60" cy="58" r="2" fill="#00e5ff" />
            {/* Hour Dial Hands (Frozen at 12:00) */}
            <line x1="60" y1="58" x2="60" y2="46" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />
            <line x1="60" y1="58" x2="68" y2="58" stroke="#ffd700" strokeWidth="1.5" strokeLinecap="round" />
            {/* Top & Bottom Brass Caps */}
            <rect x="36" y="16" width="48" height="8" rx="2" fill="#d97706" stroke="#451a03" strokeWidth="1.5" />
            <rect x="36" y="92" width="48" height="8" rx="2" fill="#d97706" stroke="#451a03" strokeWidth="1.5" />
            {/* Sparkles of frozen time */}
            <circle cx="48" cy="46" r="1.5" fill="#e0f2fe" />
            <circle cx="72" cy="70" r="2" fill="#38bdf8" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 3. STAMINA FLASK (stamina_flask)
      // ═══════════════════════════════════════════════════════
      case "stamina_flask":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-stam-iron`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id={`${uid}-stam-tonic`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="60" cy="102" rx="24" ry="5" fill="#070709" opacity="0.8" />
            {/* Rugged Tactical Flask Container */}
            <rect x="38" y="32" width="44" height="66" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
            {/* Reinforced Outer Casing Band */}
            <rect x="36" y="52" width="48" height="24" rx="4" fill={`url(#${uid}-stam-iron)`} stroke="#dc2626" strokeWidth="1.5" />
            {/* Center Tonic Gauge Window */}
            <rect x="44" y="40" width="32" height="50" rx="4" fill="#0b0f19" />
            <rect x="46" y="50" width="28" height="38" rx="2" fill={`url(#${uid}-stam-tonic)`} />
            {/* Fluid bubbles / conduits */}
            <line x1="52" y1="56" x2="52" y2="82" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            <line x1="68" y1="54" x2="68" y2="78" stroke="#fef08a" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
            {/* Hydraulic Cap */}
            <rect x="48" y="16" width="24" height="16" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="52" y="12" width="16" height="6" rx="1" fill="#dc2626" />
            {/* Lightning / Stamina Bolt Emblem */}
            <polygon points="62,56 54,68 60,68 56,80 66,66 60,66" fill="#ffffff" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 4. SOUL COIN MAGNET (coin_magnet)
      // ═══════════════════════════════════════════════════════
      case "coin_magnet":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-magnet-body`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#450a0a" />
                <stop offset="40%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#18181b" />
              </linearGradient>
              <linearGradient id={`${uid}-coin-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
            </defs>
            {/* Magnetic Flux Lines */}
            <path
              d="M32 75 C32 95 88 95 88 75"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.6"
            />
            <path
              d="M40 70 C40 85 80 85 80 70"
              fill="none"
              stroke="#ffd700"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.8"
            />
            {/* Horseshoe Magnet Arch */}
            <path
              d="M28 66 L28 42 C28 20 92 20 92 42 L92 66 L74 66 L74 44 C74 34 46 34 46 44 L46 66 Z"
              fill={`url(#${uid}-magnet-body)`}
              stroke="#7f1d1d"
              strokeWidth="2"
            />
            {/* Metallic Silver Pole Tips */}
            <rect x="26" y="62" width="22" height="12" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            <rect x="72" y="62" width="22" height="12" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            <text x="37" y="71" fill="#dc2626" fontSize="8" fontWeight="bold" textAnchor="middle">N</text>
            <text x="83" y="71" fill="#2563eb" fontSize="8" fontWeight="bold" textAnchor="middle">S</text>
            {/* Orbiting Attracted Gold Coins */}
            {/* Coin 1 */}
            <ellipse cx="60" cy="82" rx="10" ry="10" fill={`url(#${uid}-coin-gold)`} stroke="#ca8a04" strokeWidth="1.5" />
            <ellipse cx="60" cy="82" rx="6" ry="6" fill="#fde047" opacity="0.7" />
            <text x="60" y="86" fill="#713f12" fontSize="9" fontWeight="bold" textAnchor="middle">G</text>
            {/* Coin 2 (Angled Left) */}
            <ellipse cx="44" cy="90" rx="7" ry="5" transform="rotate(-25 44 90)" fill={`url(#${uid}-coin-gold)`} stroke="#a16207" strokeWidth="1" />
            {/* Coin 3 (Angled Right) */}
            <ellipse cx="76" cy="88" rx="8" ry="6" transform="rotate(20 76 88)" fill={`url(#${uid}-coin-gold)`} stroke="#a16207" strokeWidth="1" />
            {/* Kinetic Sparks */}
            <polygon points="60,68 62,73 60,78 58,73" fill="#ffffff" />
            <circle cx="50" cy="78" r="1.5" fill="#fde047" />
            <circle cx="70" cy="76" r="1.5" fill="#fde047" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 5. ELIXIR OF VITALITY (vitality_infusion)
      // ═══════════════════════════════════════════════════════
      case "vitality_infusion":
        return (
          <g>
            <defs>
              <radialGradient id={`${uid}-vit-glow`} cx="50%" cy="60%" r="45%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#881337" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`${uid}-vit-ruby`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fda4af" />
                <stop offset="50%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#4c0519" />
              </linearGradient>
            </defs>
            {/* Ambient Vitality Glow */}
            <circle cx="60" cy="65" r="30" fill={`url(#${uid}-vit-glow)`} />
            {/* Ornate Heart-Gem Phial Shape */}
            <path
              d="M60 96 C42 84 30 68 30 52 C30 38 42 30 54 36 L60 42 L66 36 C78 30 90 38 90 52 C90 68 78 84 60 96 Z"
              fill={`url(#${uid}-vit-ruby)`}
              stroke="#ffd700"
              strokeWidth="2"
            />
            {/* Inner Biological Core Heart */}
            <path
              d="M60 84 C48 74 40 62 40 50 C40 42 46 38 52 42 L60 48 L68 42 C74 38 80 42 80 50 C80 62 72 74 60 84 Z"
              fill="#ffe4e6"
              opacity="0.35"
            />
            {/* Heart Core Facets */}
            <line x1="60" y1="48" x2="60" y2="82" stroke="#ffffff" strokeWidth="1.5" opacity="0.75" />
            <line x1="42" y1="52" x2="60" y2="66" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
            <line x1="78" y1="52" x2="60" y2="66" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
            {/* Ornate Crown Stopper */}
            <rect x="54" y="22" width="12" height="12" fill="#ffd700" stroke="#78350f" strokeWidth="1" />
            <polygon points="52,22 60,14 68,22" fill="#d97706" />
            <circle cx="60" cy="14" r="3" fill="#e11d48" stroke="#ffd700" strokeWidth="1" />
            {/* Pulsing Light Embers */}
            <circle cx="48" cy="60" r="1.5" fill="#ffffff" />
            <circle cx="70" cy="62" r="2" fill="#ffe4e6" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 6. HYPER-FOCUS BREW (focus_brew)
      // ═══════════════════════════════════════════════════════
      case "focus_brew":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-focus-body`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="60%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <radialGradient id={`${uid}-focus-target`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#00e5ff" />
                <stop offset="100%" stopColor="#0284c7" />
              </radialGradient>
            </defs>
            {/* Holographic Reticle Ring */}
            <circle cx="60" cy="64" r="34" fill="none" stroke="#00e5ff" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
            <line x1="60" y1="24" x2="60" y2="34" stroke="#00e5ff" strokeWidth="1.5" />
            <line x1="60" y1="94" x2="60" y2="104" stroke="#00e5ff" strokeWidth="1.5" />
            <line x1="20" y1="64" x2="30" y2="64" stroke="#00e5ff" strokeWidth="1.5" />
            <line x1="90" y1="64" x2="100" y2="64" stroke="#00e5ff" strokeWidth="1.5" />
            {/* Tactical Cylindrical Flask */}
            <rect x="42" y="32" width="36" height="62" rx="10" fill={`url(#${uid}-focus-body)`} stroke="#0284c7" strokeWidth="2" />
            {/* Center Focus Iris Aperture */}
            <circle cx="60" cy="64" r="14" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="60" cy="64" r="8" fill={`url(#${uid}-focus-target)`} />
            <circle cx="60" cy="64" r="3" fill="#ffffff" />
            {/* Precision Measurement Ticks */}
            <line x1="72" y1="44" x2="76" y2="44" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="72" y1="52" x2="76" y2="52" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="72" y1="76" x2="76" y2="76" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="72" y1="84" x2="76" y2="84" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Top Dispenser Nozzle */}
            <rect x="52" y="20" width="16" height="12" rx="2" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
            <circle cx="60" cy="18" r="3" fill="#00e5ff" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 7. DRAUGHT OF THE IRON WILL (discipline_draught)
      // ═══════════════════════════════════════════════════════
      case "discipline_draught":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-iron-will`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#090d16" />
              </linearGradient>
              <radialGradient id={`${uid}-amber-molten`} cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#78350f" />
              </radialGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="60" cy="100" rx="24" ry="5" fill="#070709" opacity="0.8" />
            {/* Heavy Hexagonal Dark Iron Chalice */}
            <polygon
              points="40,36 80,36 74,76 60,94 46,76"
              fill={`url(#${uid}-iron-will)`}
              stroke="#ffd700"
              strokeWidth="2"
            />
            {/* Molten Golden Draught Top */}
            <ellipse cx="60" cy="38" rx="18" ry="7" fill={`url(#${uid}-amber-molten)`} />
            {/* Heavy Iron Base Stand */}
            <polygon points="54,86 66,86 70,98 50,98" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
            {/* Golden Will Rune on Chalice Body */}
            <path
              d="M60 48 L60 76 M52 56 L68 56 M54 68 L66 68"
              stroke="#ffd700"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Steam wisps of discipline */}
            <path
              d="M54 30 C52 24 58 20 56 14 M66 32 C68 26 62 22 64 16"
              fill="none"
              stroke="#fef08a"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 8. BLADE OF DEEP WORK (blade_of_focus)
      // ═══════════════════════════════════════════════════════
      case "blade_of_focus":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-obsidian-edge`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e1e24" />
                <stop offset="40%" stopColor="#09090b" />
                <stop offset="85%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>
            </defs>
            {/* Ambient Blade Glow */}
            <line x1="86" y1="20" x2="30" y2="86" stroke="#dc2626" strokeWidth="12" strokeLinecap="round" opacity="0.3" filter="blur(8px)" />
            {/* Curved Assassin Dagger Blade */}
            <path
              d="M88 18 C82 32 74 54 52 74 L46 68 C62 50 78 30 88 18 Z"
              fill={`url(#${uid}-obsidian-edge)`}
              stroke="#ef4444"
              strokeWidth="1.5"
            />
            {/* Glowing Red Fuller Rune Vein */}
            <path
              d="M82 26 C72 42 60 58 48 70"
              fill="none"
              stroke="#ffedd5"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Dagger Crossguard */}
            <rect x="42" y="70" width="16" height="6" transform="rotate(-45 50 73)" fill="#78350f" stroke="#ffd700" strokeWidth="1.5" />
            {/* Leather Wrapped Grip */}
            <line x1="44" y1="78" x2="26" y2="96" stroke="#451a03" strokeWidth="6" strokeLinecap="round" />
            <line x1="42" y1="80" x2="40" y2="82" stroke="#d97706" strokeWidth="1.5" />
            <line x1="36" y1="86" x2="34" y2="88" stroke="#d97706" strokeWidth="1.5" />
            <line x1="30" y1="92" x2="28" y2="94" stroke="#d97706" strokeWidth="1.5" />
            {/* Pommel Stone */}
            <circle cx="23" cy="99" r="4.5" fill="#dc2626" stroke="#ffd700" strokeWidth="1.5" />
            {/* Blade Tip Spark */}
            <polygon points="90,16 93,18 90,20 87,18" fill="#ffffff" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 9. CLOAK OF SOLITUDE (cloak_of_shadows)
      // ═══════════════════════════════════════════════════════
      case "cloak_of_shadows":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-cloak-velvet`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#31103f" />
                <stop offset="50%" stopColor="#1e1028" />
                <stop offset="100%" stopColor="#07030a" />
              </linearGradient>
            </defs>
            {/* Shadow Wisps */}
            <path
              d="M32 86 C24 96 36 104 46 96 C56 104 68 104 76 96 C86 104 96 96 88 86"
              fill="#581c87"
              opacity="0.4"
            />
            {/* Cloak Mantle */}
            <path
              d="M60 26 C44 26 34 38 30 70 C36 84 48 94 60 92 C72 94 84 84 90 70 C86 38 76 26 60 26 Z"
              fill={`url(#${uid}-cloak-velvet)`}
              stroke="#c084fc"
              strokeWidth="1.5"
            />
            {/* Cowl / Hood Fold Shadows */}
            <path
              d="M48 34 C54 48 66 48 72 34"
              fill="none"
              stroke="#7e22ce"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Silver Starburst Clasp */}
            <circle cx="60" cy="34" r="6" fill="#e9d5ff" stroke="#a855f7" strokeWidth="1.5" />
            <polygon points="60,26 62,34 68,34 63,38 65,44 60,40 55,44 57,38 52,34 58,34" fill="#ffd700" />
            {/* Ethereal Glint Stars */}
            <circle cx="44" cy="58" r="1.5" fill="#f3e8ff" />
            <circle cx="76" cy="62" r="1.5" fill="#f3e8ff" />
            <circle cx="60" cy="74" r="2" fill="#c084fc" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 10. CROWN OF THE CONQUEROR (crown_of_discipline)
      // ═══════════════════════════════════════════════════════
      case "crown_of_discipline":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-gold-crown`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>
            {/* Sovereign Sunburst Flare */}
            <circle cx="60" cy="55" r="32" fill="#fef08a" opacity="0.15" />
            {/* Crown Base Rim */}
            <ellipse cx="60" cy="78" rx="34" ry="9" fill="#78350f" stroke="#ffd700" strokeWidth="2" />
            {/* Jagged Monarch Spikes */}
            <polygon
              points="26,76 34,42 46,64 60,30 74,64 86,42 94,76"
              fill={`url(#${uid}-gold-crown)`}
              stroke="#b45309"
              strokeWidth="2"
            />
            {/* Blood-Ruby Stones */}
            {/* Center Apex Ruby */}
            <polygon points="60,44 65,52 60,60 55,52" fill="#dc2626" stroke="#ffffff" strokeWidth="0.8" />
            {/* Left Ruby */}
            <circle cx="36" cy="54" r="3.5" fill="#dc2626" stroke="#ffd700" strokeWidth="1" />
            {/* Right Ruby */}
            <circle cx="84" cy="54" r="3.5" fill="#dc2626" stroke="#ffd700" strokeWidth="1" />
            {/* Crown Arch Bevel Highlights */}
            <line x1="60" y1="32" x2="60" y2="76" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
            <ellipse cx="60" cy="78" rx="28" ry="5" fill="#451a03" opacity="0.5" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 11. BAND OF CHRONOS (ring_of_time)
      // ═══════════════════════════════════════════════════════
      case "ring_of_time":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-chrono-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            {/* Cosmic Nebula Halo */}
            <ellipse cx="60" cy="62" rx="36" ry="24" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.7" />
            {/* Outer Ring Band (Isometric Oval) */}
            <ellipse cx="60" cy="64" rx="30" ry="20" fill="none" stroke={`url(#${uid}-chrono-ring)`} strokeWidth="10" />
            <ellipse cx="60" cy="64" rx="30" ry="20" fill="none" stroke="#00e5ff" strokeWidth="1.5" opacity="0.8" />
            {/* Suspended Bezel Setting */}
            <rect x="48" y="36" width="24" height="18" rx="4" fill="#1e293b" stroke="#ffd700" strokeWidth="1.5" />
            {/* Cyan Chrono-Crystal Gem */}
            <polygon points="60,38 70,45 60,52 50,45" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
            <circle cx="60" cy="45" r="2.5" fill="#ffffff" />
            {/* Carved Rune Glyph marks */}
            <line x1="38" y1="62" x2="42" y2="64" stroke="#ffd700" strokeWidth="1.5" />
            <line x1="78" y1="64" x2="82" y2="62" stroke="#ffd700" strokeWidth="1.5" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 12. AEGIS OF ROUTINE (shield_of_consistency)
      // ═══════════════════════════════════════════════════════
      case "shield_of_consistency":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-shield-plate`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>
            {/* Tower Shield Silhouette */}
            <path
              d="M30 26 L90 26 L86 64 C84 84 60 98 60 98 C60 98 36 84 34 64 Z"
              fill={`url(#${uid}-shield-plate)`}
              stroke="#64748b"
              strokeWidth="2.5"
            />
            {/* Inner Fortitude Bevel */}
            <path
              d="M38 32 L82 32 L78 62 C76 78 60 88 60 88 C60 88 44 78 42 62 Z"
              fill="#1e293b"
              stroke="#dc2626"
              strokeWidth="1.5"
            />
            {/* Crimson Vanguard Cross Emboss */}
            <rect x="56" y="32" width="8" height="52" rx="1" fill="#dc2626" />
            <rect x="42" y="46" width="36" height="8" rx="1" fill="#dc2626" />
            {/* Fortitude Cyan Center Crest */}
            <circle cx="60" cy="50" r="7" fill="#00e5ff" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="60" cy="50" r="3" fill="#ffffff" />
            {/* Shield Bolt Rivets */}
            <circle cx="34" cy="30" r="1.5" fill="#ffd700" />
            <circle cx="86" cy="30" r="1.5" fill="#ffd700" />
            <circle cx="82" cy="64" r="1.5" fill="#ffd700" />
            <circle cx="38" cy="64" r="1.5" fill="#ffd700" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 13. TALISMAN OF ENLIGHTENMENT (amulet_of_insight)
      // ═══════════════════════════════════════════════════════
      case "amulet_of_insight":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-lapis`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="50%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            {/* Silver Chain */}
            <path d="M42 16 C52 30 68 30 78 16" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
            {/* Outer Rotating Concentric Ring */}
            <circle cx="60" cy="62" r="32" fill="none" stroke="#ffd700" strokeWidth="2" strokeDasharray="6 4" />
            {/* Lapis Lazuli Medallion Body */}
            <circle cx="60" cy="62" r="26" fill={`url(#${uid}-lapis)`} stroke="#ffd700" strokeWidth="2" />
            {/* All-Seeing Eye of Wisdom */}
            <path
              d="M44 62 C50 50 70 50 76 62 C70 74 50 74 44 62 Z"
              fill="#ffffff"
              stroke="#ffd700"
              strokeWidth="1.5"
            />
            {/* Glowing Pupil */}
            <circle cx="60" cy="62" r="6" fill="#00e5ff" stroke="#1e3a8a" strokeWidth="1.5" />
            <circle cx="60" cy="62" r="2" fill="#0f172a" />
            {/* Top Loop */}
            <circle cx="60" cy="34" r="4" fill="none" stroke="#ffd700" strokeWidth="2" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 14. GREAVES OF SWIFT STEPS (boots_of_momentum)
      // ═══════════════════════════════════════════════════════
      case "boots_of_momentum":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-steel-boot`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="60%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            {/* Kinetic Thrust Flames */}
            <path
              d="M36 86 C28 92 24 100 22 104 C30 102 38 98 44 92"
              fill="#ea580c"
            />
            <path
              d="M38 88 C32 94 28 100 26 102 C32 100 36 98 42 92"
              fill="#fef08a"
            />
            {/* Armored Hunter Sabaton */}
            <path
              d="M52 24 L72 24 L72 60 L88 78 L88 88 L38 88 L40 76 L52 64 Z"
              fill={`url(#${uid}-steel-boot)`}
              stroke="#94a3b8"
              strokeWidth="2"
            />
            {/* Wing Feather Plating on Calf */}
            <polygon points="42,32 30,22 46,38" fill="#ffd700" stroke="#78350f" strokeWidth="1" />
            <polygon points="42,42 26,34 46,48" fill="#ffd700" stroke="#78350f" strokeWidth="1" />
            <polygon points="42,52 28,46 48,58" fill="#ffd700" stroke="#78350f" strokeWidth="1" />
            {/* Ankle Kinetic Gem */}
            <circle cx="58" cy="70" r="4" fill="#dc2626" stroke="#ffd700" strokeWidth="1.5" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 15. SPECIALTY COFFEE RUN (coffee_run)
      // ═══════════════════════════════════════════════════════
      case "coffee_run":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-coffee-cup`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#33221b" />
                <stop offset="50%" stopColor="#1a110d" />
                <stop offset="100%" stopColor="#0d0806" />
              </linearGradient>
            </defs>
            {/* Golden Steam Wisps */}
            <path
              d="M52 26 C50 18 56 14 54 8 M64 28 C62 20 68 16 66 10 M58 24 C56 16 62 12 60 6"
              fill="none"
              stroke="#ffd700"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Artisan Tumbler */}
            <path
              d="M44 32 L76 32 L70 94 L50 94 Z"
              fill={`url(#${uid}-coffee-cup)`}
              stroke="#78350f"
              strokeWidth="2"
            />
            {/* Warm Leather Sleeve */}
            <rect x="46" y="50" width="28" height="26" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
            {/* Brass Hunter Stamp Emblem */}
            <circle cx="60" cy="63" r="7" fill="#ffd700" stroke="#78350f" strokeWidth="1" />
            <polygon points="60,59 63,65 57,65" fill="#451a03" />
            {/* Sip Lid */}
            <rect x="42" y="28" width="36" height="6" rx="2" fill="#1c1917" stroke="#44403c" strokeWidth="1" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 16. GUILT-FREE FEAST (cheat_meal)
      // ═══════════════════════════════════════════════════════
      case "cheat_meal":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-cloche-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#713f12" />
              </linearGradient>
            </defs>
            {/* Banquet Serving Platter Base */}
            <ellipse cx="60" cy="88" rx="42" ry="10" fill="#292524" stroke="#ffd700" strokeWidth="2" />
            {/* Gilded Domed Cloche */}
            <path
              d="M26 82 C26 44 94 44 94 82 Z"
              fill={`url(#${uid}-cloche-gold)`}
              stroke="#ca8a04"
              strokeWidth="2"
            />
            {/* Cloche Top Handle Ring */}
            <circle cx="60" cy="40" r="5" fill="#ffd700" stroke="#713f12" strokeWidth="1.5" />
            {/* Steam Vents of Delicious Aroma */}
            <path
              d="M48 34 C44 26 50 20 46 14 M72 34 C76 26 70 20 74 14"
              fill="none"
              stroke="#fef08a"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Feast Ribbon Badge */}
            <polygon points="60,70 68,78 60,86 52,78" fill="#dc2626" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 17. 2-HOUR GAMING SESSION (gaming_night)
      // ═══════════════════════════════════════════════════════
      case "gaming_night":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-pad-body`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#27272a" />
                <stop offset="60%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#09090b" />
              </linearGradient>
            </defs>
            {/* Holographic HUD Grid */}
            <ellipse cx="60" cy="62" rx="36" ry="24" fill="none" stroke="#dc2626" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
            {/* Cyberpunk Game Controller Body */}
            <path
              d="M32 44 C42 42 52 46 60 48 C68 46 78 42 88 44 C96 52 100 84 84 88 C76 90 70 76 60 76 C50 76 44 90 36 88 C20 84 24 52 32 44 Z"
              fill={`url(#${uid}-pad-body)`}
              stroke="#52525b"
              strokeWidth="2"
            />
            {/* Neon Crimson Thumbsticks */}
            <circle cx="48" cy="68" r="6" fill="#18181b" stroke="#dc2626" strokeWidth="2" />
            <circle cx="72" cy="68" r="6" fill="#18181b" stroke="#dc2626" strokeWidth="2" />
            {/* D-Pad on Left */}
            <path d="M38 52 H44 M41 49 V55" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="square" />
            {/* Action Buttons on Right */}
            <circle cx="76" cy="50" r="1.5" fill="#fde047" />
            <circle cx="82" cy="54" r="1.5" fill="#22c55e" />
            <circle cx="76" cy="58" r="1.5" fill="#3b82f6" />
            <circle cx="70" cy="54" r="1.5" fill="#ef4444" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 18. CINEMA / MOVIE NIGHT (movie_night)
      // ═══════════════════════════════════════════════════════
      case "movie_night":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-reel-body`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#52525b" />
                <stop offset="60%" stopColor="#27272a" />
                <stop offset="100%" stopColor="#18181b" />
              </linearGradient>
            </defs>
            {/* Cinema Light Cone */}
            <polygon points="60,60 20,20 100,20" fill="#fde047" opacity="0.12" />
            {/* Film Reel Outer Frame */}
            <circle cx="60" cy="60" r="34" fill={`url(#${uid}-reel-body)`} stroke="#ffd700" strokeWidth="2.5" />
            {/* Reel Spoke Cutouts */}
            <circle cx="60" cy="38" r="6" fill="#09090b" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="78" cy="50" r="6" fill="#09090b" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="78" cy="70" r="6" fill="#09090b" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="60" cy="82" r="6" fill="#09090b" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="42" cy="70" r="6" fill="#09090b" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="42" cy="50" r="6" fill="#09090b" stroke="#ca8a04" strokeWidth="1" />
            {/* Center Spindle */}
            <circle cx="60" cy="60" r="8" fill="#ffd700" stroke="#713f12" strokeWidth="1.5" />
            <rect x="58" y="56" width="4" height="8" fill="#18181b" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 19. NEW BOOK PURCHASE (book_buying)
      // ═══════════════════════════════════════════════════════
      case "book_buying":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-leather-tome`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="50%" stopColor="#451a03" />
                <stop offset="100%" stopColor="#290f02" />
              </linearGradient>
            </defs>
            {/* Arcane Knowledge Rune Flares */}
            <circle cx="46" cy="30" r="1.5" fill="#ffd700" />
            <circle cx="74" cy="28" r="2" fill="#00e5ff" />
            {/* Ancient Leatherbound Tome (Open Perspective) */}
            <path
              d="M60 40 C50 36 34 38 26 42 L26 84 C34 80 50 78 60 82 C70 78 86 80 94 84 L94 42 C86 38 70 36 60 40 Z"
              fill={`url(#${uid}-leather-tome)`}
              stroke="#ffd700"
              strokeWidth="2"
            />
            {/* Gilded Page Edges */}
            <path
              d="M60 42 C50 38 36 40 28 44 L28 82 C36 78 50 76 60 80 C70 76 84 78 92 82 L92 44 C84 40 70 38 60 42 Z"
              fill="#fef3c7"
            />
            {/* Center Spine Divider */}
            <line x1="60" y1="41" x2="60" y2="81" stroke="#b45309" strokeWidth="2" />
            {/* Red Silk Ribbon Bookmark */}
            <path d="M60 40 L60 92 L64 88 L68 92 L68 40" fill="#dc2626" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 20. LAZY SUNDAY PASS (day_off_chores)
      // ═══════════════════════════════════════════════════════
      case "day_off_chores":
        return (
          <g>
            <defs>
              <radialGradient id={`${uid}-sun-sanctuary`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#78350f" />
              </radialGradient>
            </defs>
            {/* Celestial Golden Sun Medallion */}
            <circle cx="60" cy="58" r="32" fill={`url(#${uid}-sun-sanctuary)`} stroke="#ffd700" strokeWidth="2.5" />
            {/* Radiating Calm Rays */}
            <g stroke="#fef08a" strokeWidth="2" strokeLinecap="round" opacity="0.8">
              <line x1="60" y1="18" x2="60" y2="24" />
              <line x1="60" y1="92" x2="60" y2="98" />
              <line x1="20" y1="58" x2="26" y2="58" />
              <line x1="94" y1="58" x2="100" y2="58" />
              <line x1="32" y1="30" x2="36" y2="34" />
              <line x1="84" y1="82" x2="88" y2="86" />
              <line x1="32" y1="86" x2="36" y2="82" />
              <line x1="84" y1="34" x2="88" y2="30" />
            </g>
            {/* Peaceful Crescent Moon Silhouette in center */}
            <path
              d="M58 42 C48 42 42 50 42 60 C42 70 50 78 62 76 C54 74 48 66 50 56 C52 48 58 44 58 42 Z"
              fill="#ffffff"
            />
            {/* Tranquil Rest Clouds */}
            <ellipse cx="68" cy="66" rx="14" ry="7" fill="#ffffff" opacity="0.85" />
            <ellipse cx="76" cy="64" rx="10" ry="6" fill="#ffffff" opacity="0.85" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 21. TECH GADGET UPGRADE (tech_gadget)
      // ═══════════════════════════════════════════════════════
      case "tech_gadget":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-quantum-chip`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>
            {/* Neon Cyan Circuit Traces */}
            <g stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.85">
              <path d="M24 36 H38 L48 48" />
              <path d="M96 36 H82 L72 48" />
              <path d="M24 84 H38 L48 72" />
              <path d="M96 84 H82 L72 72" />
            </g>
            {/* Central Microprocessor Core (Isometric Diamond/Square) */}
            <rect x="42" y="42" width="36" height="36" rx="4" fill={`url(#${uid}-quantum-chip)`} stroke="#38bdf8" strokeWidth="2" />
            {/* Golden Pins on All 4 Sides */}
            <g stroke="#ffd700" strokeWidth="2">
              <line x1="48" y1="38" x2="48" y2="42" />
              <line x1="56" y1="38" x2="56" y2="42" />
              <line x1="64" y1="38" x2="64" y2="42" />
              <line x1="72" y1="38" x2="72" y2="42" />
              <line x1="48" y1="78" x2="48" y2="82" />
              <line x1="56" y1="78" x2="56" y2="82" />
              <line x1="64" y1="78" x2="64" y2="82" />
              <line x1="72" y1="78" x2="72" y2="82" />
            </g>
            {/* Glowing Holographic Core */}
            <circle cx="60" cy="60" r="8" fill="#00e5ff" opacity="0.9" />
            <circle cx="60" cy="60" r="3" fill="#ffffff" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 22. TITLE: 'THE RELENTLESS' (title_relentless)
      // ═══════════════════════════════════════════════════════
      case "title_relentless":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-tag-plate`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>
            {/* Hanging Titanium Ball Chain */}
            <path d="M48 16 C54 26 66 26 72 16" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
            {/* Forged Titanium Dog Tag Plaque */}
            <rect x="36" y="28" width="48" height="66" rx="6" fill={`url(#${uid}-tag-plate)`} stroke="#dc2626" strokeWidth="2" />
            {/* Chain Eyelet */}
            <circle cx="60" cy="36" r="3.5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Scorched Battle Notches */}
            <line x1="40" y1="46" x2="80" y2="46" stroke="#dc2626" strokeWidth="1.5" />
            <text x="60" y="60" fill="#f8fafc" fontSize="8" fontWeight="bold" fontFamily="Space Grotesk, sans-serif" textAnchor="middle">RELENTLESS</text>
            <text x="60" y="70" fill="#f87171" fontSize="6" fontFamily="Space Grotesk, monospace" textAnchor="middle">[PR-TITLE]</text>
            <line x1="40" y1="78" x2="80" y2="78" stroke="#dc2626" strokeWidth="1.5" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 23. TITLE: 'SHADOW MONARCH' (title_monarch)
      // ═══════════════════════════════════════════════════════
      case "title_monarch":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-monarch-crest`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffd700" />
                <stop offset="40%" stopColor="#93000a" />
                <stop offset="100%" stopColor="#070709" />
              </linearGradient>
            </defs>
            {/* Void Wing Horns */}
            <path
              d="M32 30 C30 50 44 68 60 84 C76 68 90 50 88 30 C76 42 66 38 60 48 C54 38 44 42 32 30 Z"
              fill={`url(#${uid}-monarch-crest)`}
              stroke="#ffd700"
              strokeWidth="2"
            />
            {/* Monarch Crown Atop Skull */}
            <polygon points="46,32 52,20 60,26 68,20 74,32" fill="#ffd700" stroke="#78350f" strokeWidth="1" />
            {/* Glowing Crimson Eyes of the Monarch */}
            <ellipse cx="52" cy="54" rx="3" ry="1.5" transform="rotate(-15 52 54)" fill="#dc2626" />
            <ellipse cx="68" cy="54" rx="3" ry="1.5" transform="rotate(15 68 54)" fill="#dc2626" />
            {/* Dripping Void Embers */}
            <circle cx="60" cy="92" r="2" fill="#dc2626" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 24. CRIMSON BLOOD AURA (aura_crimson)
      // ═══════════════════════════════════════════════════════
      case "aura_crimson":
        return (
          <g>
            <defs>
              <radialGradient id={`${uid}-crimson-core`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#ef4444" />
                <stop offset="70%" stopColor="#991b1b" />
                <stop offset="100%" stopColor="#070709" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Swirling Outer Astral Flame Wisps */}
            <path
              d="M60 16 C84 26 96 52 86 78 C74 100 46 100 34 78 C24 52 36 26 60 16 Z"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
              strokeDasharray="8 6"
              opacity="0.8"
            />
            <path
              d="M60 24 C76 32 86 52 78 72 C70 88 50 88 42 72 C34 52 44 32 60 24 Z"
              fill="none"
              stroke="#f87171"
              strokeWidth="1.5"
            />
            {/* Glowing Core Sphere */}
            <circle cx="60" cy="58" r="18" fill={`url(#${uid}-crimson-core)`} />
            <circle cx="60" cy="58" r="8" fill="#ffffff" opacity="0.9" />
            {/* Crackling Lightning Embers */}
            <polygon points="58,36 62,44 58,48 64,56 60,60" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 25. AURA OF THE GOLDEN SUN (aura_gold)
      // ═══════════════════════════════════════════════════════
      case "aura_gold":
        return (
          <g>
            <defs>
              <radialGradient id={`${uid}-sun-core`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#ffd700" />
                <stop offset="80%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#070709" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* 8 Golden Spear-Rays */}
            <g fill="#ffd700" stroke="#78350f" strokeWidth="1">
              <polygon points="60,12 63,30 57,30" />
              <polygon points="60,106 63,88 57,88" />
              <polygon points="12,59 30,62 30,56" />
              <polygon points="106,59 88,62 88,56" />
              <polygon points="26,25 41,38 37,42" />
              <polygon points="92,93 77,80 81,76" />
              <polygon points="26,93 37,76 41,80" />
              <polygon points="92,25 81,42 77,38" />
            </g>
            {/* Corona Ring */}
            <circle cx="60" cy="59" r="26" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="4 4" />
            {/* Center Blazing Solar Core */}
            <circle cx="60" cy="59" r="18" fill={`url(#${uid}-sun-core)`} />
            <circle cx="60" cy="59" r="6" fill="#ffffff" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 26. VOID SLAYER INSIGNIA (badge_slayer)
      // ═══════════════════════════════════════════════════════
      case "badge_slayer":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-slayer-metal`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3f3f46" />
                <stop offset="50%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#09090b" />
              </linearGradient>
            </defs>
            {/* Crossed Assassin Daggers in Background */}
            <line x1="26" y1="26" x2="94" y2="94" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <line x1="94" y1="26" x2="26" y2="94" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            {/* Shield / Medal Plaque */}
            <path
              d="M36 34 L84 34 L80 72 C78 86 60 96 60 96 C60 96 42 86 40 72 Z"
              fill={`url(#${uid}-slayer-metal)`}
              stroke="#dc2626"
              strokeWidth="2.5"
            />
            {/* Slayer Demon Skull */}
            <path
              d="M48 48 C48 40 72 40 72 48 C74 56 70 66 66 68 L64 74 L56 74 L54 68 C50 66 46 56 48 48 Z"
              fill="#e4e4e7"
              stroke="#18181b"
              strokeWidth="1.5"
            />
            {/* Glowing Red Slayer Eyes */}
            <circle cx="53" cy="52" r="2.5" fill="#dc2626" />
            <circle cx="67" cy="52" r="2.5" fill="#dc2626" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // 27. 8-BIT RETRO SOUNDPACK (soundpack_retro)
      // ═══════════════════════════════════════════════════════
      case "soundpack_retro":
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}-retro-cart`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3f3f46" />
                <stop offset="60%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#09090b" />
              </linearGradient>
            </defs>
            {/* Sound Equalizer Waves */}
            <rect x="22" y="52" width="6" height="20" fill="#00e5ff" opacity="0.8" />
            <rect x="30" y="44" width="6" height="28" fill="#ffd700" opacity="0.9" />
            <rect x="84" y="44" width="6" height="28" fill="#ffd700" opacity="0.9" />
            <rect x="92" y="52" width="6" height="20" fill="#00e5ff" opacity="0.8" />
            {/* 8-Bit Cartridge Body */}
            <rect x="40" y="30" width="40" height="60" rx="3" fill={`url(#${uid}-retro-cart)`} stroke="#a855f7" strokeWidth="2" />
            {/* Grip Grooves */}
            <line x1="44" y1="36" x2="76" y2="36" stroke="#52525b" strokeWidth="1.5" />
            <line x1="44" y1="40" x2="76" y2="40" stroke="#52525b" strokeWidth="1.5" />
            {/* Label Sticker with 8-bit Music Note */}
            <rect x="44" y="48" width="32" height="32" rx="2" fill="#a855f7" />
            <path
              d="M52 70 V56 H66 V70 M66 62 H52"
              stroke="#ffffff"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="square"
            />
            <circle cx="50" cy="70" r="3" fill="#ffffff" />
            <circle cx="68" cy="70" r="3" fill="#ffffff" />
          </g>
        );

      // ═══════════════════════════════════════════════════════
      // DYNAMIC FALLBACK BY CATEGORY (Custom User Rewards)
      // ═══════════════════════════════════════════════════════
      default:
        if (category === "real_life") {
          return (
            <g>
              <defs>
                <linearGradient id={`${uid}-chest-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd700" />
                  <stop offset="60%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#451a03" />
                </linearGradient>
              </defs>
              {/* Ceremonial Gift Vault Chest */}
              <rect x="32" y="44" width="56" height="46" rx="4" fill="#26171d" stroke={`url(#${uid}-chest-gold)`} strokeWidth="2.5" />
              <path d="M30 46 C30 32 90 32 90 46 Z" fill="#450a0a" stroke="#ffd700" strokeWidth="2" />
              <rect x="54" y="44" width="12" height="16" rx="2" fill="#ffd700" stroke="#78350f" strokeWidth="1.5" />
              <circle cx="60" cy="50" r="2" fill="#18181b" />
              {/* Festive Stars */}
              <circle cx="40" cy="28" r="2" fill="#ffd700" />
              <circle cx="80" cy="30" r="1.5" fill="#fde047" />
            </g>
          );
        }

        if (category === "gear") {
          return (
            <g>
              <line x1="30" y1="30" x2="90" y2="90" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
              <line x1="90" y1="30" x2="30" y2="90" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
              <circle cx="60" cy="60" r="24" fill="#18161b" stroke="#ffd700" strokeWidth="2" />
              <polygon points="60,44 72,60 60,76 48,60" fill="#dc2626" />
            </g>
          );
        }

        if (category === "cosmetic") {
          return (
            <g>
              <polygon points="60,20 72,44 98,48 78,68 84,94 60,80 36,94 42,68 22,48 48,44" fill="#ffd700" stroke="#b45309" strokeWidth="2" />
              <circle cx="60" cy="58" r="8" fill="#dc2626" />
            </g>
          );
        }

        // Generic consumable flask fallback
        return (
          <g>
            <circle cx="60" cy="68" r="26" fill="#18161b" stroke="#38bdf8" strokeWidth="2" />
            <rect x="52" y="24" width="16" height="18" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx="60" cy="68" r="16" fill="#00e5ff" opacity="0.7" />
          </g>
        );
    }
  };

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shop-item-art ${className}`.trim()}
      role="img"
      aria-label={title}
    >
      {renderArt()}
    </svg>
  );
};

export default ShopItemArt;
