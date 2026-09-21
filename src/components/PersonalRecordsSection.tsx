import type { PlayerRecordsMap } from "../lib/personalRecordsData";
import { getDerivedRecordsAndStats } from "../lib/personalRecordsData";
import type { Player } from "../types/game";
import { Trophy, Flame, Zap, Award, Swords, Activity } from "lucide-react";

interface PersonalRecordsSectionProps {
  records: PlayerRecordsMap;
  player?: Player;
  powerScore?: number;
  mode?: "all" | "records" | "lifetime";
}

export default function PersonalRecordsSection({
  records,
  player,
  powerScore,
  mode = "all",
}: PersonalRecordsSectionProps) {
  const { personalRecords, lifetimeStats } = getDerivedRecordsAndStats(records, player, powerScore);

  const RECORD_ITEMS = [
    { key: "longest_streak", label: "Longest Streak", value: personalRecords.longest_streak, unit: "Days", icon: Flame, color: "#f59e0b", sub: "Consecutive protocol adherence" },
    { key: "highest_power_score", label: "Highest Power Score", value: personalRecords.highest_power_score, unit: "PWR", icon: Zap, color: "#ffd700", sub: "Historical peak rating" },
    { key: "most_quests_one_day", label: "Daily Record Clear", value: personalRecords.most_quests_one_day, unit: "Quests", icon: Swords, color: "#38bdf8", sub: "Directives completed in 24h" },
    { key: "most_xp_one_day", label: "Single-Day XP Surge", value: personalRecords.most_xp_one_day, unit: "XP", icon: Award, color: "#c084fc", sub: "Peak operational yield" },
    { key: "most_coins_one_day", label: "Daily Coin Extraction", value: personalRecords.most_coins_one_day, unit: "Coins", icon: Trophy, color: "#ffdcc3", sub: "Resource accrual peak" },
    { key: "highest_season_level", label: "Peak Season Level", value: personalRecords.highest_season_level, unit: "Level", icon: Trophy, color: "#ffd700", sub: "Seasonal campaign milestone" },
  ];

  const LIFETIME_ITEMS = [
    { key: "total_quests_completed", label: "Total Quests Cleared", value: lifetimeStats.total_quests_completed, colorClass: "" },
    { key: "total_xp_earned", label: "Total XP Accumulated", value: lifetimeStats.total_xp_earned.toLocaleString(), colorClass: "status-matrix-val--crimson" },
    { key: "total_bosses_defeated", label: "Boss Encounters Defeated", value: lifetimeStats.total_bosses_defeated, colorClass: "status-matrix-val--gold" },
    { key: "total_perfect_days", label: "Perfect Days Earned", value: lifetimeStats.total_perfect_days, colorClass: "status-matrix-val--green" },
    { key: "weekly_challenges_completed", label: "Weekly Challenges Cleared", value: lifetimeStats.weekly_challenges_completed, colorClass: "" },
    { key: "monthly_challenges_completed", label: "Monthly Hunts Cleared", value: lifetimeStats.monthly_challenges_completed, colorClass: "" },
    { key: "total_seasons_completed", label: "Seasons Completed", value: lifetimeStats.total_seasons_completed, colorClass: "status-matrix-val--cyan" },
  ];

  const showRecords = mode === "all" || mode === "records";
  const showLifetime = mode === "all" || mode === "lifetime";

  return (
    <>
      {/* ── TIER 4: PERSONAL RECORDS (HIGH-WATER MARKS) ── */}
      {showRecords && (
        <section className="status-records-section">
          <div className="status-section-header">
            <div className="status-section-title-group">
              <span className="status-section-indicator" />
              <h2 className="status-section-title">PERSONAL RECORDS &amp; HIGH MARKS</h2>
              <span className="status-section-subtitle">[ HIGH-WATER MARKS ]</span>
            </div>
            <span className="status-metric-pill status-metric-pill--power" style={{ fontSize: "0.6875rem" }}>
              ALL-TIME PEAKS
            </span>
          </div>

          <div className="status-records-grid">
            {RECORD_ITEMS.map(({ key, label, value, unit, icon: Icon, color, sub }) => {
              const rec = records[key as keyof PlayerRecordsMap];
              return (
                <div key={key} className="status-record-card">
                  <div className="status-record-icon-box">
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div className="status-record-details">
                    <span className="status-record-label">{label}</span>
                    <div className="status-record-val">
                      {value.toLocaleString()}
                      <span className="status-record-unit">{unit}</span>
                    </div>
                    <div className="status-record-sub">
                      {rec?.recordedAt ? `Set: ${rec.recordedAt.split("T")[0]}` : sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── TIER 5: LIFETIME STATISTICS (CAREER MATRIX) ── */}
      {showLifetime && (
        <div className="status-matrix-card">
          <div className="status-section-header" style={{ marginBottom: 0 }}>
            <div className="status-section-title-group">
              <Activity size={18} style={{ color: "var(--cyan-tactical, #38bdf8)" }} />
              <h3 className="status-section-title" style={{ fontSize: "1rem" }}>CAREER MATRIX</h3>
            </div>
            <span className="status-metric-pill" style={{ fontSize: "0.6875rem", padding: "0.2rem 0.6rem" }}>
              LIFETIME
            </span>
          </div>

          <div className="status-matrix-list">
            {LIFETIME_ITEMS.map(({ key, label, value, colorClass }) => (
              <div key={key} className="status-matrix-row">
                <span className="status-matrix-label">{label}</span>
                <span className={`status-matrix-val ${colorClass}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
