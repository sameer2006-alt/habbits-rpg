import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Sparkles, X } from "lucide-react";
import type { Player, Quest, StatName } from "../types/game";
import type { DailyDirective } from "../data/dailyDirectives";
import AddQuestForm from "../components/AddQuestForm";
import DailyDirectiveCard from "../components/DailyDirectiveCard";
import { initialQuests } from "../data/quests";

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

type FilterTab = "all" | "active" | "completed";

function getPriorityBadge(xpReward: number): { label: string; className: string } {
  if (xpReward >= 150) return { label: "HARD", className: "priority-hard" };
  if (xpReward >= 75) return { label: "MEDIUM", className: "priority-medium" };
  return { label: "EASY", className: "priority-easy" };
}

export default function Quests({
  quests,
  onComplete,
  onEndDay,
  onAddQuest,
  onRemoveQuest,
  allQuestsCompleted,
  doubleXpCharges = 0,
  dailyDirective,
}: QuestsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const completedCount = quests.filter((q) => q.completed).length;
  const progressPct = quests.length > 0 ? Math.round((completedCount / quests.length) * 100) : 0;

  const filteredQuests = quests.filter((q) => {
    if (activeFilter === "active") return !q.completed;
    if (activeFilter === "completed") return q.completed;
    return true;
  });

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: quests.length },
    { key: "active", label: "Active", count: quests.length - completedCount },
    { key: "completed", label: "Done", count: completedCount },
  ];

  return (
    <main>
      <div className="system-header">
        <h1>Quest Board</h1>

        <div className="inline-meta">
          <span className="mono-value">
            {quests.length - completedCount} active
          </span>
        </div>
      </div>

      {/* Daily progress bar */}
      {quests.length > 0 && (
        <div className="quest-progress-shell">
          <div className="quest-progress-header">
            <span className="card-title">Daily Progress</span>
            <span className="mono-value">{progressPct}%</span>
          </div>
          <div className="quest-progress-track">
            <motion.div
              className="quest-progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <div className="quest-progress-counts">
            <span>{completedCount} of {quests.length} quests completed</span>
          </div>
        </div>
      )}

      {/* Active Double XP Buff Banner */}
      {doubleXpCharges > 0 && (
        <div
          className="panel-box"
          style={{
            marginBottom: 16,
            borderColor: "#ffd700",
            background: "linear-gradient(90deg, rgba(255, 215, 0, 0.12), rgba(0, 0, 0, 0.4))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={20} color="#ffd700" />
            <div>
              <div style={{ color: "#ffd700", fontWeight: 700, fontSize: "0.92rem" }}>
                DOUBLE XP ELIXIR ACTIVE
              </div>
              <div style={{ color: "#f2e9e9", fontSize: "0.8rem", marginTop: 2 }}>
                Your next {doubleXpCharges} {doubleXpCharges === 1 ? "quest" : "quests"} will grant 2X XP upon completion!
              </div>
            </div>
          </div>
          <span
            className="value-badge"
            style={{
              borderColor: "#ffd700",
              color: "#ffd700",
              fontWeight: 700,
              fontSize: "0.82rem",
            }}
          >
            {doubleXpCharges} {doubleXpCharges === 1 ? "Charge" : "Charges"}
          </span>
        </div>
      )}

      {/* Daily Directive HUD */}
      {dailyDirective && (
        <div style={{ marginBottom: 16 }}>
          <DailyDirectiveCard directive={dailyDirective} />
        </div>
      )}

      {/* Filter tabs */}
      <div className="filter-tabs">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`filter-tab ${activeFilter === tab.key ? "filter-tab-active" : ""}`}
            onClick={() => setActiveFilter(tab.key)}
          >
            {tab.label}
            <span className="filter-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="quest-actions" style={{ marginTop: "12px" }}>
        <button type="button" className="primary" onClick={() => setShowAddForm(true)}>
          <Plus size={14} style={{ marginRight: 6 }} />
          New Quest
        </button>

        <button type="button" onClick={onEndDay}>
          End Day
        </button>
      </div>

      {showAddForm ? (
        <div className="panel-box" style={{ marginTop: "18px" }}>
          <div className="panel-topbar">
            <div className="card-title">Create Quest</div>
            <button type="button" onClick={() => setShowAddForm(false)} aria-label="Close form">
              <X size={14} />
            </button>
          </div>

          <AddQuestForm
            onSubmit={(quest) => {
              onAddQuest(quest);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      ) : null}

      <div className="panel-box" style={{ marginTop: "18px" }}>
        <div className="panel-topbar">
          <div className="card-title">
            {activeFilter === "all" ? "All Quests" : activeFilter === "active" ? "Active Quests" : "Completed Quests"}
          </div>
          <span className="mono-value">
            {filteredQuests.length} {filteredQuests.length === 1 ? "quest" : "quests"}
          </span>
        </div>

        {filteredQuests.length === 0 ? (
          <div className="quest-card">
            <div className="card-title">
              {activeFilter === "completed" ? "No completed quests yet" : "No quests assigned"}
            </div>
            <p style={{ marginTop: 10 }}>
              {activeFilter === "completed"
                ? "Complete a quest to see it here."
                : "Create a new quest or click the button below to restore starter quests."}
            </p>
            {activeFilter !== "completed" && (
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="primary"
                  onClick={() => {
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
                  }}
                >
                  Restore Starter Quests
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredQuests.map((quest) => {
            const priority = getPriorityBadge(quest.xpReward);

            return (
              <motion.article
                key={quest.id}
                className="quest-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <div className="quest-topbar">
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="card-title">{quest.category}</div>
                      <span className={`priority-badge ${priority.className}`}>
                        {priority.label}
                      </span>
                    </div>
                    <h3>{quest.title}</h3>
                  </div>

                  <button type="button" onClick={() => onRemoveQuest(String(quest.id))}>
                    <X size={14} />
                  </button>
                </div>

                <p>{quest.description}</p>

                <div className="status-grid" style={{ marginTop: 12, gap: 8 }}>
                  <div className="stat-pill">
                    <span className="card-title">XP</span>
                    <strong>
                      {doubleXpCharges > 0 && !quest.completed ? (
                        <span style={{ color: "#ffd700" }}>
                          {quest.xpReward * 2} <small style={{ fontSize: "0.72em", color: "#ffd700" }}>(2X)</small>
                        </span>
                      ) : (
                        quest.xpReward
                      )}
                    </strong>
                  </div>
                  <div className="stat-pill">
                    <span className="card-title">Coins</span>
                    <strong>{quest.coinReward}</strong>
                  </div>
                  <div className="stat-pill">
                    <span className="card-title">Stat</span>
                    <strong>{quest.statReward.stat}</strong>
                  </div>
                </div>

                <div className="quest-actions">
                  {!quest.completed ? (
                    <button
                      type="button"
                      className="primary"
                      onClick={() => onComplete(String(quest.id))}
                    >
                      <Sparkles size={14} style={{ marginRight: 6 }} />
                      Complete
                    </button>
                  ) : (
                    <button type="button" disabled>
                      Completed
                    </button>
                  )}
                </div>
              </motion.article>
            );
          })
        )}
      </div>

      {allQuestsCompleted && quests.length > 0 && (
        <div className="panel-box" style={{ marginTop: "18px" }}>
          <div className="card-title">Daily Mission Summary</div>
          <p style={{ marginTop: 10 }}>All quests complete. The system is stable.</p>
        </div>
      )}
    </main>
  );
}
