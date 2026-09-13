import type { PlayerRecordsMap } from "../lib/personalRecordsData";
import { getDerivedRecordsAndStats } from "../lib/personalRecordsData";
import type { Player } from "../types/game";
import { Trophy, Flame, Zap, CheckCircle, Skull, Award, Calendar, Swords, Shield, Activity } from "lucide-react";

interface PersonalRecordsSectionProps {
  records: PlayerRecordsMap;
  player?: Player;
  powerScore?: number;
}

export default function PersonalRecordsSection({ records, player, powerScore }: PersonalRecordsSectionProps) {
  const { personalRecords, lifetimeStats } = getDerivedRecordsAndStats(records, player, powerScore);

  const RECORD_ITEMS = [
    { key: "longest_streak", label: "Longest Streak", value: personalRecords.longest_streak, unit: "Days", icon: Flame, color: "#ffaa00" },
    { key: "highest_power_score", label: "Highest Power", value: personalRecords.highest_power_score, unit: "PWR", icon: Zap, color: "#ffd700" },
    { key: "most_quests_one_day", label: "Most Quests / Day", value: personalRecords.most_quests_one_day, unit: "Quests", icon: Swords, color: "#48cae4" },
    { key: "most_xp_one_day", label: "Most XP / Day", value: personalRecords.most_xp_one_day, unit: "XP", icon: Award, color: "#c084fc" },
    { key: "most_coins_one_day", label: "Most Coins / Day", value: personalRecords.most_coins_one_day, unit: "Coins", icon: Trophy, color: "#e0a96d" },
    { key: "highest_season_level", label: "Peak Season Level", value: personalRecords.highest_season_level, unit: "Level", icon: Trophy, color: "#ffd700" },
  ];

  const LIFETIME_ITEMS = [
    { key: "total_quests_completed", label: "Quests Completed", value: lifetimeStats.total_quests_completed, unit: "Completed", icon: CheckCircle, color: "#38bdf8" },
    { key: "total_xp_earned", label: "Total XP Earned", value: lifetimeStats.total_xp_earned, unit: "XP", icon: Award, color: "#c084fc" },
    { key: "total_bosses_defeated", label: "Bosses Defeated", value: lifetimeStats.total_bosses_defeated, unit: "Conquered", icon: Skull, color: "#e63946" },
    { key: "total_perfect_days", label: "Perfect Days", value: lifetimeStats.total_perfect_days, unit: "Attained", icon: CheckCircle, color: "#2ecc71" },
    { key: "weekly_challenges_completed", label: "Weekly Challenges", value: lifetimeStats.weekly_challenges_completed, unit: "Cleared", icon: Calendar, color: "#00f0ff" },
    { key: "monthly_challenges_completed", label: "Monthly Campaigns", value: lifetimeStats.monthly_challenges_completed, unit: "Cleared", icon: Shield, color: "#a855f7" },
    { key: "total_seasons_completed", label: "Seasons Completed", value: lifetimeStats.total_seasons_completed, unit: "Finished", icon: Trophy, color: "#ffd700" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: "18px" }}>
      {/* ── SECTION D: PERSONAL RECORDS (HIGH-WATER MARKS) ── */}
      <div className="panel-box">
        <div className="panel-topbar" style={{ marginBottom: 12 }}>
          <div>
            <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Trophy size={16} style={{ color: "#ffd700" }} />
              <span>PERSONAL RECORDS</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#8a6b70", marginTop: 2 }}>
              Strictly non-decreasing high-water marks representing your all-time peak accomplishments.
            </div>
          </div>
          <span className="badge badge-accent" style={{ fontSize: "0.68rem" }}>
            HIGH-WATER MARKS
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 10,
          }}
        >
          {RECORD_ITEMS.map(({ key, label, value, unit, icon: Icon, color }) => {
            const rec = records[key as keyof PlayerRecordsMap];
            return (
              <div
                key={key}
                className="stat-pill"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: "10px 12px",
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255, 215, 0, 0.2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon size={14} style={{ color }} />
                  <span className="card-title" style={{ fontSize: "0.72rem", color: "#8a6b70" }}>
                    {label}
                  </span>
                </div>
                <div style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#f2e9e9" }}>
                  {value.toLocaleString()} <span style={{ fontSize: "0.7rem", color: "#8a6b70", fontWeight: "normal" }}>{unit}</span>
                </div>
                {rec?.recordedAt && (
                  <div style={{ fontSize: "0.65rem", color: "#8a6b70" }}>
                    Set: {rec.recordedAt.split("T")[0]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION E: LIFETIME STATISTICS (CUMULATIVE COUNTERS) ── */}
      <div className="panel-box">
        <div className="panel-topbar" style={{ marginBottom: 12 }}>
          <div>
            <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Activity size={16} style={{ color: "#38bdf8" }} />
              <span>LIFETIME STATISTICS</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#8a6b70", marginTop: 2 }}>
              Cumulative career counters tracking total lifetime activity and completions across all sectors.
            </div>
          </div>
          <span className="badge" style={{ fontSize: "0.68rem", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
            CUMULATIVE COUNTERS
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 10,
          }}
        >
          {LIFETIME_ITEMS.map(({ key, label, value, unit, icon: Icon, color }) => {
            return (
              <div
                key={key}
                className="stat-pill"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: "10px 12px",
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon size={14} style={{ color }} />
                  <span className="card-title" style={{ fontSize: "0.72rem", color: "#8a6b70" }}>
                    {label}
                  </span>
                </div>
                <div style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#f2e9e9" }}>
                  {value.toLocaleString()} <span style={{ fontSize: "0.7rem", color: "#8a6b70", fontWeight: "normal" }}>{unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
