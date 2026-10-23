# PHASE 4 & PHASE 5 REMEDIATION REPORT

**Project:** Habbits RPG (`life-system`)  
**Stack:** React 19, TypeScript, Vite, Supabase Auth/Postgres/Edge Functions, Gemini  
**Scope:** Phase 4 (BUG-05: System AI Rank & Level Consistency) + Phase 5 (BUG-11: Boss Victory Modal & Four-Boss Visual Enhancement)  
**Status:** Remediated, verified, clean build and lint passed. Changes uncommitted and unpushed.

---

## 1. Executive Summary

Phase 4 and Phase 5 address critical discrepancies identified in `FULL_SYSTEM_AUDIT_REPORT.md`:
1. **Phase 4 (BUG-05)**: The System AI Supabase Edge Function (`supabase/functions/system-ai/index.ts`) suffered from a runtime crash (undefined `supabase` client variable when handling authenticated users) and contained outdated game progression knowledge: a legacy quadratic level formula (`floor(sqrt(Total_XP / 50))`) and an outdated 10-rank criteria table. These have been remediated to align with the authoritative progressive threshold level formula (`src/utils/levelSystem.ts`) and the 10-tier rank requirements (`src/data/ranks.ts`).
2. **Phase 5 (BUG-11 & Boss Visual Enhancement)**: `BossVictoryModal.tsx` relied on third-party Unsplash stock photos and completely omitted the monthly Apex Raid boss `monthly_leviathan`. Furthermore, the main Boss Chamber lacked character artwork foreground displays for the four raid bosses. All four verified local JPG assets (`ignis.jpg`, `vortex.jpg`, `malakar.jpg`, `leviathan.jpg`) have been integrated into both the **Boss Arena Chamber** and the **Boss Victory Modal**, layered with thematic atmospheric backgrounds, ambient glow, floating CSS micro-animations, and `prefers-reduced-motion` accessibility support. All combat mechanics and loot tables remain 100% untouched.

---

## 2. Phase 4: BUG-05 System AI Rank and Level Consistency

### 2.1 Audit Findings & Root Causes
- **Missing Supabase Client in Scope**: In `supabase/functions/system-ai/index.ts`, `supabaseAuth` was instantiated inside an `if (token !== supabaseAnonKey)` block, but line 218 subsequently called `supabase.from("player_progress")`. This produced a fatal runtime `ReferenceError: supabase is not defined` whenever an authenticated user queried the Edge Function.
- **Level Formula Divergence**: The Edge Function prompt and fallback files referenced `Level = floor(sqrt(Total_XP / 50))`. The authoritative formula in `src/utils/levelSystem.ts` is progressive exponential threshold scaling:
  $$\text{XP Required for Level } N = \lfloor 100 \times N^{1.35} \rfloor$$
  $$\text{Level } = 1 + \max \{ k \mid \text{Total XP} \ge \sum_{i=1}^{k} \lfloor 100 \times i^{1.35} \rfloor \}$$
- **Outdated Rank Criteria**: The Edge Function prompt listed deprecated XP, task, and streak requirements for Ranks E through LEGENDARY (e.g. Rank E was listed as 100 XP / 5 tasks instead of 500 XP / 8 tasks; Rank D as 500 XP / 15 tasks instead of 1,500 XP / 20 tasks; Rank S as 25,000 XP instead of 20,000 XP; Rank SS as 60,000 XP instead of 32,000 XP).
- **Secondary Drift in Frontend Knowledge**: `src/data/systemAIKnowledge.ts` and fallback responses in `src/lib/systemAI.ts` also contained the obsolete square-root formula and mismatched rank requirements.

### 2.2 Exact Formula & Logic Changes
1. **Edge Function Runtime Client Resolution**:
   - In `supabase/functions/system-ai/index.ts`:
     ```ts
     let user: any = null;
     let supabaseClient: any = null;
     if (token !== supabaseAnonKey) {
       supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
         global: { headers: { Authorization: `Bearer ${token}` } },
       });
       const { data } = await supabaseClient.auth.getUser();
       user = data?.user || null;
     }

     const supabase = supabaseClient || createClient(supabaseUrl, supabaseAnonKey);
     ```
   - Wrapped database retrieval in `try / catch` to ensure database errors log warnings rather than crashing the Edge Function.
2. **Authoritative Level Calculation in Edge Function**:
   - Implemented `getRequiredXP(level)` and `calculateLevel(totalXP)` in `supabase/functions/system-ai/index.ts` matching `src/utils/levelSystem.ts`:
     ```ts
     function getRequiredXP(level: number): number {
       return Math.floor(100 * Math.pow(level, 1.35));
     }

     function calculateLevel(totalXP: number): number {
       let level = 1;
       let remaining = totalXP;
       while (remaining >= getRequiredXP(level)) {
         remaining -= getRequiredXP(level);
         level++;
       }
       return level;
     }
     ```
   - When active player profile data is loaded from `player_progress`, `playerContext.level = calculateLevel(playerContext.totalXP)` guarantees server-side authoritative calculation.
3. **Synchronized Authoritative Game Rules & 10 Ranks**:
   - Updated `AUTHORITATIVE_GAME_RULES` in `supabase/functions/system-ai/index.ts`, `src/data/systemAIKnowledge.ts`, and fallback prompts in `src/lib/systemAI.ts` with verified thresholds:
     - **Rank F (Awakened Recruit)**: 0 XP, 0 Tasks, 0 Streak
     - **Rank E (Trainee Hunter)**: 500 XP, 8 Tasks, 2 Streak
     - **Rank D (Scout Vanguard)**: 1,500 XP, 20 Tasks, 3 Streak
     - **Rank C (Iron Striker)**: 3,500 XP, 45 Tasks, 5 Streak
     - **Rank B (Silver Slayer)**: 7,000 XP, 80 Tasks, 7 Streak | Special: Any Core Stat $\ge$ 20
     - **Rank A (Elite Champion)**: 12,500 XP, 130 Tasks, 10 Streak | Special: Any Core Stat $\ge$ 35
     - **Rank S (Shadow Monarch)**: 20,000 XP, 200 Tasks, 14 Streak | Special: Slay At Least 1 Boss
     - **Rank SS (Grand Sovereign)**: 32,000 XP, 300 Tasks, 21 Streak | Special: Slay At Least 2 Bosses
     - **Rank HEROIC (Heroic Paragon)**: 50,000 XP, 450 Tasks, 30 Streak | Special: Slay At Least 3 Bosses
     - **Rank LEGENDARY (Mythic God of Discipline)**: 75,000 XP, 650 Tasks, 45 Streak | Special: All 6 Core Attributes $\ge$ 50

---

## 3. Phase 5: BUG-11 & Four-Boss Visual Enhancement

### 3.1 Audit Findings & Root Causes
- **Missing Leviathan in Victory Modal**: `BOSS_ART_MAP` in `src/components/BossVictoryModal.tsx` lacked a mapping for `monthly_leviathan`. If a player defeated Leviathan, it fell back to a generic Unsplash image of a non-existent boss.
- **Unsplash External Dependencies**: All boss portraits loaded from external Unsplash CDN URLs (`https://images.unsplash.com/...`), causing network latency, layout shifts, and offline failures.
- **Chamber Artwork Void**: In `src/pages/Boss.tsx`, the featured chamber rendered an atmospheric CSS gradient (`BossAtmosphere`) and a crest SVG watermark (`BossCrest`), but no character illustration of the active boss.
- **Asset Filename Caveat**: Verified local files are in `public/images/bosses/`:
  - `ignis.jpg`
  - `vortex.jpg`
  - `malakar.jpg` (**spelled `malakar.jpg`, NOT `malakor.jpg`**)
  - `leviathan.jpg`

### 3.2 Exact Visual & Code Changes
1. **Centralized Boss Image Constants & Canonical Resolution**:
   - In `src/lib/bossCrestUtils.ts`:
     ```ts
     export const BOSS_IMAGE_MAP: Record<BossKey, string> = {
       ignis: "/images/bosses/ignis.jpg",
       vortex: "/images/bosses/vortex.jpg",
       malakor: "/images/bosses/malakar.jpg", // Note: verified filename is malakar.jpg
       leviathan: "/images/bosses/leviathan.jpg",
     };

     export function normalizeBossKey(bossId: string): BossKey {
       const id = (bossId || "").toLowerCase();
       if (id.includes("ignis")) return "ignis";
       if (id.includes("vortex")) return "vortex";
       if (id.includes("leviathan")) return "leviathan";
       if (id.includes("malakor") || id.includes("malakar")) return "malakor";
       return "malakor";
     }

     export function getBossArtwork(bossId: string): string {
       const key = normalizeBossKey(bossId);
       return BOSS_IMAGE_MAP[key] || "/images/bosses/ignis.jpg";
     }
     ```
   - In `src/data/bosses.ts`: Added `artworkUrl: string` directly to `BossDef` interface and populated each of the 4 boss definitions.
2. **Boss Victory Modal (`src/components/BossVictoryModal.tsx` & `.css`)**:
   - Replaced all Unsplash URLs with local `/images/bosses/*.jpg` paths.
   - Added explicit entry for `monthly_leviathan: "/images/bosses/leviathan.jpg"`.
   - Used `boss.artworkUrl || BOSS_ART_MAP[boss.id] || getBossArtwork(boss.id)`.
   - Added `onError` fallback on `<img>` to safely recover if an asset fails to load.
   - Updated `.boss-avatar-img` with `object-position: center 25%` and transition styling.
3. **Featured Apex Chamber Character Artwork Stage (`src/pages/Boss.tsx` & `.css`)**:
   - Inserted `<div className="boss-hero-character-stage" aria-hidden="true">` inside `.boss-hero-art-layer`.
   - Rendered `<img src={...} className="boss-hero-character-art" loading="eager" decoding="async" />`.
   - Styled `.boss-hero-character-stage` with responsive positioning (`z-index: 2`):
     - Mobile (<640px): Centered, `width: 240px; height: 240px; opacity: 0.38` as a non-intrusive backdrop behind hero typography.
     - Tablet/Desktop (≥640px): Right-aligned, `width: 360px` to `490px`, `opacity: 0.94` to `1.0`.
   - Applied CSS `mix-blend-mode: screen` and a radial gradient mask (`mask-image: radial-gradient(...)`) so the deep black JPG background dissolves seamlessly into the thematic atmospheric background (`BossAtmosphere`) and surrounding dark UI.
   - Retained the fiery red ambiance for Ignis, electric blue/violet for Vortex, cosmic magenta/purple for Malakor, and deep oceanic cyan for Leviathan.
   - Added gentle micro-animation `@keyframes bossArtworkFloat` (6-7s cycle, subtle 8-9px translation and 1.5% scale pulse).
   - Applied defeated state styling: when `isDefeated` is true, the character artwork automatically dims with `filter: grayscale(0.85) contrast(1.1) brightness(0.45); opacity: 0.35; animation: none`.
4. **Threat Telemetry Rotation Strip**:
   - Added `.boss-rotation-avatar-socket` with a thumbnail preview of each boss artwork alongside the existing crest socket.
5. **Accessibility & Reduced Motion**:
   - Added `@media (prefers-reduced-motion: reduce)` in both `Boss.css` and `BossVictoryModal.css` disabling floating animations, pulses, and transitions.
   - Set `aria-hidden="true"` on non-semantic decorative stages and maintained clear `alt` tags on all images.

---

## 4. Boss Artwork Matrix & Rendering Locations

| Boss ID | Canonical Name | Local Image File | Rendered In Apex Chamber | Rendered In Rotation Strip | Rendered In Victory Modal |
|---|---|---|---|---|---|
| `weekly_ignis` | Ignis, the Flame of Lethargy | `/images/bosses/ignis.jpg` | `.boss-hero-character-stage` | `.boss-rotation-avatar-socket` | `.boss-avatar-frame` |
| `weekly_vortex` | Vortex, the Mind Fog | `/images/bosses/vortex.jpg` | `.boss-hero-character-stage` | `.boss-rotation-avatar-socket` | `.boss-avatar-frame` |
| `monthly_malakor` | Malakor, The Procrastination Monarch | `/images/bosses/malakar.jpg` | `.boss-hero-character-stage` | `.boss-rotation-avatar-socket` | `.boss-avatar-frame` |
| `monthly_leviathan` | Abyssal Leviathan of Chaos | `/images/bosses/leviathan.jpg` | `.boss-hero-character-stage` | `.boss-rotation-avatar-socket` | `.boss-avatar-frame` |

*Note: All images verified existing in `public/images/bosses/`. Malakor uses file `malakar.jpg`.*

---

## 5. Verification Commands and Results

| # | Command Executed | Target / Purpose | Result |
|---|---|---|---|
| 1 | `npx tsx scratch/verify_phase4_5.mts` | 57 focused unit checks covering formula parity, threshold values, disk asset checks, normalization, and victory modal mapping | **57 / 57 PASS** (0 failures) |
| 2 | `npm run lint` (`oxlint`) | Static code analysis across entire codebase | **0 warnings, 0 errors** (99 files checked) |
| 3 | `npm run build` (`tsc -b && vite build`) | TypeScript compiler check and Vite production bundle | **PASS** (zero compilation errors, built in 1.69s) |
| 4 | `git diff --check` | Trailing whitespace and merge conflict check | **PASS** (clean diff) |
| 5 | `git status` | Working tree status | Verified only intended files modified |

---

## 6. Files Changed

1. `supabase/functions/system-ai/index.ts`
   - Added `// @ts-nocheck` and `declare const Deno: any;` to resolve IDE TypeScript diagnostics for the Deno runtime environment within a Vite/React workspace.
   - Defined `const supabase` client safely in scope for authenticated user queries.
   - Added `getRequiredXP` and `calculateLevel` functions.
   - Populated `playerContext.level` using authoritative formula.
   - Updated `AUTHORITATIVE_GAME_RULES` with progressive level formula and 10 verified ranks.
   - Wrapped database fetching in `try / catch`.
   - Added safe `typeof v === "string"` check prior to `geminiApiKey = v.trim()`.
2. `scratch/verify_phase4_5.mts`
   - Added `// @ts-nocheck` and `/// <reference types="node" />` to satisfy the editor language service outside the Vite `src/` root.
3. `src/data/systemAIKnowledge.ts`
   - Replaced square-root level formula with progressive threshold formula.
4. `src/lib/systemAI.ts`
   - Replaced square-root level formula with progressive threshold formula in local fallback.
   - Aligned 10-rank requirements with `src/data/ranks.ts`.
5. `src/lib/bossCrestUtils.ts`
   - Added `BOSS_IMAGE_MAP` constant mapping all 4 canonical keys to verified local JPG paths.
   - Added `getBossArtwork(bossId)` resolution helper.
   - Extended `normalizeBossKey` to support both `malakor` and `malakar` spellings.
6. `src/data/bosses.ts`
   - Added `artworkUrl: string` to `BossDef` interface.
   - Populated local artwork URLs for all 4 bosses.
7. `src/components/BossVictoryModal.tsx`
   - Removed external Unsplash image URLs.
   - Mapped all 4 bosses (including `monthly_leviathan`) to local `/images/bosses/*.jpg`.
   - Added image load error fallback.
8. `src/components/BossVictoryModal.css`
   - Added `object-position: center 25%` and transition styling.
   - Added `@media (prefers-reduced-motion: reduce)` block.
9. `src/pages/Boss.tsx`
   - Rendered `.boss-hero-character-stage` with boss artwork in `.boss-hero-art-layer`.
   - Rendered `.boss-rotation-avatar-socket` with boss thumbnail in the rotation threat strip.
   - Preserved all combat mechanics, HP values, damage multipliers, and quest handlers.
10. `src/pages/Boss.css`
   - Styled `.boss-hero-character-stage` and `.boss-hero-character-art` with `mix-blend-mode: screen`, radial gradient mask, and drop shadow.
   - Added `@keyframes bossArtworkFloat` animation.
   - Styled `.boss-rotation-avatar-socket` and thumbnail image.
   - Added `@media (prefers-reduced-motion: reduce)` support.

---

## 7. Limitations & Remaining Manual Verification

1. **Supabase Edge Function Deployment**:
   - Per project guidelines, Edge Functions were **not automatically deployed** to remote Supabase infrastructure.
   - When ready to deploy the updated `system-ai` function to production, run:
     ```bash
     npx supabase functions deploy system-ai --project-ref <your-supabase-project-id>
     ```
2. **Local Browser Testing**:
   - Static asset resolution, casing, TypeScript types, and unit tests have verified asset paths and logic.
   - Start the local dev server using `npm run dev` and navigate to `/boss` to view the live animated boss visuals and trigger a boss defeat to inspect the victory modal.

---

## 8. Git Safety
- All changes remain **uncommitted and unstaged** for review.
- No unrelated files or directories were modified.
