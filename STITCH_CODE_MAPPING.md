# CODEBASE-TO-STITCH MAPPING AUDIT (STITCH_CODE_MAPPING.md)

> **STITCH**: Visual Source of Truth (Project `Habbits RPG System UI`, ID: `14828715544746051941`).
> **CODEBASE**: Functional Source of Truth (React + TypeScript + Supabase).
> **DESIGN SPEC**: Defined in [`DESIGN.md`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/DESIGN.md).
> **AUDIT MANDATE**: Non-destructive audit only. No application code, database schema, or game logic is modified.

---

## 1. EXECUTIVE SUMMARY

This audit inspects every user-facing route, page, child component, data provider, and cinematic overlay in the Habbits RPG codebase and correlates them directly against the authoritative Stitch designs.

The objective is to establish an exact, unambiguous bridge between the existing functional architecture and the target visual implementation without compromising any underlying game mechanics, progression mathematics, or anti-exploit protections.

---

## 2. SCREEN-TO-CODE MAPPING

---

### 1. Login / Signup — System Authentication Terminal
- **Stitch Design**:
  - Desktop: `Habbits RPG - Dark Cinematic System Authentication Terminal` (`b33eca7c50614977a52b41d27e5f8dda`, $y=35931$)
  - Mobile: `Habbits RPG - Mobile System Authentication Terminal` (`a6e830906e0041f5b974ab8c2a45ba06`, $y=34542$)
- **Route**: `/login`
- **Page Component**: [`src/pages/Login.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/pages/Login.tsx)
- **Important Child Components**: None (currently a single inline `<form>`).
- **Data Sources**: [`src/lib/AuthContext.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/AuthContext.tsx), Supabase Auth (`supabase.auth.signInWithPassword`, `supabase.auth.signUp`).
- **Current UI Status**: **Bare HTML prototype**. Rendered with basic unstyled inputs, raw buttons, and plain text.
- **Design Implementation Gap**: **HIGH (Major UI Work)**.
  - Requires wrapping in a tactical `CinematicPanel`.
  - Monospace input brackets (`USER_ID:// `, `ACCESS_KEY:// `).
  - Mode toggle tab between `[LOGIN]` and `[INITIALIZE NEW HUNTER]`.
  - Crimson pulse effects on authentication errors.
  - Full mobile responsiveness with docked action trigger.

---

### 2. Dashboard — Hunter Command Center
- **Stitch Design**:
  - Desktop: `Habbits RPG - Cinematic System Dashboard` (`76495dfe5f7d45f5b9b8e05f28005a20`, $y=9648$)
  - Mobile: `Habbits RPG - Mobile Cinematic Dashboard` (`9dfcf991685b4bc98aed4cde6cba309f`, $y=9648$)
- **Route**: `/dashboard` (and `/`)
- **Page Component**: [`src/pages/Dashboard.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/pages/Dashboard.tsx)
- **Important Child Components**:
  - [`src/components/Avatar.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/Avatar.tsx)
  - [`src/components/XPBar.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/XPBar.tsx)
  - [`src/components/DailyDirectiveCard.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/DailyDirectiveCard.tsx)
  - [`src/components/PerfectDayCard.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/PerfectDayCard.tsx)
  - [`src/components/RandomEventCard.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/RandomEventCard.tsx)
  - [`src/components/WeeklyChallengeCard.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/WeeklyChallengeCard.tsx)
  - [`src/components/MonthlyChallengeCard.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/MonthlyChallengeCard.tsx)
  - [`src/components/SeasonProgressCard.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/SeasonProgressCard.tsx)
- **Data Sources**: `playerData.ts`, `questsData.ts`, `dailyDirectivesData.ts`, `perfectDayData.ts`, `seasonsData.ts`, `randomEventsData.ts`, `personalRecordsData.ts`.
- **Current UI Status**: **Functionally complete, visually mixed**. It renders all widgets in a vertical stack with mixed legacy styles.
- **Design Implementation Gap**: **HIGH (Major UI Work)**.
  - Desktop layout must adopt the 12-column tactical grid (Left 4 cols: Hunter Dossier & Threat Monitor; Right 8 cols: Directives Matrix & Quick Actions).
  - Challenge cards should be cleaned up or linked to the dedicated Seasons & Challenges Command Center.
  - Header telemetry bar must integrate streak flame, gold coin badge, and real-time Power Score pill.
  - Mobile version needs single-column condensed tactical layout.

---

### 3. Profile / Status — Hunter Dossier
- **Stitch Design**:
  - Desktop: `Habbits RPG - Hunter Profile & Status Dossier` (`58b8b02fa9224a97b3124e92cbae41a7`, $y=11672$)
  - Mobile: `Habbits RPG - Mobile Hunter Profile & Status` (`c67e8cbe33854434b21d6c7333dd7a98`, $y=11672$)
- **Route**: `/stats` (with `/profile` and `/status` redirects)
- **Page Component**: [`src/pages/Status.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/pages/Status.tsx)
- **Important Child Components**:
  - [`src/components/StreakCalendar.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/StreakCalendar.tsx)
  - [`src/components/PersonalRecordsSection.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/PersonalRecordsSection.tsx)
  - [`src/components/PlayerAnalyticsSection.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/PlayerAnalyticsSection.tsx)
  - [`src/components/Avatar.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/Avatar.tsx)
  - [`src/components/XPBar.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/XPBar.tsx)
- **Data Sources**: `playerData.ts`, `equipmentData.ts`, `titlesData.ts`, `personalRecordsData.ts`, `streakCalendarData.ts`, `analyticsData.ts`.
- **Current UI Status**: **Structurally verified, needs design token alignment**. Implements the exact 6-tier architecture (Core Identity, Attributes, Streak Calendar, Personal Records, Career Matrix, Player Analytics).
- **Design Implementation Gap**: **LOW (Minor UI Work)**.
  - Align card surfaces with `--color-surface-container` (`#18161b`).
  - Upgrade attribute pills to use uppercase monospace tags and non-destructive bonus indicators (`+X`).
  - Style analytics cards with dark gridlines and factual "No Data" states matching Stitch.

---

### 4. Armory — Equipment & Loadout Chamber
- **Stitch Design**:
  - Desktop: `Habbits RPG - Hunter Armory & Loadout Chamber` (`cb5882a85a744098a9f23706cdc33739`, $y=14324$)
  - Mobile: `Habbits RPG - Mobile Hunter Armory & Loadout` (`b40940d1adda4f26967796b8b1369325`, $y=14324$)
- **Route**: `/armory`
- **Page Component**: [`src/pages/Armory.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/pages/Armory.tsx)
- **Important Child Components**:
  - Active Gear Slots (Weapon, Armor, Accessory).
  - Power Score Radar & Effective Combat Stats math breakdown.
  - Loadout Presets Deck (1 to 5).
  - Hunter Inventory Filter Matrix.
  - Prestige Titles Showcase.
- **Data Sources**: `inventoryData.ts`, `equipmentData.ts`, `loadoutsData.ts`, `titlesData.ts`, `powerScore.ts`.
- **Current UI Status**: **Functionally robust, advanced feature set**. Cleanly segregated tabs and atomic state handlers.
- **Design Implementation Gap**: **LOW (Minor UI Work)**.
  - Add HUD corner reticles to gear slots.
  - Apply Near-Black (`#0b0b0e`) and Burgundy (`#433235`) borders.
  - Ensure item rarity borders conform to `--rarity-common`, `--rarity-rare`, `--rarity-epic`, `--rarity-legendary`.
  - Format Power Score with the glowing gold radial badge.

---

### 5. Quests — Mission Command Center
- **Stitch Design**:
  - Desktop: `Habbits RPG - Quests Mission Command Center (Desktop)` (`b8f1d7420ec84d40ae556129bdddde39`, $y=38972$)
  - Mobile: `Habbits RPG - Mobile Quests Mission Board` (`6897e4c9c00f442a882b22a051ba608b`, $y=38972$)
  - Subviews: `Quest Detail & Completion State` (`504c9b4326314373bef234ab291fa711`) & `Custom Quest Creation Console` (`2bba634abbba4cf0b6fe7deb92702da3`)
- **Route**: `/quests`
- **Page Component**: [`src/pages/Quests.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/pages/Quests.tsx)
- **Important Child Components**:
  - [`src/components/AddQuestForm.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/AddQuestForm.tsx) (maps to Custom Quest Creation Console)
  - [`src/components/DailyDirectiveCard.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/DailyDirectiveCard.tsx)
  - Filter Tabs (`all`, `active`, `completed`)
- **Data Sources**: `questsData.ts`, `dailyDirectivesData.ts`, `buffsData.ts`.
- **Current UI Status**: **Functional with standard cards**.
- **Design Implementation Gap**: **LOW–MEDIUM (Minor to Medium UI Work)**.
  - Replace circular checkboxes with the 18x18px custom square reticles from Stitch.
  - Style `AddQuestForm.tsx` as a floating modal terminal (`Custom Quest Creation Console`).
  - Add directive category badges (STRENGTH, FOCUS, VITALITY) with color-coded border accents.

---

### 6. Boss Arena — Raid Boss Hierarchy & Encounter
- **Stitch Design**:
  - Hierarchy Overview: `Habbits RPG - Boss Arena: Complete Raid Hierarchy` (`2508a7ff7ebc401faea8b948e690e27a`, $y=18670$) & Mobile (`28877df8c77a4cc5b67409524a4355a6`)
  - Active Encounter View: `Habbits RPG - Boss Arena: Apex Raid Chamber` (`1b118186953a42f6b1fd75f20cca989d`, $y=16496$) & Mobile (`f981a039f3384e72be96cca57cbfac55`)
- **Route**: `/boss`
- **Page Component**: [`src/pages/Boss.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/pages/Boss.tsx)
- **Important Child Components**:
  - Boss Card Grid with HP Bars.
  - Cadence Tabs (Weekly vs Monthly).
  - Spoils Claim Buttons.
- **Data Sources**: `bossData.ts`, `bosses.ts`.
- **Current UI Status**: **Basic overview cards only**. Lacks the cinematic active encounter chamber and dedicated victory overlay modal.
- **Design Implementation Gap**: **HIGH (Major UI Work)**.
  - Redesign Boss Hierarchy grid to match Stitch's tiered threat matrix.
  - Implement active encounter view (`Apex Raid Chamber`) with boss portrait artwork, combat log stream, and interactive damage triggers.
  - Integrate new `BossVictoryModal.tsx` for claiming rewards.

---

### 7. Rank Progression — Ascension Chamber
- **Stitch Design**:
  - Desktop: `Habbits RPG - Hunter Rank Ascension Chamber` (`3f0fc6d3e86d4f68b33b8dd1b6555d29`, $y=23318$)
  - Mobile: `Habbits RPG - Mobile Rank Ascension Evaluation` (`26a3f19085da4fe78c4547978f36dedb`, $y=23318$)
  - Specific States: `Ascension Ready Chamber (Rank E to D)` (`939165300f144f1f864c49153c811b8f`) & `Rank-Up Ascension: Rank D Hunter Reveal` (`84e18adf32834599893ad5d5ba1e0af2`)
- **Route**: `/ranks`
- **Page Component**: [`src/pages/RankProgression.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/pages/RankProgression.tsx)
- **Important Child Components**:
  - [`src/components/RankBadge.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/RankBadge.tsx)
  - [`src/components/RankInspectorModal.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/RankInspectorModal.tsx)
- **Data Sources**: `ranks.ts`, `playerData.ts`, `bossData.ts`.
- **Current UI Status**: **Highly detailed and functional**. Has the 10-rank ladder, criteria checklist, and inspector modal.
- **Design Implementation Gap**: **LOW (Minor UI Work)**.
  - Apply Stitch corner brackets and deep burgundy/crimson background treatments.
  - Align trial criteria cards with `--color-surface-container`.
  - Wire in the "ASCENSION THRESHOLD REACHED" state styling when criteria are 100% fulfilled.

---

### 8. System AI — Intelligence Interface
- **Stitch Design**:
  - Desktop: `Habbits RPG - System AI Intelligence Interface` (`ca28abe01ebd49578d67c9ef2f0d6799`, $y=25568$)
  - Mobile: `Habbits RPG - Mobile System AI Intelligence Interface` (`b6c57998b1b14c3282102f53f40050e9`, $y=25478$)
- **Route**: `/system-ai`
- **Page Component**: [`src/pages/SystemAI.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/pages/SystemAI.tsx)
- **Important Child Components**:
  - [`src/components/SystemAI/ChatMessage.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/SystemAI/ChatMessage.tsx)
  - [`src/components/SystemAI/ChatInput.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/SystemAI/ChatInput.tsx)
  - [`src/components/SystemAI/SuggestedQuestions.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/SystemAI/SuggestedQuestions.tsx)
- **Data Sources**: `systemAI.ts`, `systemAIKnowledge.ts`.
- **Current UI Status**: **Fully functional chat terminal**.
- **Design Implementation Gap**: **LOW (Minor UI Work)**.
  - Center tactical terminal viewport (`max-w-4xl`) over Near-Black background.
  - Apply monospace status header `[SYSTEM AI // STATUS: ONLINE]`.
  - Format quick question chips as chamfered reticle buttons.

---

### 9. Seasons & Challenges — Command Center
- **Stitch Design**:
  - Desktop: `Habbits RPG - Seasons & Challenges Command Center` (`c4b17d7df35c479c93974a4b06fc2fb5`, $y=30064$)
  - Mobile: `Habbits RPG - Mobile Seasons & Challenges Hub` (`5bb7541185d04850adcbdf370bd6ac82`, $y=27446$)
- **Route**: Currently embedded in `/dashboard` (No dedicated route).
- **Page Component**: Existing widgets: `SeasonProgressCard.tsx`, `WeeklyChallengeCard.tsx`, `MonthlyChallengeCard.tsx`.
- **Important Child Components**: Milestone claiming track, multi-objective progress gauges.
- **Data Sources**: `seasonsData.ts`, `weeklyChallengesData.ts`, `monthlyChallengesData.ts`.
- **Current UI Status**: **Distributed across widgets**. Functional logic is 100% verified, but lacking a dedicated command center screen.
- **Design Implementation Gap**: **HIGH (Major UI Work)**.
  - Build dedicated page or view representing the full Stitch Command Center.
  - Render the horizontal 10-node milestone track (Levels 1 to 10 with claimable chests at 2, 4, 6, 8, 10).
  - Unify Weekly and Monthly challenge cards into the dual-bay layout from Stitch.

---

### 10. Shop — Hunter Requisition Vault
- **Stitch Design**:
  - Desktop: `Habbits RPG - Hunter Requisition Shop (Desktop)` (`564682e3be934ce69382db6baeb5b63b`, $y=41018$)
  - Mobile: `Habbits RPG - Mobile Hunter Requisition Shop` (`ce240e3201c141fc9a72ffe1533e56b9`, $y=41018$)
- **Route**: `/shop`
- **Page Component**: [`src/pages/Shop.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/pages/Shop.tsx)
- **Important Child Components**: Item Card Grid, Category Filters, Purchase Confirmation Modal.
- **Data Sources**: `rewardsData.ts`, `rewards.ts`.
- **Current UI Status**: **Functional with standard cards**.
- **Design Implementation Gap**: **LOW (Minor UI Work)**.
  - Align card styles to `--color-surface-container` with sharp `4px` borders.
  - Add coin price badges styled with gold font (`#ffdcc3`) and coin icons.
  - Style the Purchase Confirmation dialog as a tactical warning modal with crimson confirm button.

---

### 11. Achievements — Trial Archive
- **Stitch Design**:
  - Desktop: `Habbits RPG - Achievements Command Center (Desktop)` (`65712bdc43294c7a926eb24d0be5f474`, $y=42996$)
  - Mobile: `Habbits RPG - Mobile Achievements Hub` (`4128b912c91e4758959ddbd33e57ffa5`, $y=42996$)
- **Route**: `/achievements` (and `/awards`)
- **Page Component**: [`src/pages/Achievements.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/pages/Achievements.tsx)
- **Important Child Components**: Category tabs, Tier grouping sections, progress bar.
- **Data Sources**: `achievementsData.ts`, `achievements.ts`.
- **Current UI Status**: **Functional list of achievements**.
- **Design Implementation Gap**: **LOW (Minor UI Work)**.
  - Structure into a 2/3-column tactical grid on desktop.
  - Style locked cards with dim slate outlines (`#353438`) and completed cards with gold/cyan glows.
  - Apply uppercase `Space Grotesk` headers and monospace index markers.

---

## 3. CINEMATIC OVERLAYS & NOTIFICATIONS MAPPING

| Overlay / Notification | Stitch Screen Reference | Existing Component in Codebase | Where Used | Reuse vs. Restyle vs. New |
|---|---|---|---|---|
| **Rank-Up Ascension Overlay** | `Habbits RPG - Cinematic Rank-Up Ascension Overlay (Desktop)` (`2be3e3d78cce4c31952a326f06f05587`) & Mobile (`e5925d5b638f4e8bacf79a5fb6e0d40b`) | [`src/components/CinematicRankUpModal.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/CinematicRankUpModal.tsx) | Mounted in `App.tsx` (lines 1367–1372), triggered when rank increases. | **Restyle Existing**: Fully functional with audio and state gating. Needs visual restyle to replace cyan theme with deep burgundy/crimson bloom. |
| **Boss Victory / Defeat Overlay** | `Habbits RPG - Boss Victory: Raid Concluded (Desktop)` (`a4624ed20c2840a7b0aec7749ed9af7e`) & Mobile (`81009c025e6d47f2b958f38c219bbac7`) | None (Currently inline claim button inside `Boss.tsx`). | Inline within `Boss.tsx`. | **New Reusable Component Required**: Create `BossVictoryModal.tsx` containing the spoils breakdown, loot chests, and claim trigger. |
| **Cinematic System Events** | `Habbits RPG - Cinematic Overlays & System Events (Desktop)` (`49279963715d4d0aa8901b9e72427e90`) & Mobile (`c936ad05697b43fba64c85ec2f1f9de0`) | [`src/components/EventOverlay.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/EventOverlay.tsx) | Mounted in `App.tsx` for level surge, streaks, boss slain, perfect days. | **Restyle Existing**: Handles all 10 event types. Needs visual restyle to adopt the dark glass container, Space Grotesk headers, and corner brackets. |
| **Toast & Notification System** | `Habbits RPG - Toast & Notification System (Desktop)` (`c21a5dff639a43bd96481505bc6a3659`) & Mobile (`1924ae88b9c54730b6b8973c2938c9e8`) | [`src/components/Toast.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/components/Toast.tsx) | Mounted in `App.tsx`, displays transient text alerts. | **Restyle Existing**: Upgrade from simple purple popover to support the 5 canonical archetypes (Success, Mana Surge, Danger, Threat Alert, Achievement). |

---

## 4. FUNCTIONAL SYSTEMS DIRECTORY

Below is the authoritative directory of where existing functional logic lives. **None of these files are to be modified during visual restyling**:

| System Area | Primary Functional Files |
|---|---|
| **Authentication & Session** | [`src/lib/AuthContext.tsx`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/AuthContext.tsx), [`src/lib/supabase.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/supabase.ts) |
| **Player State & Core Attributes** | [`src/lib/playerData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/playerData.ts), [`src/data/player.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/data/player.ts) |
| **XP & Level Mathematics** | [`src/utils/levelSystem.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/utils/levelSystem.ts) |
| **Centralized Rank Ladder & Ascension** | [`src/data/ranks.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/data/ranks.ts) (10 Ranks: F through LEGENDARY) |
| **Quests & Habit Tracking** | [`src/lib/questsData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/questsData.ts), [`src/data/quests.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/data/quests.ts) |
| **Daily Directives** | [`src/lib/dailyDirectivesData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/dailyDirectivesData.ts), [`src/data/dailyDirectives.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/data/dailyDirectives.ts) |
| **Perfect Day Evaluation** | [`src/lib/perfectDayData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/perfectDayData.ts), [`src/data/perfectDay.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/data/perfectDay.ts) |
| **Streak Calendar & History** | [`src/lib/streakCalendarData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/streakCalendarData.ts), [`src/data/streakCalendar.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/data/streakCalendar.ts) |
| **Random Events Engine** | [`src/lib/randomEventsData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/randomEventsData.ts), [`src/data/randomEvents.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/data/randomEvents.ts) |
| **Boss Progression & Raid Damage** | [`src/lib/bossData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/bossData.ts), [`src/data/bosses.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/data/bosses.ts) |
| **Inventory & Equipment** | [`src/lib/inventoryData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/inventoryData.ts), [`src/lib/equipmentData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/equipmentData.ts), [`src/data/items.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/data/items.ts) |
| **Loadouts System** | [`src/lib/loadoutsData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/loadoutsData.ts) (Max 5 presets) |
| **Titles & Power Score** | [`src/lib/titlesData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/titlesData.ts), [`src/lib/powerScore.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/powerScore.ts) |
| **Weekly Challenges** | [`src/lib/weeklyChallengesData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/weeklyChallengesData.ts), [`src/data/weeklyChallenges.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/data/weeklyChallenges.ts) |
| **Monthly Challenges** | [`src/lib/monthlyChallengesData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/monthlyChallengesData.ts), [`src/data/monthlyChallenges.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/data/monthlyChallenges.ts) |
| **15-Day Continuous Seasons** | [`src/lib/seasonsData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/seasonsData.ts), [`src/data/seasons.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/data/seasons.ts) |
| **Personal Records & Analytics** | [`src/lib/personalRecordsData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/personalRecordsData.ts), [`src/lib/analyticsData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/analyticsData.ts) |
| **Achievements System** | [`src/lib/achievementsData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/achievementsData.ts), [`src/data/achievements.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/data/achievements.ts) |
| **Shop & Consumables** | [`src/lib/rewardsData.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/rewardsData.ts), [`src/data/rewards.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/data/rewards.ts) |
| **System AI Intelligence** | [`src/lib/systemAI.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/lib/systemAI.ts), [`src/data/systemAIKnowledge.ts`](file:///c:/Users/ADMIN/OneDrive/Desktop/Habbits%20RPG/life-system/src/data/systemAIKnowledge.ts) |

---

## 5. MOCKUP VS. REAL DATA CONFLICTS

During visual implementation, placeholder text from Stitch must be substituted with real application data sources:

| Stitch Mockup Sample | Conflict Description | Real Application Source |
|---|---|---|
| `"Rank D — Hunter"`, `"Scout / Iron"`, `"Monarch"` | Fictional or non-canonical rank naming in mockup cards. | **`src/data/ranks.ts`**: Canonical 10-rank ladder (`F → E → D → C → B → A → S → SS → HEROIC → LEGENDARY`). |
| `"MALAKOR (500,000 HP / 1,000,000 HP)"` | Fictional HP scale in mockup banners. | **`src/data/bosses.ts`**: Boss HP calculated via `calculateBossHealth(playerLevel)`. |
| `"SEASON 02: CYBERNETIC RESURGENCE"` | Hardcoded season title and dates in mockup cards. | **`src/lib/seasonsData.ts`**: `getCurrentSeasonWindow()`, continuous 15-day arithmetic anchored to launch date `2026-09-01`. |
| Placeholder rewards (e.g. `+500 Coins`, `+15,000 XP`) | Arbitrary values placed in mockup modals. | **`src/data/rewards.ts`**, **`src/data/bosses.ts`**, and **`src/data/quests.ts`**: Canonical payout definitions. |
| Custom quest creation stat modifiers | Mockup illustrates non-standard attributes. | **`src/types/game.ts`**: Canonical stats (`strength, intelligence, vitality, focus, discipline, consistency`). |
| Fictional player statistics & radar | Mockup shows placeholder charts and averages. | **`src/lib/analyticsData.ts`**: Factual database records with zero fabrication. |

---

## 6. REUSABLE UI COMPONENT OPPORTUNITIES

To ensure design consistency across all 11 screens while preventing code bloat, the following reusable component layer should be introduced or standardized:

1. **`AppShell` / `TacticalHeader`**:
   - Replaces mixed top bars with a unified header (System Monogram, Rank Badge, Level, Streak Flame, Coins, Power Score).
2. **`CinematicPanel`**:
   - Standardized card container with hairline burgundy border (`#433235`), dark fill (`#18161b`), and optional reticle corner clips.
3. **`GlowButton`**:
   - Standardized primary (`#dc2626` crimson with glow), secondary (glass with border), and danger buttons.
4. **`ProgressBar`**:
   - Reusable sunken gauge (`#070709`) supporting XP (Gold), Boss HP (Crimson), Mana (Cyan), and Season progress.
5. **`DarkInput`**:
   - Reusable monospace text input with terminal prompt label (`USER_CMD:// `).
6. **`ReticleCheckbox`**:
   - Custom 18x18px square reticle replacing default HTML checkboxes across Quests, Directives, and Modals.
7. **`BossVictoryModal`**:
   - Reusable full-screen victory modal overlay currently missing from the codebase.
8. **`ModalWrapper`**:
   - Reusable dark backdrop blur wrapper for all popups (Custom Quest, Buy Confirmation, Identity, Loadout Save).

---

## 7. VISUAL IMPLEMENTATION GAPS BY EFFORT LEVEL

### 7.1 Screens that Already Closely Match (Require Minor Token/Style Refinement)
1. **Rank Progression (`/ranks`)**: 10-rank ladder, criteria checklist, and inspector modal are already mapped 1:1. Only needs color tokens and reticle brackets.
2. **Armory (`/armory`)**: 4 tabs, gear slots, loadouts, inventory, and titles are already implemented. Only needs styling polish.
3. **Profile / Status (`/stats`)**: Implements all 6 tiers cleanly. Only needs container backgrounds and typography tokens.
4. **Achievements (`/achievements`)**: Filter tabs and progress already match. Only needs grid formatting and gold/crimson badge borders.
5. **System AI (`/system-ai`)**: Chat stream and prompt chips already match. Only needs terminal styling polish.
6. **Shop (`/shop`)**: Product grid and purchase modals exist. Only needs dark burgundy styling.

### 7.2 Screens that Need Minor UI Work
1. **Quests (`/quests`)**: Filter tabs and progress exist; needs the 18x18px custom reticle checkboxes and modal styling for `AddQuestForm.tsx`.
2. **Rank-Up Overlay (`CinematicRankUpModal.tsx`)**: Functional modal exists; needs restyling from cyan to deep crimson/gold.
3. **Cinematic System Events (`EventOverlay.tsx`)**: Exists with 10 event types; needs restyling to match the 4 Stitch event card specimens.

### 7.3 Screens that Need Major UI Work
1. **Login / Signup (`/login`)**: Currently bare unstyled HTML. Must be rebuilt as the monolithic tactical Authentication Terminal.
2. **Dashboard (`/dashboard`)**: Needs full reorganization into the 12-column desktop grid and single-column mobile stack, with integrated threat monitor.
3. **Boss Arena (`/boss`)**: Needs complete visual overhaul into the tiered threat matrix, plus the active `Apex Raid Chamber` encounter view and `BossVictoryModal.tsx`.
4. **Seasons & Challenges**: Needs a dedicated Command Center page with the 10-node milestone horizontal track instead of being crammed into Dashboard widgets.
5. **Toast / Notification System (`Toast.tsx`)**: Needs complete overhaul from single purple popover to the 5 canonical toast archetypes.

---

## 8. IMPLEMENTATION READINESS

### **STATUS: READY**

### Prerequisites Before Visual Implementation Begins:
1. **Do NOT touch existing data hooks, database tables, or business logic**. All work during implementation must be purely visual/presentational (JSX markup, CSS/Tailwind classes, and reusable presentation components).
2. **Maintain Strict Rank Fidelity**: Ensure `src/data/ranks.ts` remains the sole authority for rank definitions (F through LEGENDARY).
3. **Preserve Database Sync & RLS**: All Supabase calls (`player_seasons`, `player_records`, `monthly_challenges`, etc.) must remain undisturbed.
4. **Follow `DESIGN.md`**: Adhere strictly to the color tokens, typography scales, and motion specifications established in `DESIGN.md`.

