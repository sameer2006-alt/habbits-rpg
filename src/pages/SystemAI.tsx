import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Sparkles, Terminal, AlertTriangle, RefreshCw } from "lucide-react";
import type { Player } from "../types/game";
import { askSystemAI, type SystemAIMessage } from "../lib/systemAI";
import { ChatMessage } from "../components/SystemAI/ChatMessage";
import { ChatInput } from "../components/SystemAI/ChatInput";
import { SuggestedQuestions } from "../components/SystemAI/SuggestedQuestions";
import type { WeeklyChallenge } from "../data/weeklyChallenges";

import type { MonthlyChallenge } from "../data/monthlyChallenges";
import type { PlayerSeason } from "../data/seasons";
import type { PlayerRecordsMap } from "../lib/personalRecordsData";

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
Welcome, Player. I am **System AI**, your tactical game guide and general intelligent assistant.

Ask me anything about **Habbits RPG** (ranks, quests, bosses, XP, power score, equipment, and stats), or use me as a **general AI assistant** for questions on study, coding, science, or productivity.

How may I assist your journey today?`,
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
          powerScore,
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

  const hasUserMessages = messages.some((m) => m.role === "user");

  return (
    <main>
      <div className="system-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "4px",
              background: "linear-gradient(135deg, rgba(230, 57, 70, 0.2), rgba(139, 30, 63, 0.35))",
              border: "1px solid #e63946",
              boxShadow: "0 0 14px rgba(230, 57, 70, 0.4)",
            }}
          >
            <Bot size={20} color="#e63946" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.4rem" }}>System AI Tactical Interface</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "3px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.72rem",
                  color: "#22c55e",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#22c55e",
                    boxShadow: "0 0 8px #22c55e",
                  }}
                />
                NEURAL CORE ONLINE
              </span>
              <span style={{ fontSize: "0.72rem", color: "#8a6b70" }}>
                READ-ONLY ENCRYPTED LIAISON
              </span>
            </div>
          </div>
        </div>

        <div className="inline-meta">
          <span className="value-badge" style={{ borderColor: "#c9a876", color: "#c9a876" }}>
            <Sparkles size={13} style={{ marginRight: 5 }} />
            Authoritative Rules
          </span>
          <span className="value-badge">
            <Terminal size={13} style={{ marginRight: 5 }} />
            Player-Aware
          </span>
        </div>
      </div>

      {/* Main Terminal Frame */}
      <motion.div
        className="panel"
        style={{
          marginTop: "16px",
          padding: "20px",
          minHeight: "520px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, rgba(21, 10, 13, 0.98), rgba(10, 0, 6, 0.96))",
          border: "1px solid #3a1319",
          borderRadius: "4px",
          boxShadow: "0 18px 40px rgba(0, 0, 0, 0.5)",
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Messages Scroll Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            maxHeight: "560px",
            paddingRight: "8px",
          }}
        >
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Suggested Questions (shown when conversation is new) */}
          {!hasUserMessages && (
            <SuggestedQuestions onSelectQuestion={handleSendMessage} />
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                margin: "12px 0",
                maxWidth: "75%",
                borderRadius: "4px",
                background: "rgba(29, 13, 18, 0.8)",
                border: "1px solid #3a1319",
                color: "#c9a876",
                fontSize: "0.85rem",
              }}
            >
              <RefreshCw
                size={16}
                style={{
                  animation: "spin 1.2s linear infinite",
                  color: "#e63946",
                }}
              />
              <span>System AI is analyzing player metrics and authoritative rules...</span>
            </div>
          )}

          {/* Error Banner */}
          {errorState && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                margin: "12px 0",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid #ef4444",
                borderRadius: "4px",
                color: "#f87171",
                fontSize: "0.88rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#ef4444" />
                <span>{errorState}</span>
              </div>
              {lastFailedQuery && (
                <button
                  type="button"
                  onClick={handleRetry}
                  style={{
                    padding: "4px 10px",
                    fontSize: "0.75rem",
                    border: "1px solid #ef4444",
                    background: "rgba(239, 68, 68, 0.2)",
                    color: "#f2e9e9",
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Field */}
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} maxLength={500} />
      </motion.div>
    </main>
  );
}
