import { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { fetchStats, type StatsSummary } from "../lib/statsData";

export default function History() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsSummary | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchStats(user.id).then(setStats);
  }, [user]);

  if (!stats) return <p>Loading history...</p>;

  const maxCount = Math.max(1, ...stats.completionsLast7Days.map((d) => d.count));

  return (
    <main>
      <h1>Statistics & History</h1>

      <p>Total quests completed: {stats.totalCompletions}</p>
      <p>Total XP earned (all-time): {stats.totalXPEarned}</p>
      <p>Total coins earned (all-time): {stats.totalCoinsEarned}</p>

      <h2>Last 7 Days</h2>
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", height: "100px" }}>
        {stats.completionsLast7Days.map((day) => (
          <div key={day.date} style={{ textAlign: "center" }}>
            <div
              style={{
                height: `${(day.count / maxCount) * 80}px`,
                width: "24px",
                background: "#a78bfa",
                marginBottom: "4px",
              }}
            />
            <div style={{ fontSize: "10px" }}>{day.date.slice(5)}</div>
            <div style={{ fontSize: "10px" }}>{day.count}</div>
          </div>
        ))}
      </div>

      <h2>Recent Activity</h2>
      <ul>
        {stats.recent.map((r) => (
          <li key={r.id}>
            {new Date(r.completedAt).toLocaleString()} — {r.questTitle} (+{r.xpEarned} XP, +{r.coinsEarned} coins)
          </li>
        ))}
      </ul>
    </main>
  );
}