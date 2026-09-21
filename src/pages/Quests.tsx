import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Check,
  CheckCircle2,
  Sparkles,
  X,
  Flame,
  Zap,
  Plus,
  Award,
  TrendingUp,
  RotateCcw,
  Eye,
  Info,
} from "lucide-react";
import type { Player, Quest, StatName } from "../types/game";
import type { DailyDirective } from "../data/dailyDirectives";
import { initialQuests, QUEST_REWARD_LIMITS, validateAndSanitizeQuestReward } from "../data/quests";
import DailyDirectiveCard from "../components/DailyDirectiveCard";
import { GlowButton } from "../components/ui/GlowButton";
import "./Quests.css";

interface QuestsProps {
  quests: Quest[];
  player: Player;
  onComplete: (id: string) => void;
  onEndDay: () => void;
  onAddQuest: (quest: {
    title: string;
    description: string;
    category: string;
    xpReward: number;
    coinReward: number;
    stat: StatName;
    statAmount: number;
  }) => void;
  onRemoveQuest: (id: string) => void;
  allQuestsCompleted: boolean;
  doubleXpCharges?: number;
  dailyDirective?: DailyDirective | null;
}

type StatusFilter = "all" | "active" | "completed";

const STAT_CHIPS: { value: StatName; label: string; short: string }[] = [
  { value: "strength", label: "Strength", short: "+STR" },
  { value: "intelligence", label: "Intelligence", short: "+INT" },
  { value: "vitality", label: "Vitality", short: "+VIT" },
  { value: "focus", label: "Focus", short: "+FOC" },
  { value: "discipline", label: "Discipline", short: "+DIS" },
  { value: "consistency", label: "Consistency", short: "+CON" },
];

const PRESETS = {
  easy: { xp: 25, coins: 5, stat: 1 },
  medium: { xp: 75, coins: 15, stat: 3 },
  hard: { xp: 150, coins: 30, stat: 5 },
};

function getPriorityBadge(xpReward: number): { label: string; className: string } {
  if (xpReward >= 150) return { label: "HARD", className: "priority-hard" };
  if (xpReward >= 75) return { label: "MEDIUM", className: "priority-medium" };
  return { label: "EASY", className: "priority-easy" };
}

export default function Quests({
  quests,
  player,
  onComplete,
  onEndDay,
  onAddQuest,
  onRemoveQuest,
  allQuestsCompleted,
  doubleXpCharges = 0,
  dailyDirective,
}: QuestsProps) {
  // Navigation & Filtering States
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [inspectedQuest, setInspectedQuest] = useState<Quest | null>(null);
  const [showMobileForgeModal, setShowMobileForgeModal] = useState<boolean>(false);

  // Forge Custom Directive Form States
  const [forgeTitle, setForgeTitle] = useState("");
  const [forgeDesc, setForgeDesc] = useState("");
  const [forgeStat, setForgeStat] = useState<StatName>("discipline");
  const [forgeXp, setForgeXp] = useState(50);
  const [forgeCoins, setForgeCoins] = useState(10);
  const [forgeStatAmount, setForgeStatAmount] = useState(2);
  const [selectedPreset, setSelectedPreset] = useState<"easy" | "medium" | "hard" | null>(null);
  const [forgeError, setForgeError] = useState<string | null>(null);

  // Real Metric Telemetries
  const activeCount = quests.filter((q) => !q.completed).length;
  const completedCount = quests.filter((q) => q.completed).length;
  const progressPct = quests.length > 0 ? Math.round((completedCount / quests.length) * 100) : 0;
  const completedXpHarvest = quests
    .filter((q) => q.completed)
    .reduce((acc, q) => acc + q.xpReward, 0);

  // Unique Categories dynamically extracted from quests + standard RPG stats
  const allCategories = Array.from(
    new Set([
      "ALL",
      ...quests.map((q) => q.category.toUpperCase()),
      "VITALITY",
      "STRENGTH",
      "INTELLIGENCE",
      "FOCUS",
      "DISCIPLINE",
    ])
  );

  // Filter Quests
  const filteredQuests = quests.filter((q) => {
    // 1. Status Filter
    if (statusFilter === "active" && q.completed) return false;
    if (statusFilter === "completed" && !q.completed) return false;

    // 2. Category Filter
    if (selectedCategory !== "ALL") {
      const qCat = q.category.toUpperCase();
      const qStat = q.statReward.stat.toUpperCase();
      if (qCat !== selectedCategory && qStat !== selectedCategory) {
        return false;
      }
    }

    return true;
  });

  // Preset Applicator
  const applyPreset = (preset: "easy" | "medium" | "hard") => {
    setSelectedPreset(preset);
    setForgeXp(PRESETS[preset].xp);
    setForgeCoins(PRESETS[preset].coins);
    setForgeStatAmount(PRESETS[preset].stat);
    setForgeError(null);
  };

  // Custom Quest Forge Handler
  const handleForgeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!forgeTitle.trim()) {
      setForgeError("Directive codename is required.");
      return;
    }

    const validation = validateAndSanitizeQuestReward(forgeXp, forgeCoins, forgeStatAmount);
    if (!validation.valid) {
      setForgeError(validation.error || "Reward values exceed authorized limits.");
      return;
    }

    setForgeError(null);
    onAddQuest({
      title: forgeTitle.trim(),
      description: forgeDesc.trim(),
      category: forgeStat.toUpperCase(),
      xpReward: validation.sanitized.xpReward,
      coinReward: validation.sanitized.coinReward,
      stat: forgeStat,
      statAmount: validation.sanitized.statAmount,
    });

    // Reset Form
    setForgeTitle("");
    setForgeDesc("");
    setForgeStat("discipline");
    setForgeXp(50);
    setForgeCoins(10);
    setForgeStatAmount(2);
    setSelectedPreset(null);
    setShowMobileForgeModal(false);
  };

  // Restore Default Starters
  const handleRestoreStarters = () => {
    initialQuests.forEach((q) => {
      onAddQuest({
        title: q.title,
        description: q.description,
        category: q.category,
        xpReward: q.xpReward,
        coinReward: q.coinReward,
        stat: q.statReward.stat,
        statAmount: q.statReward.amount,
      });
    });
  };

  return (
    <div className="quests-root">
      {/* Atmospheric Ambient Scrim Background */}
      <div className="quests-ambient-scrim">
        <div className="quests-ambient-glow-top" />
        <div className="quests-ambient-glow-right" />
      </div>

      {/* 1. HEADER & METRIC COMMAND BAR */}
      <section className="quests-header-section">
        <div className="quests-header-left">
          <div className="quests-protocol-tag">
            <span className="quests-protocol-beacon">◈</span>
            <span>PROTOCOL // COMBAT HABIT MATRIX</span>
            <span className="quests-protocol-divider">|</span>
            <span>SECTOR 04 [SANCTUM]</span>
          </div>

          <div className="quests-title-lockup">
            <h1 className="quests-title">QUESTS</h1>
            <span className="quests-subtitle">“Complete your objectives. Grow stronger.”</span>
          </div>
        </div>

        {/* Compact Telemetry Stat Tiles */}
        <div className="quests-telemetry-grid">
          {/* Active Quests */}
          <div className="quests-telemetry-tile">
            <div className="quests-tile-top">
              <span>ACTIVE</span>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#dc2626",
                  boxShadow: "0 0 8px #dc2626",
                }}
              />
            </div>
            <div className="quests-tile-val-row">
              <span className="quests-tile-val">{activeCount}</span>
              <span className="quests-tile-sub">/ {quests.length} IN FLIGHT</span>
            </div>
          </div>

          {/* Cleared Today */}
          <div className="quests-telemetry-tile">
            <div className="quests-tile-top">
              <span>CLEARED</span>
              <CheckCircle2 size={13} color="#22c55e" />
            </div>
            <div className="quests-tile-val-row">
              <span className="quests-tile-val">{completedCount}</span>
              <span className="quests-tile-sub" style={{ color: "#22c55e" }}>
                ({progressPct}%)
              </span>
            </div>
          </div>

          {/* XP Harvest Today */}
          <div className="quests-telemetry-tile">
            <div className="quests-tile-top">
              <span>XP HARVEST</span>
              <TrendingUp size={13} color="#ffb77d" />
            </div>
            <div className="quests-tile-val-row">
              <span className="quests-tile-val" style={{ color: "#ffb4ab" }}>
                +{completedXpHarvest}
              </span>
              <span className="quests-tile-sub">XP</span>
            </div>
          </div>

          {/* Streak */}
          <div className="quests-telemetry-tile">
            <div className="quests-tile-top">
              <span>STREAK</span>
              <Flame size={13} color="#dc2626" />
            </div>
            <div className="quests-tile-val-row">
              <span className="quests-tile-val" style={{ color: "#ffdad6" }}>
                {player.progress.currentStreak}
              </span>
              <span className="quests-tile-sub" style={{ color: "#ffb77d" }}>
                DAYS 🔥
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FILTER & ACTION DOCK */}
      <section className="quests-dock">
        {/* Category Filter Pills */}
        <div className="quests-category-scroll">
          {allCategories.map((cat) => {
            const count =
              cat === "ALL"
                ? quests.length
                : quests.filter(
                    (q) =>
                      q.category.toUpperCase() === cat ||
                      q.statReward.stat.toUpperCase() === cat
                  ).length;

            return (
              <button
                key={cat}
                type="button"
                className={`quests-cat-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{cat}</span>
                <span className="quests-cat-pill-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Right Dock Controls */}
        <div className="quests-dock-actions">
          {/* Status Switch (All / Active / Done) */}
          <div className="quests-status-switch">
            <button
              type="button"
              className={`quests-status-btn ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              ALL ({quests.length})
            </button>
            <button
              type="button"
              className={`quests-status-btn ${statusFilter === "active" ? "active" : ""}`}
              onClick={() => setStatusFilter("active")}
            >
              ACTIVE ({activeCount})
            </button>
            <button
              type="button"
              className={`quests-status-btn ${statusFilter === "completed" ? "active" : ""}`}
              onClick={() => setStatusFilter("completed")}
            >
              DONE ({completedCount})
            </button>
          </div>

          {/* Mobile Inscribe Modal Trigger */}
          <button
            type="button"
            className="quests-cat-pill"
            style={{
              background: "#201f22",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#fff",
            }}
            onClick={() => setShowMobileForgeModal(true)}
          >
            <Plus size={14} />
            <span>INSCRIBE</span>
          </button>

          {/* End Day Trigger */}
          <button
            type="button"
            className="quests-cat-pill"
            style={{
              background: "rgba(220, 38, 38, 0.15)",
              border: "1px solid rgba(220, 38, 38, 0.35)",
              color: "#ffb4ab",
            }}
            onClick={onEndDay}
          >
            <RotateCcw size={14} />
            <span>END DAY</span>
          </button>
        </div>
      </section>

      {/* 3. MAIN CONTENT: 12-COLUMN TACTICAL MATRIX */}
      <div className="quests-matrix-grid">
        {/* LEFT COLUMN: DIRECTIVE MATRIX (8 Cols) */}
        <div className="quests-matrix-column">
          {filteredQuests.length === 0 ? (
            <div
              className="quest-directive-card"
              style={{ padding: "2.5rem 1.5rem", textAlign: "center", alignItems: "center" }}
            >
              <Info size={36} color="#ac8884" style={{ marginBottom: 10 }} />
              <h3 className="quest-card-title">
                {statusFilter === "completed"
                  ? "No completed directives yet"
                  : "No quests currently assigned"}
              </h3>
              <p className="quest-card-desc" style={{ maxWidth: 440, marginTop: 6 }}>
                {statusFilter === "completed"
                  ? "Execute and complete active quests to see them archived in your mission log."
                  : "Inscribe a custom directive using the Forge console, or restore default starter habits below."}
              </p>
              {statusFilter !== "completed" && (
                <div style={{ marginTop: 18 }}>
                  <GlowButton variant="primary" size="md" onClick={handleRestoreStarters}>
                    <RotateCcw size={16} style={{ marginRight: 8 }} />
                    RESTORE STARTER QUESTS
                  </GlowButton>
                </div>
              )}
            </div>
          ) : (
            filteredQuests.map((quest) => {
              const priority = getPriorityBadge(quest.xpReward);
              const isDoubleActive = doubleXpCharges > 0 && !quest.completed;

              return (
                <article
                  key={quest.id}
                  className={`quest-directive-card ${quest.completed ? "completed" : ""}`}
                >
                  {/* Ambient Reticles */}
                  <span className="quest-reticle top-left">┌</span>
                  <span className="quest-reticle top-right">┐</span>
                  <span className="quest-reticle bottom-left">└</span>
                  <span className="quest-reticle bottom-right">┘</span>
                  <div className="quest-card-ambient-bloom" />

                  {/* Top Badges Row */}
                  <div className="quest-card-header">
                    <div className="quest-card-badges">
                      <span className="quest-badge category">
                        [ DIRECTIVE // {quest.category} ]
                      </span>
                      <span className={`quest-badge ${priority.className}`}>
                        [ {priority.label} ]
                      </span>
                      <span className="quest-badge stat" style={{ background: "#1c1b1e", color: "#ac8884" }}>
                        [ {quest.statReward.stat.toUpperCase()} ]
                      </span>
                      {quest.completed && (
                        <span className="quest-badge cleared">
                          <Check size={11} style={{ display: "inline", marginRight: 3 }} />
                          [ CLEARED ]
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="quest-card-dismiss-btn"
                      title="Remove Quest"
                      onClick={() => onRemoveQuest(String(quest.id))}
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Body: Title & Description */}
                  <div className="quest-card-body">
                    <h2 className="quest-card-title">{quest.title}</h2>
                    {quest.description && (
                      <p className="quest-card-desc">{quest.description}</p>
                    )}
                  </div>

                  {/* Footer: Rewards & Actions */}
                  <div className="quest-card-footer">
                    <div className="quest-rewards-strip">
                      <span className="quest-form-label" style={{ marginRight: 4 }}>
                        REWARDS:
                      </span>
                      <span className={`quest-reward-pill xp ${isDoubleActive ? "double" : ""}`}>
                        {isDoubleActive ? (
                          <>
                            <Sparkles size={12} color="#f59e0b" />
                            +{quest.xpReward * 2} XP (2X ELIXIR)
                          </>
                        ) : (
                          `+${quest.xpReward} XP`
                        )}
                      </span>
                      <span className="quest-reward-pill coins">
                        +{quest.coinReward} COINS
                      </span>
                      <span className="quest-reward-pill stat">
                        +{quest.statReward.amount} {quest.statReward.stat.slice(0, 3).toUpperCase()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="quest-card-actions">
                      <button
                        type="button"
                        className="quests-cat-pill"
                        style={{
                          background: "#1c1b1e",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          color: "#e5e1e5",
                          padding: "0.45rem 0.85rem",
                        }}
                        onClick={() => setInspectedQuest(quest)}
                      >
                        <Eye size={14} />
                        <span>DOSSIER</span>
                      </button>

                      {!quest.completed ? (
                        <GlowButton
                          variant="primary"
                          size="md"
                          icon={<Swords size={16} />}
                          onClick={() => onComplete(String(quest.id))}
                        >
                          COMPLETE QUEST
                        </GlowButton>
                      ) : (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: "0.75rem",
                            color: "#22c55e",
                            fontFamily: "Space Grotesk, sans-serif",
                            fontWeight: 700,
                            padding: "0.4rem 0.75rem",
                            borderRadius: 6,
                            background: "rgba(34, 197, 94, 0.12)",
                          }}
                        >
                          <Check size={14} />
                          RESOLVED
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}

          {/* Daily Mission Complete Banner */}
          {allQuestsCompleted && quests.length > 0 && (
            <div
              className="quest-directive-card"
              style={{
                background: "linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(14, 14, 17, 0.95) 100%)",
                borderColor: "rgba(34, 197, 94, 0.4)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle2 size={24} color="#22c55e" />
                <div>
                  <h3 className="quest-card-title" style={{ color: "#22c55e" }}>
                    DAILY MISSION DIRECTIVES FULLY RESOLVED
                  </h3>
                  <p className="quest-card-desc" style={{ color: "#eee9ee", marginTop: 2 }}>
                    All objectives conquered. Daily discipline matrix synchronized with system protocol.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: FORGE CONSOLE & CONTEXTUAL PROGRESSION (4 Cols) */}
        <div className="quests-sidebar-column">
          {/* FORGE CUSTOM DIRECTIVE CONSOLE */}
          <div className="quests-forge-panel">
            <div className="quests-forge-header">
              <div className="quests-forge-title-group">
                <span className="quests-forge-tag">[ FORGE DIRECTIVE // MANUAL INPUT ]</span>
                <p className="quests-forge-desc">
                  Inscribe customized habit vectors directly into hunter firmware matrix.
                </p>
              </div>
              <Swords size={20} color="#dc2626" />
            </div>

            <form className="quests-forge-form" onSubmit={handleForgeSubmit}>
              {/* Directive Codename */}
              <div className="quests-form-group">
                <label className="quests-form-label" htmlFor="forge-title-input">
                  Directive Codename
                </label>
                <input
                  id="forge-title-input"
                  type="text"
                  className="quests-form-input"
                  placeholder="e.g. 90-Minute Neural Isolation"
                  value={forgeTitle}
                  onChange={(e) => {
                    setForgeTitle(e.target.value);
                    setForgeError(null);
                  }}
                  required
                />
              </div>

              {/* Description (Optional) */}
              <div className="quests-form-group">
                <label className="quests-form-label" htmlFor="forge-desc-input">
                  Tactical Parameters (Optional)
                </label>
                <input
                  id="forge-desc-input"
                  type="text"
                  className="quests-form-input"
                  placeholder="e.g. Zero distraction ingress. Complete deep work sprint."
                  value={forgeDesc}
                  onChange={(e) => setForgeDesc(e.target.value)}
                />
              </div>

              {/* Target Attribute Chips */}
              <div className="quests-form-group">
                <span className="quests-form-label">Target Attribute Reward</span>
                <div className="quests-attr-chip-grid">
                  {STAT_CHIPS.map((chip) => (
                    <button
                      key={chip.value}
                      type="button"
                      className={`quests-attr-chip ${forgeStat === chip.value ? "selected" : ""}`}
                      onClick={() => setForgeStat(chip.value)}
                    >
                      {chip.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Presets */}
              <div className="quests-form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="quests-form-label">Caliber Presets</span>
                  <span style={{ fontSize: "0.625rem", color: "#ac8884" }}>
                    MAX: {QUEST_REWARD_LIMITS.maxXP} XP / {QUEST_REWARD_LIMITS.maxCoins} C
                  </span>
                </div>
                <div className="quests-preset-grid">
                  <button
                    type="button"
                    className={`quests-preset-btn ${selectedPreset === "easy" ? "active" : ""}`}
                    onClick={() => applyPreset("easy")}
                  >
                    EASY (25 XP)
                  </button>
                  <button
                    type="button"
                    className={`quests-preset-btn ${selectedPreset === "medium" ? "active" : ""}`}
                    onClick={() => applyPreset("medium")}
                  >
                    MED (75 XP)
                  </button>
                  <button
                    type="button"
                    className={`quests-preset-btn ${selectedPreset === "hard" ? "active" : ""}`}
                    onClick={() => applyPreset("hard")}
                  >
                    HARD (150 XP)
                  </button>
                </div>
              </div>

              {/* Numerical Reward Inputs */}
              <div className="quests-reward-inputs-row">
                <div className="quests-form-group">
                  <label className="quests-form-label" htmlFor="forge-xp-input">
                    XP (1-{QUEST_REWARD_LIMITS.maxXP})
                  </label>
                  <input
                    id="forge-xp-input"
                    type="number"
                    min={QUEST_REWARD_LIMITS.minXP}
                    max={QUEST_REWARD_LIMITS.maxXP}
                    step={1}
                    className="quests-form-input"
                    value={forgeXp}
                    onChange={(e) => {
                      setForgeXp(Number(e.target.value));
                      setSelectedPreset(null);
                      setForgeError(null);
                    }}
                  />
                </div>

                <div className="quests-form-group">
                  <label className="quests-form-label" htmlFor="forge-coins-input">
                    Coins (0-{QUEST_REWARD_LIMITS.maxCoins})
                  </label>
                  <input
                    id="forge-coins-input"
                    type="number"
                    min={QUEST_REWARD_LIMITS.minCoins}
                    max={QUEST_REWARD_LIMITS.maxCoins}
                    step={1}
                    className="quests-form-input"
                    value={forgeCoins}
                    onChange={(e) => {
                      setForgeCoins(Number(e.target.value));
                      setSelectedPreset(null);
                      setForgeError(null);
                    }}
                  />
                </div>

                <div className="quests-form-group">
                  <label className="quests-form-label" htmlFor="forge-stat-input">
                    Stat (0-{QUEST_REWARD_LIMITS.maxStatReward})
                  </label>
                  <input
                    id="forge-stat-input"
                    type="number"
                    min={QUEST_REWARD_LIMITS.minStatReward}
                    max={QUEST_REWARD_LIMITS.maxStatReward}
                    step={1}
                    className="quests-form-input"
                    value={forgeStatAmount}
                    onChange={(e) => {
                      setForgeStatAmount(Number(e.target.value));
                      setSelectedPreset(null);
                      setForgeError(null);
                    }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {forgeError && <div className="quests-forge-error">{forgeError}</div>}

              {/* Submit CTA */}
              <GlowButton variant="primary" size="md" type="submit">
                <Plus size={16} style={{ marginRight: 6 }} />
                INSCRIBE QUEST PROTOCOL
              </GlowButton>
            </form>
          </div>

          {/* Active Double XP Elixir Buff Banner */}
          {doubleXpCharges > 0 && (
            <div
              className="quests-context-card"
              style={{
                borderColor: "#ffd700",
                background: "linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(14, 14, 17, 0.95) 100%)",
              }}
            >
              <div className="quests-context-header">
                <span className="quests-context-tag" style={{ color: "#ffd700" }}>
                  DOUBLE XP ELIXIR ACTIVE
                </span>
                <Sparkles size={16} color="#ffd700" />
              </div>
              <p className="quests-context-desc" style={{ color: "#eee9ee" }}>
                Your next <strong>{doubleXpCharges}</strong> quest completions will grant <strong>2X XP</strong>!
              </p>
            </div>
          )}

          {/* Daily Directive HUD */}
          {dailyDirective && (
            <div style={{ width: "100%" }}>
              <DailyDirectiveCard directive={dailyDirective} />
            </div>
          )}

          {/* Boss Raid Progression Telemetry Tile */}
          <div className="quests-context-card">
            <div className="quests-context-header">
              <span className="quests-context-tag" style={{ color: "#dc2626" }}>
                APEX RAID SYNERGY ACTIVE
              </span>
              <Award size={16} color="#dc2626" />
            </div>
            <h3 className="quests-context-title">Raid Boss Strike Protocol</h3>
            <p className="quests-context-desc">
              Every completed quest inflicts direct kinetic strike damage to the active world boss.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.5rem 0.75rem",
                borderRadius: 6,
                background: "#060609",
                fontSize: "0.75rem",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                color: "#ffb4ab",
                marginTop: 4,
              }}
            >
              <span>DIRECT IMPACT:</span>
              <span style={{ color: "#22c55e" }}>+50 DMG / CLEAR</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE QUEST DETAIL MODAL (TACTICAL DOSSIER) */}
      <AnimatePresence>
        {inspectedQuest && (
          <div className="quest-modal-overlay" onClick={() => setInspectedQuest(null)}>
            <motion.div
              className="quest-modal-chamber"
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="quest-modal-header">
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="quest-modal-tag">
                    TACTICAL DOSSIER // CATEGORY: {inspectedQuest.category}
                  </span>
                  <h2 className="quest-modal-title">{inspectedQuest.title}</h2>
                </div>
                <button
                  type="button"
                  className="quest-modal-close-btn"
                  onClick={() => setInspectedQuest(null)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Parameters & Lore */}
              <div className="quest-modal-params-box">
                <span className="quest-modal-params-label">TACTICAL PARAMETERS</span>
                <p className="quest-modal-lore">
                  {inspectedQuest.description ||
                    "Execute standard habit execution cadence. Neurological overload triggers core stat ascension towards higher hunter clearance."}
                </p>
              </div>

              {/* Reward Breakdown Matrix */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="quest-modal-params-label">REWARD EMISSION BREAKDOWN</span>
                <div className="quest-modal-rewards-breakdown">
                  <div className="quest-modal-reward-cell">
                    <span className="quest-modal-reward-label">EXPERIENCE</span>
                    <span className="quest-modal-reward-val" style={{ color: "#ffb4ab" }}>
                      +{inspectedQuest.xpReward} XP
                    </span>
                  </div>
                  <div className="quest-modal-reward-cell">
                    <span className="quest-modal-reward-label">TREASURY</span>
                    <span className="quest-modal-reward-val" style={{ color: "#ffb77d" }}>
                      +{inspectedQuest.coinReward} COINS
                    </span>
                  </div>
                  <div className="quest-modal-reward-cell">
                    <span className="quest-modal-reward-label">ATTRIBUTE</span>
                    <span className="quest-modal-reward-val" style={{ color: "#eee9ee" }}>
                      +{inspectedQuest.statReward.amount} {inspectedQuest.statReward.stat.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="quest-modal-actions">
                <button
                  type="button"
                  className="quests-cat-pill"
                  style={{
                    background: "#201f22",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#a098a5",
                  }}
                  onClick={() => setInspectedQuest(null)}
                >
                  DISMISS
                </button>

                {!inspectedQuest.completed ? (
                  <GlowButton
                    variant="primary"
                    size="md"
                    icon={<Zap size={16} />}
                    onClick={() => {
                      onComplete(String(inspectedQuest.id));
                      setInspectedQuest(null);
                    }}
                  >
                    EXECUTE & CLAIM
                  </GlowButton>
                ) : (
                  <span
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#22c55e",
                      padding: "0.5rem 1rem",
                    }}
                  >
                    OBJECTIVE COMPLETED
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MOBILE FORGE MODAL OVERLAY */}
      <AnimatePresence>
        {showMobileForgeModal && (
          <div className="quest-modal-overlay" onClick={() => setShowMobileForgeModal(false)}>
            <motion.div
              className="quest-modal-chamber"
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="quest-modal-header">
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="quest-modal-tag">INSCRIBE QUEST // MOBILE CONSOLE</span>
                  <h2 className="quest-modal-title">NEW DIRECTIVE</h2>
                </div>
                <button
                  type="button"
                  className="quest-modal-close-btn"
                  onClick={() => setShowMobileForgeModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form className="quests-forge-form" onSubmit={handleForgeSubmit}>
                <div className="quests-form-group">
                  <label className="quests-form-label" htmlFor="m-forge-title">
                    Directive Codename
                  </label>
                  <input
                    id="m-forge-title"
                    type="text"
                    className="quests-form-input"
                    placeholder="e.g. 50 Pushups Protocol"
                    value={forgeTitle}
                    onChange={(e) => {
                      setForgeTitle(e.target.value);
                      setForgeError(null);
                    }}
                    required
                  />
                </div>

                <div className="quests-form-group">
                  <label className="quests-form-label" htmlFor="m-forge-desc">
                    Parameters (Optional)
                  </label>
                  <input
                    id="m-forge-desc"
                    type="text"
                    className="quests-form-input"
                    placeholder="e.g. Controlled form and cadence."
                    value={forgeDesc}
                    onChange={(e) => setForgeDesc(e.target.value)}
                  />
                </div>

                <div className="quests-form-group">
                  <span className="quests-form-label">Target Attribute</span>
                  <div className="quests-attr-chip-grid">
                    {STAT_CHIPS.map((chip) => (
                      <button
                        key={chip.value}
                        type="button"
                        className={`quests-attr-chip ${forgeStat === chip.value ? "selected" : ""}`}
                        onClick={() => setForgeStat(chip.value)}
                      >
                        {chip.short}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="quests-reward-inputs-row">
                  <div className="quests-form-group">
                    <label className="quests-form-label" htmlFor="m-forge-xp">
                      XP (1-{QUEST_REWARD_LIMITS.maxXP})
                    </label>
                    <input
                      id="m-forge-xp"
                      type="number"
                      min={QUEST_REWARD_LIMITS.minXP}
                      max={QUEST_REWARD_LIMITS.maxXP}
                      className="quests-form-input"
                      value={forgeXp}
                      onChange={(e) => setForgeXp(Number(e.target.value))}
                    />
                  </div>

                  <div className="quests-form-group">
                    <label className="quests-form-label" htmlFor="m-forge-coins">
                      Coins (0-{QUEST_REWARD_LIMITS.maxCoins})
                    </label>
                    <input
                      id="m-forge-coins"
                      type="number"
                      min={QUEST_REWARD_LIMITS.minCoins}
                      max={QUEST_REWARD_LIMITS.maxCoins}
                      className="quests-form-input"
                      value={forgeCoins}
                      onChange={(e) => setForgeCoins(Number(e.target.value))}
                    />
                  </div>

                  <div className="quests-form-group">
                    <label className="quests-form-label" htmlFor="m-forge-stat">
                      Stat (0-{QUEST_REWARD_LIMITS.maxStatReward})
                    </label>
                    <input
                      id="m-forge-stat"
                      type="number"
                      min={QUEST_REWARD_LIMITS.minStatReward}
                      max={QUEST_REWARD_LIMITS.maxStatReward}
                      className="quests-form-input"
                      value={forgeStatAmount}
                      onChange={(e) => setForgeStatAmount(Number(e.target.value))}
                    />
                  </div>
                </div>

                {forgeError && <div className="quests-forge-error">{forgeError}</div>}

                <div className="quest-modal-actions" style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    className="quests-cat-pill"
                    style={{ background: "#201f22", color: "#a098a5" }}
                    onClick={() => setShowMobileForgeModal(false)}
                  >
                    CANCEL
                  </button>
                  <GlowButton variant="primary" size="md" type="submit">
                    INSCRIBE DIRECTIVE
                  </GlowButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
