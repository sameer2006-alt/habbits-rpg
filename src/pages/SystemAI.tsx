import { useState, useRef, useEffect } from "react";
import {
  Brain,
  Shield,
  Swords,
  Activity,
  Award,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { Player } from "../types/game";
import { askSystemAI, type SystemAIMessage } from "../lib/systemAI";
import { getRankDefinition, getNextRank } from "../data/ranks";
import { calculatePowerScore } from "../lib/powerScore";
import { getRequiredXP, getXPIntoCurrentLevel } from "../utils/levelSystem";
import { ChatMessage } from "../components/SystemAI/ChatMessage";
import { ChatInput } from "../components/SystemAI/ChatInput";
import { SuggestedQuestions } from "../components/SystemAI/SuggestedQuestions";
import type { WeeklyChallenge } from "../data/weeklyChallenges";
import type { MonthlyChallenge } from "../data/monthlyChallenges";
import type { PlayerSeason } from "../data/seasons";
import type { PlayerRecordsMap } from "../lib/personalRecordsData";
import "./SystemAI.css";

interface SystemAIProps {
  player: Player | null;
  totalQuestsCompleted: number;
  bossesDefeatedCount?: number;
  powerScore?: number;
  equippedTitle?: string;
  equippedGear?: { weapon?: string; armor?: string; accessory?: string };
  activeRandomEvent?: string;
  weeklyChallenge?: WeeklyChallenge | null;
  monthlyChallenge?: MonthlyChallenge | null;
  playerSeason?: PlayerSeason | null;
  records?: PlayerRecordsMap;
}

const INITIAL_GREETING: SystemAIMessage = {
  id: "init-system-ai",
  role: "assistant",
  content: `### SYSTEM AI // NEURAL INTERFACE ONLINE
Welcome, Hunter. I am **System AI**, your tactical game guide and general intelligence assistant.

Ask me anything regarding **Habbits RPG** (ranks, directives, arena bosses, XP thresholds, power score, equipment, and attribute vectors), or use this terminal as an open assistant for questions on study, coding, science, or productivity.

All responses are synthesized in real-time with zero state-mutation permissions. How may I assist your journey today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

export default function SystemAI({
  player,
  totalQuestsCompleted,
  bossesDefeatedCount = 0,
  powerScore,
  equippedTitle,
  equippedGear,
  activeRandomEvent,
  weeklyChallenge,
  monthlyChallenge,
  playerSeason,
  records,
}: SystemAIProps) {
  const [messages, setMessages] = useState<SystemAIMessage[]>([INITIAL_GREETING]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Derive real-time telemetry from runtime props
  const playerName = player?.profile?.name || "HUNTER";
  const currentRankId = player?.progress?.rank || "F";
  const currentRankDef = getRankDefinition(currentRankId);
  const nextRankDef = getNextRank(currentRankId);
  const playerLevel = player?.progress?.level || 1;
  const playerTotalXP = player?.progress?.totalXP || 0;
  const currentStreak = player?.progress?.currentStreak || 0;

  const currentLevelXP = getXPIntoCurrentLevel(playerTotalXP);
  const reqLevelXP = getRequiredXP(playerLevel);
  const levelPercent = Math.min(
    100,
    Math.floor((currentLevelXP / Math.max(1, reqLevelXP)) * 100)
  );

  const computedPowerScore =
    powerScore ??
    (player
      ? calculatePowerScore({
          level: playerLevel,
          rankTierOrder: currentRankDef.tierOrder,
          effectiveStats: player.stats,
          totalQuestsCompleted,
          bestStreak: player.progress.bestStreak ?? currentStreak,
          bossesSlain: bossesDefeatedCount,
          achievementsUnlocked: 0,
        })
      : 100);

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;
    setErrorState(null);
    setLastFailedQuery(null);

    const userMessage: SystemAIMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    const playerContext = player
      ? {
          rank: player.progress.rank,
          level: player.progress.level,
          totalXP: player.progress.totalXP,
          coins: player.progress.coins,
          currentStreak: player.progress.currentStreak,
          bestStreak: player.progress.bestStreak,
          tasksCompleted: totalQuestsCompleted,
          bossesSlain: bossesDefeatedCount,
          powerScore: computedPowerScore,
          equippedTitle,
          equippedGear,
          activeRandomEvent,
          weeklyChallenge: weeklyChallenge
            ? {
                title: weeklyChallenge.title,
                progress: `${weeklyChallenge.currentProgress}%`,
                objectives: weeklyChallenge.objectives
                  .map((o) => `${o.description}: ${o.currentValue}/${o.targetValue}`)
                  .join("; "),
                expiresAt: weeklyChallenge.weekEnd,
                completed: weeklyChallenge.completed,
              }
            : undefined,
          monthlyChallenge: monthlyChallenge
            ? {
                title: monthlyChallenge.title,
                objectives: monthlyChallenge.objectives
                  .map((o) => `${o.description}: ${o.currentValue}/${o.targetValue}`)
                  .join("; "),
                daysRemaining: 19,
                completed: monthlyChallenge.completed,
              }
            : undefined,
          playerSeason: playerSeason
            ? {
                name: "Season Trial",
                level: playerSeason.seasonLevel,
                xp: playerSeason.seasonXP,
                daysRemaining: 12,
              }
            : undefined,
          personalRecords: records
            ? Object.fromEntries(
                Object.entries(records).map(([k, v]) => [k, v?.recordValue || 0])
              )
            : undefined,
          stats: player.stats,
        }
      : undefined;

    try {
      const response = await askSystemAI(queryText.trim(), newHistory, playerContext);

      if (response.success && response.reply) {
        const assistantMessage: SystemAIMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: response.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errMsg = response.error || "Communication failure with System AI.";
        setErrorState(errMsg);
        setLastFailedQuery(queryText.trim());
      }
    } catch (err: any) {
      const errMsg = err?.message || "An unexpected neural network error occurred.";
      setErrorState(errMsg);
      setLastFailedQuery(queryText.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedQuery) {
      handleSendMessage(lastFailedQuery);
    }
  };

  return (
    <div className="system-ai-root">
      <div className="system-ai-layout-container">
        {/* ==================================================================
            1. SUB-HEADER BAR: Breadcrumbs & Live Node Telemetry
            ================================================================== */}
        <div className="ai-sub-header">
          <div className="ai-breadcrumbs">
            <span className="ai-breadcrumb-dim">SYSTEM PROTOCOL</span>
            <span className="ai-breadcrumb-sep">/</span>
            <span style={{ color: "#fff", fontWeight: 700 }}>HUNTER {playerName.toUpperCase()}</span>
            <span className="ai-breadcrumb-sep">/</span>
            <span className="ai-breadcrumb-active">INTELLIGENCE TERMINAL</span>
          </div>

          <div className="ai-status-pill-wrap">
            <span className="ai-pulse-dot">
              <span className="ai-pulse-dot-ping" />
              <span className="ai-pulse-dot-core" />
            </span>
            <span>
              ONLINE • READ-ONLY LINK | LATENCY: <span className="ai-latency-val">14MS</span> | NODE // PR-804
            </span>
          </div>
        </div>

        {/* ==================================================================
            2. MAIN 12-COLUMN ASYMMETRIC GRID
            ================================================================== */}
        <div className="ai-main-grid">
          {/* ================================================================
              LEFT COLUMN: DOMINANT CONVERSATION & AI CORE (8 COLS)
              ================================================================ */}
          <div className="ai-left-column">
            {/* CINEMATIC AI HERO SECTION */}
            <section className="ai-hero-panel">
              <div className="ai-hero-content">
                <div className="ai-hero-info">
                  <div className="ai-hero-tag">
                    <span className="ai-hero-tag-dot" />
                    <span>INTELLIGENCE INTERFACE // PROTOCOL LINK ACTIVE</span>
                  </div>

                  <div className="ai-hero-title-wrap">
                    <h1>SYSTEM AI</h1>
                    <p className="ai-hero-subtitle">Your progress. Your system. Your answers.</p>
                  </div>

                  <p className="ai-hero-desc">
                    Query verified progression telemetry, habit directives, rank advancement hurdles,
                    active boss raids, armory equipment loadouts, or seasonal objectives. All responses
                    are mathematically bounded to your real-time protocol dossier.
                  </p>

                  <div className="ai-hero-meta-strip">
                    <span className="ai-meta-item">
                      <Shield size={14} style={{ color: "var(--ai-primary)" }} />
                      <span>AUTHORIZED RANK {currentRankId} ACCESS</span>
                    </span>
                    <span>•</span>
                    <span className="ai-meta-item">
                      <Activity size={14} style={{ color: "var(--ai-tertiary)" }} />
                      <span>REASONING KERNEL: V4.92</span>
                    </span>
                    <span>•</span>
                    <span className="ai-meta-item" style={{ color: "var(--ai-cyan)" }}>
                      <Sparkles size={14} />
                      <span>0.00% HALLUCINATION TOLERANCE</span>
                    </span>
                  </div>
                </div>

                {/* Right Concentric Orbital Reticle */}
                <div className="ai-reticle-container">
                  <div className="ai-reticle-socket">
                    <div className="ai-ring-outer" />
                    <div className="ai-ring-dashed" />
                    <div className="ai-ring-inner" />
                    <div className="ai-ring-pulse" />

                    <div className="ai-reticle-coord top-right">CORE 0.94</div>
                    <div className="ai-reticle-coord bottom-left">SYNC 99%</div>

                    <div className="ai-reticle-center-core">
                      <Brain size={28} />
                    </div>

                    <div className="ai-corner-reticle tl" />
                    <div className="ai-corner-reticle tr" />
                    <div className="ai-corner-reticle bl" />
                    <div className="ai-corner-reticle br" />
                  </div>
                </div>
              </div>
            </section>

            {/* CONVERSATION STREAM WRAPPER */}
            <div className="ai-stream-wrapper">
              <div className="ai-stream-header">
                <div className="ai-stream-title-group">
                  <span className="ai-stream-square" />
                  <span className="ai-stream-title">NEURAL CONVERSATION STREAM</span>
                  <span className="ai-stream-thread-tag">THREAD: #PR-SYNC-094</span>
                </div>
                <span className="ai-stream-status-pill">
                  <span className="ai-pulse-dot-core" style={{ width: 6, height: 6 }} />
                  <span>TELEMETRY ACTIVE</span>
                </span>
              </div>

              {/* Scrollable Conversation Feed */}
              <div className="ai-stream-feed" id="conversation-stream">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}

                {/* Loading / Thinking State */}
                {isLoading && (
                  <div className="ai-thinking-node">
                    <div className="ai-message-tag-bar">
                      <span className="ai-message-role-tag assistant" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <span>[ SYSTEM AI ANALYZING TELEMETRY MATRIX... ]</span>
                        <span className="ai-thinking-dots">
                          <span className="ai-thinking-dot cyan" />
                          <span className="ai-thinking-dot crimson" />
                          <span className="ai-thinking-dot gold" />
                        </span>
                      </span>
                    </div>

                    <div className="ai-thinking-bar-wrap">
                      <div className="ai-thinking-lead">
                        <span>Querying player dossier and authoritative rule matrices...</span>
                        <span style={{ color: "var(--ai-cyan)", fontWeight: 700 }}>SYNTHESIZING</span>
                      </div>
                      <div className="ai-thinking-gauge">
                        <div className="ai-thinking-gauge-fill" />
                      </div>
                      <div className="ai-thinking-telemetry-row">
                        <span>STREAM // 0x48FA</span>
                        <span>MEM: 142MB</span>
                        <span style={{ color: "var(--ai-primary-text)" }}>RANK: {currentRankId}</span>
                        <span style={{ color: "var(--ai-cyan)" }}>CP: {computedPowerScore.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {errorState && (
                  <div className="ai-error-box">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <AlertTriangle size={18} color="#ef4444" />
                      <span>{errorState}</span>
                    </div>
                    {lastFailedQuery && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="ai-error-retry-btn"
                      >
                        <RefreshCw size={12} style={{ display: "inline", marginRight: 4 }} />
                        Retry Query
                      </button>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions Chips */}
              <SuggestedQuestions onSelectQuestion={handleSendMessage} />

              {/* Sunken Command Input Dock */}
              <ChatInput onSend={handleSendMessage} isLoading={isLoading} maxLength={500} />
            </div>
          </div>

          {/* ================================================================
              RIGHT COLUMN: CONTEXTUAL DOSSIER & CAPABILITIES (4 COLS)
              ================================================================ */}
          <div className="ai-right-column">
            {/* CARD 1: REAL-TIME HUNTER TELEMETRY DOSSIER */}
            <div className="ai-context-panel">
              <div className="ai-context-panel-header">
                <div className="ai-context-panel-title-group">
                  <span className="ai-context-eyebrow">REAL-TIME TELEMETRY</span>
                  <h3 className="ai-context-title">HUNTER DOSSIER</h3>
                </div>
                <div className="ai-live-badge">
                  <span className="ai-pulse-dot-core" style={{ width: 6, height: 6 }} />
                  <span>LIVE</span>
                </div>
              </div>

              <div className="ai-telemetry-stack">
                {/* Level & XP Bar */}
                <div className="ai-dossier-cell stacked">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="ai-dossier-label">Hunter Level</span>
                    <span className="ai-dossier-val primary" style={{ fontSize: "1rem" }}>
                      LV {playerLevel}
                    </span>
                  </div>
                  <div className="ai-dossier-bar-wrap">
                    <div
                      className="ai-dossier-bar-fill"
                      style={{ width: `${levelPercent}%` }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--ai-text-slate)" }}>
                    <span>
                      {currentLevelXP.toLocaleString()} / {reqLevelXP.toLocaleString()} XP
                    </span>
                    <span style={{ color: "var(--ai-primary-text)", fontWeight: 700 }}>
                      {levelPercent}%
                    </span>
                  </div>
                </div>

                {/* Ascension Rank */}
                <div className="ai-dossier-cell">
                  <span className="ai-dossier-label">Ascension Rank</span>
                  <div style={{ textAlign: "right" }}>
                    <span className="ai-dossier-val" style={{ color: currentRankDef.color }}>
                      Rank {currentRankId} ({currentRankDef.titleTag})
                    </span>
                    {nextRankDef && (
                      <span style={{ display: "block", fontSize: "0.65rem", color: "var(--ai-tertiary)" }}>
                        Target: Rank {nextRankDef.badgeLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Combat Power */}
                <div className="ai-dossier-cell">
                  <span className="ai-dossier-label">Combat Power</span>
                  <div style={{ textAlign: "right" }}>
                    <span className="ai-dossier-val primary" style={{ fontSize: "1rem" }}>
                      {computedPowerScore.toLocaleString()} CP
                    </span>
                    <span style={{ display: "block", fontSize: "0.65rem", color: "var(--ai-text-dim)" }}>
                      Rank {currentRankId} Resonance
                    </span>
                  </div>
                </div>

                {/* Continuity Streak */}
                <div className="ai-dossier-cell">
                  <span className="ai-dossier-label">Continuity Streak</span>
                  <div style={{ textAlign: "right" }}>
                    <span className="ai-dossier-val cyan">
                      {currentStreak} Days Active
                    </span>
                    <span style={{ display: "block", fontSize: "0.65rem", color: "var(--ai-success)" }}>
                      Streak Discipline Active
                    </span>
                  </div>
                </div>

                {/* Directives Cleared */}
                <div className="ai-dossier-cell">
                  <span className="ai-dossier-label">Directives Cleared</span>
                  <div style={{ textAlign: "right" }}>
                    <span className="ai-dossier-val">
                      {totalQuestsCompleted} Completed
                    </span>
                    <span style={{ display: "block", fontSize: "0.65rem", color: "var(--ai-primary-text)" }}>
                      Quests Validated
                    </span>
                  </div>
                </div>

                {/* Equipped Weapon / Gear */}
                <div className="ai-dossier-cell">
                  <span className="ai-dossier-label">Equipped Weapon</span>
                  <div style={{ textAlign: "right" }}>
                    <span className="ai-dossier-val tertiary">
                      {equippedGear?.weapon || "Standard Blade"}
                    </span>
                    <span style={{ display: "block", fontSize: "0.65rem", color: "var(--ai-text-dim)" }}>
                      {equippedGear?.armor ? `Armor: ${equippedGear.armor}` : "Standard Armor"}
                    </span>
                  </div>
                </div>

                {/* Active Title & Cycle subgrid */}
                <div className="ai-dossier-subgrid">
                  <div className="ai-dossier-subcell">
                    <span className="ai-dossier-subcell-label">Active Title</span>
                    <span className="ai-dossier-subcell-val">
                      [{equippedTitle || "Awakened"}]
                    </span>
                  </div>
                  <div className="ai-dossier-subcell">
                    <span className="ai-dossier-subcell-label">Arena Raids</span>
                    <span className="ai-dossier-subcell-val" style={{ color: "var(--ai-tertiary)" }}>
                      {bossesDefeatedCount} Bosses Slayed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: AI CAPABILITIES DIRECTORY */}
            <div className="ai-context-panel">
              <div className="ai-context-panel-header">
                <div className="ai-context-panel-title-group">
                  <span className="ai-context-eyebrow" style={{ color: "var(--ai-cyan)" }}>
                    DIRECTORY
                  </span>
                  <h3 className="ai-context-title">AI CAPABILITIES</h3>
                </div>
                <Brain size={18} style={{ color: "var(--ai-text-dim)" }} />
              </div>

              <p style={{ fontSize: "0.74rem", color: "var(--ai-text-slate)", margin: 0, lineHeight: 1.4 }}>
                System AI provides deep telemetry queries across 7 authorized protocol domains:
              </p>

              <div className="ai-capabilities-list">
                <div className="ai-capability-item">
                  <span className="ai-capability-lead">
                    <BookOpen size={14} style={{ color: "var(--ai-tertiary)" }} />
                    <span>Game Intel & Rules</span>
                  </span>
                  <span className="ai-capability-online-tag">ONLINE</span>
                </div>

                <div className="ai-capability-item">
                  <span className="ai-capability-lead">
                    <TrendingUp size={14} style={{ color: "var(--ai-tertiary)" }} />
                    <span>Player Progression & Leveling</span>
                  </span>
                  <span className="ai-capability-online-tag">ONLINE</span>
                </div>

                <div className="ai-capability-item">
                  <span className="ai-capability-lead">
                    <CheckCircle2 size={14} style={{ color: "var(--ai-tertiary)" }} />
                    <span>Habit Directive Guidance</span>
                  </span>
                  <span className="ai-capability-online-tag">ONLINE</span>
                </div>

                <div className="ai-capability-item">
                  <span className="ai-capability-lead">
                    <Award size={14} style={{ color: "var(--ai-tertiary)" }} />
                    <span>Rank Ascension Analysis</span>
                  </span>
                  <span className="ai-capability-online-tag">ONLINE</span>
                </div>

                <div className="ai-capability-item">
                  <span className="ai-capability-lead">
                    <Swords size={14} style={{ color: "var(--ai-tertiary)" }} />
                    <span>Boss Raids & Multipliers</span>
                  </span>
                  <span className="ai-capability-online-tag">ONLINE</span>
                </div>

                <div className="ai-capability-item">
                  <span className="ai-capability-lead">
                    <Shield size={14} style={{ color: "var(--ai-tertiary)" }} />
                    <span>Armory Loadouts & Gear</span>
                  </span>
                  <span className="ai-capability-online-tag">ONLINE</span>
                </div>

                <div className="ai-capability-item">
                  <span className="ai-capability-lead">
                    <Brain size={14} style={{ color: "var(--ai-cyan)" }} />
                    <span>General Intelligence (Study/Code)</span>
                  </span>
                  <span className="ai-capability-online-tag">ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
