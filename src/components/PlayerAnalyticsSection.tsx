import { useState, useEffect } from "react";
import type { Player } from "../types/game";
import type { PlayerRecordsMap } from "../lib/personalRecordsData";
import {
  type AnalyticsTimeRange,
  type AnalyticsSummary,
  fetchPlayerAnalytics,
} from "../lib/analyticsData";
import { BarChart3, TrendingUp } from "lucide-react";

interface PlayerAnalyticsSectionProps {
  userId: string;
  player: Player;
  records: PlayerRecordsMap;
}

export default function PlayerAnalyticsSection({
  userId,
  player,
  records,
}: PlayerAnalyticsSectionProps) {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>("30d");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchPlayerAnalytics(userId, timeRange, player, records)
      .then((data) => {
        if (isMounted) {
          setSummary(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Analytics load error:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId, timeRange, player, records]);

  return (
    <div className="panel-box" style={{ marginTop: "18px" }}>
      <div className="panel-topbar" style={{ marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <BarChart3 size={16} style={{ color: "#00f0ff" }} />
          <span>PLAYER INTELLIGENCE & ANALYTICS</span>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: "flex", gap: 6 }}>
          {(["7d", "30d", "90d", "all"] as AnalyticsTimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                background: timeRange === range ? "rgba(0, 240, 255, 0.2)" : "rgba(0,0,0,0.4)",
                border: `1px solid ${timeRange === range ? "#00f0ff" : "rgba(138, 107, 112, 0.3)"}`,
                color: timeRange === range ? "#00f0ff" : "#8a6b70",
                padding: "2px 8px",
                borderRadius: "3px",
                fontSize: "0.7rem",
                fontWeight: "bold",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {range === "all" ? "ALL TIME" : range}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: "#8a6b70", fontSize: "0.85rem", padding: "12px 0" }}>
          Analyzing neural telemetry...
        </div>
      ) : !summary || !summary.hasData ? (
        <div style={{ background: "rgba(0,0,0,0.3)", padding: "14px", borderRadius: "6px", color: "#8a6b70", fontSize: "0.85rem", border: "1px dashed rgba(138, 107, 112, 0.3)" }}>
          NO DATA AVAILABLE for selected period. Complete quests and daily directives to establish an activity baseline.
        </div>
      ) : (
        <div>
          {/* Key Metrics Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 14 }}>
            <div className="stat-pill">
              <span className="card-title" style={{ fontSize: "0.7rem" }}>TOTAL QUESTS</span>
              <strong>{summary.totalQuests}</strong>
            </div>
            <div className="stat-pill">
              <span className="card-title" style={{ fontSize: "0.7rem" }}>AVG QUESTS / DAY</span>
              <strong>{summary.avgQuestsPerDay}</strong>
            </div>
            <div className="stat-pill">
              <span className="card-title" style={{ fontSize: "0.7rem" }}>TOTAL XP</span>
              <strong style={{ color: "#48cae4" }}>+{summary.totalXP.toLocaleString()}</strong>
            </div>
            <div className="stat-pill">
              <span className="card-title" style={{ fontSize: "0.7rem" }}>TOTAL COINS</span>
              <strong style={{ color: "#ffd700" }}>+{summary.totalCoins.toLocaleString()}</strong>
            </div>
            <div className="stat-pill">
              <span className="card-title" style={{ fontSize: "0.7rem" }}>PERFECT DAYS</span>
              <strong style={{ color: "#2ecc71" }}>{summary.perfectDaysCount}</strong>
            </div>
            <div className="stat-pill">
              <span className="card-title" style={{ fontSize: "0.7rem" }}>MOST ACTIVE DAY</span>
              <strong style={{ color: "#ffaa00", fontSize: "0.95rem" }}>{summary.mostActiveDayOfWeek}</strong>
            </div>
          </div>

          {/* Factual Insights Box */}
          <div style={{ background: "rgba(0, 240, 255, 0.05)", border: "1px solid rgba(0, 240, 255, 0.25)", padding: "10px 14px", borderRadius: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#00f0ff", fontSize: "0.75rem", fontWeight: "bold", marginBottom: 6 }}>
              <TrendingUp size={14} />
              <span>TACTICAL INTELLIGENCE SUMMARY:</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "#b8a090", fontSize: "0.8rem", lineHeight: 1.5 }}>
              {summary.insights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
