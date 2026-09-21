# HABBITS RPG — VISUAL DESIGN SPECIFICATION (DESIGN.md)

> **VISUAL SOURCE OF TRUTH**: Final Authoritative Screens in Stitch MCP Project `Habbits RPG System UI` (ID: `14828715544746051941`).  
> **FUNCTIONAL SOURCE OF TRUTH**: Existing React + TypeScript + Supabase Codebase.  
> **INTENDED PALETTE**: Near-Black Void + Deep Burgundy + Deep Crimson + Muted Gold / Amber + Minimal Tactical Cyan.

---

## 1. DESIGN PHILOSOPHY

Habbits RPG embodies a **Dark Cinematic Solo-Leveling RPG Interface**—a hybrid of an awakened, omniscient hunter system telemetry display and a high-stakes tactical command console. 

Key visual tenets:
1. **The Indifferent System**: The UI presents self-improvement and habit discipline as an existential awakening. Telemetry readouts, monospace labels, uppercase micro-copy, bracketed badges (`[SYS_ALERT]`, `// DIRECTIVE`), and segmented power gauges reinforce this tone.
2. **Atmospheric Pressure**: The canvas is pitched in abyssal voids (`#070709` / `#0b0b0e`). Visual depth is achieved through layered semi-translucent surfaces, hairline borders, and subtle photonic blooms rather than heavy material skeuomorphism.
3. **Ruthless Hierarchy**:
   - **Crimson (`#dc2626` / `#bf0715` / `#690005`)**: High urgency, boss HP, danger alerts, fatal countdowns, primary action triggers.
   - **Muted Gold (`#ffb77d` / `#ad5d00` / `#ffdcc3`)**: Peak discipline, active streaks, permanent records, legendary milestones, ascension crowns.
   - **Tactical Cyan (`#38bdf8` / `#00e5ff`)**: Active system focus, mana reserves, daily directives, telemetric readouts.
4. **Platform Parity**: Desktop and mobile share the identical visual DNA, token set, and color palette. Desktop expands horizontally into modular instrumentation bays; mobile condenses vertically into touch-ergonomic single-column tactical cards.

---

## 2. COLOR TOKENS

### Primary Core Palette
| Token Name | Hex Value | Purpose & Application |
|---|---|---|
| `--color-bg-base` | `#0b0b0e` | Canvas background base |
| `--color-bg-void` | `#070709` | Deepest abyssal layer, input track cavities, sunken telemetry panels |
| `--color-surface-dim` | `#0f0e13` | Default ground level surface |
| `--color-surface-low` | `#131116` | Low-elevation cards, secondary content modules |
| `--color-surface-container` | `#18161b` | Primary card panels, modal viewports, list items |
| `--color-surface-high` | `#242025` | Focused card states, hovering containers, header bars |
| `--color-surface-highest` | `#2e2930` | Active tabs, elevated action panels, highlight chips |
| `--color-surface-bright` | `#353438` | Prominent card edges, active toggle handles |

---

## 3. TEXT & TYPOGRAPHY TOKENS

### Text Colors
| Token Name | Hex Value | Application |
|---|---|---|
| `--text-primary` | `#eee9ee` | Primary headings, values, user names, high-contrast labels |
| `--text-secondary` | `#c9b6b6` | Subtitles, status descriptions, secondary attributes |
| `--text-muted` | `#94a3b8` | Monospace timestamps, telemetry indices, stat tags |
| `--text-dim` | `#64748b` | Inactive filters, placeholder values, archived notes |
| `--text-crimson` | `#ffb4ab` | Light crimson alert text, urgent notices, boss warnings |
| `--text-gold` | `#ffdcc3` | Streak numbers, high-water marks, reward amounts |

### Font Hierarchy
- **Display & Headlines (`Space Grotesk`)**: Hard-edged, angular joins, technological authority. All titles, stat counters, and modal headers use uppercase styling with tight kerning (`letter-spacing: -0.02em` to `0.02em`).
  - `display-hero`: `40px` – `48px`, Weight: `700`, Line-height: `48px`–`52px`
  - `headline-lg`: `24px` – `28px`, Weight: `600`, Line-height: `28px`–`32px`
  - `headline-md`: `20px`, Weight: `600`, Line-height: `24px`
  - `headline-sm`: `16px`, Weight: `600`, Line-height: `20px`
- **Body (`Inter`)**: High-contrast, neutral sans-serif for descriptions, paragraphs, and lists.
  - `body-lg`: `15px` – `16px`, Weight: `400`
  - `body-md`: `13px` – `14px`, Weight: `400`
  - `body-sm`: `12px`, Weight: `400`
- **Telemetry & Labels (`JetBrains Mono` / Monospace)**: Tabular machine legibility for multipliers, coordinates, timers, and timestamps.
  - `label-lg`: `12px`, Weight: `700`, Tracking: `0.15em`, Uppercase
  - `label-md`: `10px`, Weight: `500`, Tracking: `0.20em`, Uppercase
  - `label-sm`: `9px`, Weight: `700`, Tracking: `0.25em`, Uppercase

---

## 4. ACCENT SYSTEMS

### 4.1 Deep Crimson & Burgundy System (Primary Action & Boss Threat)
- **Vivid Crimson (`#dc2626`)**: Primary confirm buttons, boss threat levels, active strike triggers, active danger states.
- **Deep Crimson (`#bf0715` / `#b91c1c`)**: Button base fills, critical warnings, timer countdowns, S-Rank accents.
- **Abyssal Burgundy (`#93000a` / `#690005`)**: High-priority card headers, active combat damage banners, inset glow foundations.
- **Burgundy Container Fill (`#26171d` / `#48363c` / `#433235`)**: Translucent backdrops for raid warnings and danger modals.

### 4.2 Muted Gold & Amber System (Discipline, Streaks, Prestige)
- **Monarch Amber (`#f59e0b` / `#d97706`)**: Streak counter flame, coin balances, Season Pass premium indicators.
- **Muted Gold Highlight (`#ffb77d` / `#ffdcc3`)**: Personal records highlight, high-water mark badges, prestige crowns.
- **Deep Gold Foundation (`#ad5d00` / `#6e3900` / `#2f1500`)**: Gold card headers, milestone progress track completions.

### 4.3 Tactical Cyan System (Mana, Directives, Focus)
- **System Cyan (`#00e5ff` / `#38bdf8`)**: Used selectively for Daily Directives active tags, mana bars, active navigation pill underlines, system AI status dots, and live telemetry pulses.
- **Cyan Glow Fill (`rgba(0, 229, 255, 0.12)`)**: Inset card focus rings, scanline accents.

---

## 5. SPACING, SHAPES & ELEVATION

### Spacing Scale
- `space-xs`: `4px` (`0.25rem`)
- `space-sm`: `8px` (`0.5rem`)
- `space-md`: `16px` (`1rem`)
- `space-lg`: `24px` (`1.5rem`)
- `space-xl`: `40px` (`2.5rem`)
- **Desktop Grid Gutters**: `32px` (`2rem`) with `40px` (`2.5rem`) outer page margin.
- **Mobile Grid Gutters**: `16px` (`1rem`) with `20px` (`1.25rem`) outer screen margin.

### Border Radius
- Default / Buttons / Cards: `4px` (`rounded-sm`) to `8px` (`rounded-lg`).
- Elevated Action Trays / Modals: `12px` (`rounded-xl`).
- Status Chips & Badges: `9999px` (`rounded-full`) or `2px` chamfered corners (`clip-path: polygon(...)`).

### Borders & Dividers
- Hairline System Border: `1px solid #433235` (Burgundy muted outline) or `1px solid rgba(172, 136, 132, 0.2)` (`--outline`).
- Active / Focused Border: `1px solid #dc2626` (Crimson) or `1px solid #38bdf8` (Cyan).
- Inactive / Subtle Divider: `1px solid rgba(255, 255, 255, 0.05)`.

### Shadows & Glow Language
- **Panel Shadow**: `0 8px 32px -4px rgba(0, 0, 0, 0.75)`.
- **Crimson Combat Glow**: `0 0 20px rgba(220, 38, 38, 0.35), inset 0 0 12px rgba(220, 38, 38, 0.15)`.
- **Gold Transcendence Glow**: `0 0 24px rgba(245, 158, 11, 0.35), inset 0 0 10px rgba(245, 158, 11, 0.12)`.
- **Cyan Focus Glow**: `0 0 16px rgba(0, 229, 255, 0.30), inset 0 0 8px rgba(0, 229, 255, 0.10)`.

---

## 6. CORE REUSABLE COMPONENTS

### 6.1 AppShell & Navigation
- **Desktop Navigation**: Fixed top header or persistent sidebar (`h-16`, `#0b0b0e` at 90% opacity with `backdrop-blur-md`). Displays:
  - System Monogram (`[SYS]`) + User Level / Rank Badge.
  - Primary Route Links (Dashboard, Quests, Boss Arena, Armory, Status, Seasons, Shop, Achievements, AI).
  - Telemetry Pill: Real-time coins (`#ffdcc3`), streak flame (`#ffb77d`), and active Power Score rating.
- **Mobile Navigation**: Persistent tactile bottom dock (`h-16`, `#0f0e13` with 1px top border `#433235`). 5 primary tabs with micro icon + uppercase 9px `label-sm` font.

### 6.2 CinematicPanel (Cards & Containers)
- Base: `#18161b` fill, 1px `#433235` border, `rounded-lg`.
- Top-Right Reticle: Angular coordinate badge or monospace status indicator (`[SYS_OK]`, `ID // 0419`).
- Hover State: Inset lighting transition + 1px border shift to `rgba(220, 38, 38, 0.4)`.

### 6.3 GlowButton (Primary & Tactical Triggers)
- **Primary [System Confirm]**: Solid `#dc2626` background, `#fff6f5` uppercase text, `font-bold`, tracking `0.15em`. Glow shadow: `0 0 20px rgba(220, 38, 38, 0.45)`.
- **Secondary [Sub-Routine]**: Dark glass `#242025` with 1px `#ac8884` border. Hover lifts to 100% white border opacity.
- **Danger / Raid Strike**: Deep crimson `#690005` with animated pulsed border `#dc2626`.

### 6.4 Progress Gauges (XP, Boss HP, Mana, Season)
- Height: `8px` to `14px`, background `#070709` cavity with 1px border `#2e2930`.
- Fill Variants:
  - **Player XP**: Vibrant Gold-to-Amber gradient (`#ad5d00` to `#f59e0b`) with a 2px white-hot leading edge dot.
  - **Boss HP**: Intense Crimson gradient (`#690005` to `#dc2626`) with segmented notch marks every 20%.
  - **Season Level**: Cybernetic Cyan-to-Emerald gradient (`#00e5ff` to `#10b981`).
  - **Mana / Stamina**: Electric Azure (`#38bdf8`).

### 6.5 DarkInput & Terminal Consoles
- Background `#070709`, inset hairline border `#433235`.
- Monospace font, prefix label (`COMMAND:// ` or `SEARCH:// `) in muted crimson or cyan.
- Focus State: Border snaps to `#dc2626`, casting `0 0 10px rgba(220, 38, 38, 0.25)`.

---

## 7. APPROVED SCREENS SPECIFICATION

### 7.1 Login & Signup — System Authentication Terminal
- **Screens**:
  - Desktop: `Habbits RPG - Dark Cinematic System Authentication Terminal` (`b33eca7c50614977a52b41d27e5f8dda`)
  - Mobile: `Habbits RPG - Mobile System Authentication Terminal` (`a6e830906e0041f5b974ab8c2a45ba06`)
- **Purpose**: Authenticate existing hunters or initialize new hunter profile.
- **Primary Components**: Monolithic dark login terminal card, dual-mode tab switcher (Login / Initialize Protocol), Monospace Hunter ID & Passkey inputs, Sovereign Seal logo watermark.
- **Important States**: Initial load, input focus (crimson reticle bloom), invalid credentials (crimson warning pulse), protocol authentication in progress (strobe bar).
- **Desktop Structure**: Centered `480px` tactical terminal card floating above deep abyssal grid canvas.
- **Mobile Structure**: Full viewport height card pinned with 20px edge margins and bottom-docked submit button.

### 7.2 Dashboard — Hunter Command Center
- **Screens**:
  - Desktop: `Habbits RPG - Cinematic System Dashboard` (`76495dfe5f7d45f5b9b8e05f28005a20`)
  - Mobile: `Habbits RPG - Mobile Cinematic Dashboard` (`9dfcf991685b4bc98aed4cde6cba309f`)
- **Purpose**: Central command overview of daily discipline, vital statistics, active streak, and immediate boss threat.
- **Primary Components**: 
  - Hunter Identity Header (Avatar silhouette, Rank letter badge, Level gauge).
  - Vital Telemetry Bar (Active Streak flame, Daily XP, Coins, Power Score rating).
  - Daily Directive Stream (Today's prioritized quests with reticle checkboxes).
  - Boss Threat Monitor (Malakor portrait miniature, current HP ratio, time-until-strike).
- **Desktop Structure**: 12-column grid. Left 4 cols: Hunter Dossier & Threat Monitor. Right 8 cols: Daily Directives Matrix & Quick Actions.
- **Mobile Structure**: Single-column vertical scroll. Pinned top vital pills, stacked Directive cards, bottom boss threat banner.

### 7.3 Profile / Status — Hunter Dossier
- **Screens**:
  - Desktop: `Habbits RPG - Hunter Profile & Status Dossier` (`58b8b02fa9224a97b3124e92cbae41a7`)
  - Mobile: `Habbits RPG - Mobile Hunter Profile & Status` (`c67e8cbe33854434b21d6c7333dd7a98`)
- **Purpose**: Authoritative hunter status review following the 6-tier architecture.
- **Primary Components**:
  - Tier 1: Core Vital & Rank Identity (Level, Rank Badge, Title, XP progress).
  - Tier 2: Combat Attributes (STR, AGI, INT, DIS, VIT base vs bonus values).
  - Tier 3: Protocol Health Calendar (Streak calendar with density heatmap).
  - Tier 4: Personal Records High-Water Marks (Best Streak, Peak Power, Peak Boss).
  - Tier 5: Lifetime Career Matrix (Total quests, total XP, total boss defeats).
  - Tier 6: Factual Player Analytics (7/30/90-day timeframes, zero fabrication).
- **Desktop Structure**: Multi-bay modular dashboard layout with side-by-side attributes and calendar.
- **Mobile Structure**: 6 vertical collapsible or stacked tactical cards.

### 7.4 Armory — Equipment & Loadout Chamber
- **Screens**:
  - Desktop: `Habbits RPG - Hunter Armory & Loadout Chamber` (`cb5882a85a744098a9f23706cdc33739`)
  - Mobile: `Habbits RPG - Mobile Hunter Armory & Loadout` (`b40940d1adda4f26967796b8b1369325`)
- **Purpose**: Manage owned inventory, equip 3 gear slots, save up to 5 loadouts, equip unlocked titles, and view calculated Power Score.
- **Primary Components**:
  - Power Score Radar & Composite Rating Card.
  - Active Gear Slots (Weapon, Armor, Accessory) with non-destructive stat bonuses.
  - Loadout Preset Selector (Slots 1 to 5 with Save/Equip triggers).
  - Hunter Inventory Grid (Item rarity borders, filter tabs: Weapons, Armor, Rings, Items).
  - Prestige Titles Showcase.
- **Desktop Structure**: 3-column tactical workstation. Left: Equipped Gear & Power Score. Center: Inventory Matrix. Right: Loadouts & Titles drawer.
- **Mobile Structure**: Tabbed segmented views: [EQUIPPED] / [INVENTORY] / [LOADOUTS].

### 7.5 Quests — Daily Directives Command
- **Screens**:
  - Desktop: `Habbits RPG - Quests Mission Command Center (Desktop)` (`b8f1d7420ec84d40ae556129bdddde39`)
  - Mobile: `Habbits RPG - Mobile Quests Mission Board` (`6897e4c9c00f442a882b22a051ba608b`)
  - Subviews: `Quest Detail & Completion State` (`504c9b4326314373bef234ab291fa711`) & `Custom Quest Creation Console` (`2bba634abbba4cf0b6fe7deb92702da3`)
- **Purpose**: View, track, complete, and configure daily habit directives.
- **Primary Components**: Filter tabs (All, Daily Directives, Active, Cleared Archive), Habit Reticle Cards, Perfect Day progress bar, New Directive creation modal.
- **Important States**: Pending (gray reticle), Completed (crimson/cyan checkmark with strikethrough title), Claimed (reward collected).
- **Desktop Structure**: Header with Perfect Day banner, followed by 2-column directive cards grid.
- **Mobile Structure**: Single-column vertical list with swipe or tap-to-complete interactions.

### 7.6 Boss Arena — Monarch Raids
- **Screens**:
  - Selection/Hierarchy: `Habbits RPG - Boss Arena: Complete Raid Hierarchy` (`2508a7ff7ebc401faea8b948e690e27a`) & Mobile (`28877df8c77a4cc5b67409524a4355a6`)
  - Active Encounter: `Habbits RPG - Boss Arena: Apex Raid Chamber` (`1b118186953a42f6b1fd75f20cca989d`) & Mobile (`f981a039f3384e72be96cca57cbfac55`)
- **Purpose**: Select tier bosses or enter the active turn-based combat arena against current raid entity.
- **Primary Components**: 
  - Hierarchy Hub: Boss roster cards (Slime Sovereign, Shadow Hound, Malakor, etc.) with unlock requirements.
  - Active Chamber: Towering boss art banner, massive Boss HP bar, Combat Log console, Attack/Ability trigger deck, Hunter stamina gauge.
- **Desktop Structure**: 
  - Hierarchy: 3-column tiered cards.
  - Active Chamber: Cinematic split layout. Top: Boss Arena Banner. Bottom Left: Combat Telemetry Log. Bottom Right: Action Command Center.
- **Mobile Structure**: Fullscreen combat card with stacked Boss Artwork, Boss HP gauge, and sticky bottom attack action bar.

### 7.7 Rank Progression — Ascension Chamber
- **Screens**:
  - Desktop: `Habbits RPG - Hunter Rank Ascension Chamber` (`3f0fc6d3e86d4f68b33b8dd1b6555d29`)
  - Mobile: `Habbits RPG - Mobile Rank Ascension Evaluation` (`26a3f19085da4fe78c4547978f36dedb`)
  - Subviews: `Ascension Ready Chamber` (`939165300f144f1f864c49153c811b8f`) & `Rank D Hunter Reveal` (`84e18adf32834599893ad5d5ba1e0af2`)
- **Purpose**: Display the 10-tier rank hierarchy, track current rank criteria, and initiate rank ascension trial evaluation.
- **Primary Components**: Full rank track (F through LEGENDARY), 4 mandatory trial checklist cards, Ascension Ready trigger button, Perks Unlocked dossier.
- **Desktop Structure**: Left: Vertical Rank Ladder roadmap. Right: Large Ascension Trial criteria evaluation bay.
- **Mobile Structure**: Horizontal swipe rank picker atop 4 vertical trial requirement cards.

### 7.8 System AI — Intelligence Interface
- **Screens**:
  - Desktop: `Habbits RPG - System AI Intelligence Interface` (`ca28abe01ebd49578d67c9ef2f0d6799`)
  - Mobile: `Habbits RPG - Mobile System AI Intelligence Interface` (`b6c57998b1b14c3282102f53f40050e9`)
- **Purpose**: Pair-programming and tactical in-game guide terminal for rules, game lore, optimization tips, and coaching.
- **Primary Components**: Terminal header with operational state indicator (`SYSTEM AI: ONLINE`), Tactical Chat Log stream, System AI response cards with markdown formatting, Quick query prompt chips, Monospace command input.
- **Desktop Structure**: Centered `960px` tactical terminal viewport with docked bottom prompt bar.
- **Mobile Structure**: Fullscreen chat layout with sticky bottom input and horizontal scrolling suggestion chips.

### 7.9 Seasons & Challenges — Command Center
- **Screens**:
  - Desktop: `Habbits RPG - Seasons & Challenges Command Center` (`c4b17d7df35c479c93974a4b06fc2fb5`)
  - Mobile: `Habbits RPG - Mobile Seasons & Challenges Hub` (`5bb7541185d04850adcbdf370bd6ac82`)
- **Purpose**: Track continuous 15-day season progress (Levels 1 to 10), claim milestone rewards, and view monthly multi-objective directives.
- **Primary Components**:
  - Season Hero Header (`SEASON 02: "CYBERNETIC RESURGENCE"`, exact dates, countdown clock).
  - 15-Day Linear Progression Curve with 10 level thresholds and claimable milestone nodes (Levels 2, 4, 6, 8, 10).
  - Monthly Challenge Card (Multi-objective progress bars, reward vault, claim button).
  - Weekly Challenge Integration Card.
- **Desktop Structure**: Top hero banner, center 10-node milestone horizontal track, bottom dual-card layout for Monthly and Weekly challenges.
- **Mobile Structure**: Vertical linear stepper for season levels, followed by stacked challenge cards.

### 7.10 Shop — Hunter Requisition Vault
- **Screens**:
  - Desktop: `Habbits RPG - Hunter Requisition Shop (Desktop)` (`564682e3be934ce69382db6baeb5b63b`)
  - Mobile: `Habbits RPG - Mobile Hunter Requisition Shop` (`ce240e3201c141fc9a72ffe1533e56b9`)
- **Purpose**: Purchase gear, weapons, potions, and inventory items using accumulated quest coins.
- **Primary Components**: Coin Balance counter, Category Filter tabs (All, Weapons, Armor, Consumables), Gear Store Cards (Item icon, rarity badge, stat modifiers, price in coins), Buy Confirmation modal.
- **Desktop Structure**: 4-column responsive product card grid with sticky top header.
- **Mobile Structure**: 2-column card grid or single-column detailed list.

### 7.11 Achievements — Trial Archive
- **Screens**:
  - Desktop: `Habbits RPG - Achievements Command Center (Desktop)` (`65712bdc43294c7a926eb24d0be5f474`)
  - Mobile: `Habbits RPG - Mobile Achievements Hub` (`4128b912c91e4758959ddbd33e57ffa5`)
- **Purpose**: View lifetime milestone accomplishments, claim one-time rewards, and inspect unlock conditions.
- **Primary Components**: Total Achievement Points badge, Category Filters (Combat, Discipline, Progression, Secret), Achievement Cards with progress bars, Claim Reward button.
- **Desktop Structure**: 2-column or 3-column card grid with progress percentage pills.
- **Mobile Structure**: Single-column vertical list with distinct Locked vs Cleared card styling.

### 7.12 Cinematic Rank-Up Ascension Overlay
- **Screens**:
  - Desktop: `Habbits RPG - Cinematic Rank-Up Ascension Overlay (Desktop)` (`2be3e3d78cce4c31952a326f06f05587`)
  - Mobile: `Habbits RPG - Mobile Cinematic Rank-Up Ascension Overlay` (`e5925d5b638f4e8bacf79a5fb6e0d40b`)
- **Purpose**: Full-screen modal overlay celebrating a successful rank promotion.
- **Primary Components**: Heavy dark backdrop blur (`backdrop-blur-xl`), animated rank crest bloom, "RANK ASCENDED" header, New Rank title card, unlocked stat bonuses & features list, "ACCEPT SYSTEM PROMOTION" primary button.
- **Desktop & Mobile**: Centered modal card (`max-w-lg`) with crimson/gold ambient drop shadows.

### 7.13 Boss Victory / Defeat Overlay
- **Screens**:
  - Desktop: `Habbits RPG - Boss Victory: Raid Concluded (Desktop)` (`a4624ed20c2840a7b0aec7749ed9af7e`)
  - Mobile: `Habbits RPG - Mobile Boss Victory Overlay` (`81009c025e6d47f2b958f38c219bbac7`)
- **Purpose**: Full-screen modal overlay presenting boss raid results, victory status, and spoils distribution.
- **Primary Components**: "BOSS DEFEATED // ENCOUNTER TERMINATED" header, Boss miniature with red slash graphic, Loot Spoils Vault (Coins, XP, bonus gear drop with rarity border), "CLAIM SPOILS & RETURN" button.

### 7.14 Cinematic System Events Sheet
- **Screens**:
  - Desktop: `Habbits RPG - Cinematic Overlays & System Events (Desktop)` (`49279963715d4d0aa8901b9e72427e90`)
  - Mobile: `Habbits RPG - Mobile Cinematic Overlays & System Events` (`c936ad05697b43fba64c85ec2f1f9de0`)
- **Purpose**: Standardized specimen sheet for the 4 core systemic alert types.
- **Primary Components**:
  1. *Level Surge*: Cyan mana pulse, level number increase, attribute points granted.
  2. *Grade Promotion*: Rank transition card with gold borders.
  3. *Boss Fallen*: Crimson threat neutralized notification.
  4. *Season Rollover*: Season title announcement with timer initialization.

### 7.15 Toast & Notification System
- **Screens**:
  - Desktop: `Habbits RPG - Toast & Notification System (Desktop)` (`c21a5dff639a43bd96481505bc6a3659`)
  - Mobile: `Habbits RPG - Mobile Toast & Notification System` (`1924ae88b9c54730b6b8973c2938c9e8`)
- **Purpose**: Universal system notifications rendered in the viewport top-right (desktop) or top-center (mobile).
- **The 5 Canonical Toast Archetypes**:
  1. **Success / Objective Cleared**: Dark panel, green/cyan accent line, check icon, XP/Coin payout text.
  2. **Mana Surge / Level Up**: Cyan background tint (`rgba(0, 229, 255, 0.1)`), glowing cyan border, level number indicator.
  3. **Danger / Boss Attack Warning**: Deep burgundy fill, pulsing crimson border `#dc2626`, skull or warning reticle icon.
  4. **Threat Alert / Boss Raid Available**: Crimson indicator badge, boss name, timer countdown.
  5. **Achievement Unlocked**: Muted gold border `#f59e0b`, trophy icon, achievement title and unlocked title ID.

---

## 8. MOTION & ANIMATION LANGUAGE

Motion in Habbits RPG is disciplined, crisp, and mechanical—evoking high-performance digital displays:

1. **Entrance Transitions**:
   - Modals and Overlays: Quick scale-up (`scale(0.96)` to `scale(1)`) combined with a fast opacity fade over `180ms` (`cubic-bezier(0.16, 1, 0.3, 1)`).
   - System Notifications: Slide in from screen edge by `12px` over `150ms`.
2. **Hover & Interactive Feedback**:
   - Cards and Action Buttons: Instant hairline border luminescence (`transition-colors duration-100 ease-out`).
   - Reticle Checkboxes: Fast inner micro-flash on check (`scale(1.2)` to `scale(1.0)` in `120ms`).
3. **Pulsing Accents**:
   - Boss Danger & Threat: Slow, rhythmic ambient breathing glow (`opacity: 0.6` to `1.0` over `2.5s` linear).
   - Active Streak Flame: Subtle flicker animation on the amber icon.
4. **Progress Bar Fill**:
   - Smooth continuous linear ease when gaining XP or applying boss damage (`transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1)`).
5. **Reduced Motion**: All transitions must strictly respect `@media (prefers-reduced-motion: reduce)` by immediately jumping to final opacity and scale without duration delays.

---

## 9. KNOWN INCONSISTENCIES & GAME RULE CONFLICTS IN MOCKUPS

As specified by project requirements, Stitch is the **Visual Source of Truth**, while the React codebase is the **Functional Source of Truth**. Below are the visual anomalies and rule discrepancies discovered in the Stitch designs that must NOT override existing game logic:

1. **Rank Hierarchy Terminology Conflict**:
   - *Stitch Mockup*: Several ascension screens display titles like "Rank D Hunter Reveal", "Scout / Iron", "Hunter / Bronze", or "Monarch Rank".
   - *Actual Game Ladder*: The authoritative game ladder in `src/data/ranks.ts` is strictly:
     $$\mathbf{F \to E \to D \to C \to B \to A \to S \to SS \to HEROIC \to LEGENDARY}$$
   - *Resolution*: Retain the visual styling, card geometry, and reticles from Stitch, but bind solely to the 10 canonical ranks. Never inject "Monarch" or "Scout" as rank tiers.
2. **Season Naming in Mockup Samples**:
   - *Stitch Mockup*: Several mockup cards display `"SEASON 02 — CYBERNETIC RESURGENCE"`.
   - *Actual Game Ladder*: The application calculates continuous 15-day seasons anchored to `2026-09-01`. Season themes cycle deterministically through the 8 defined themes (`The Hunter's Awakening`, `Cybernetic Resurgence`, etc.).
3. **Fictional Boss HP & Stat Values in Mockups**:
   - *Stitch Mockup*: Malakor is depicted with `500,000 HP` or `1,000,000 HP`.
   - *Actual Game Rule*: Actual boss HP values, turn limits, and damage formulas are governed strictly by `src/data/bosses.ts` and Supabase RPC functions.
4. **Color Accent Evolution**:
   - *Early Stitch Screens ($y < 7000$)*: Relied heavily on electric cyan and purple wireframes.
   - *Final Approved Screens ($y \ge 9648$)*: Authoritatively settled on the darker, richer **Near-Black + Deep Burgundy + Crimson + Muted Gold** palette with minimal cyan for active directives.

