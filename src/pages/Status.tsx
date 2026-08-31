import XPBar from "../components/XPBar";
import type { Player, Achievement } from "../types/game";

interface StatusProps {
  player: Player;
  achievements: Achievement[];
  level: number;
  xpIntoLevel: number;
}

function Status({
  player,
  achievements,
  level,
  xpIntoLevel,
}: StatusProps) {
  return (
    <main>
      <h1>Player Status</h1>

      <p>
        LEVEL {level} — RANK {player.progress.rank}
      </p>

      <XPBar level={level} currentXP={xpIntoLevel} />

      <p>STRENGTH: {player.stats.strength}</p>
      <p>INTELLIGENCE: {player.stats.intelligence}</p>
      <p>VITALITY: {player.stats.vitality}</p>
      <p>FOCUS: {player.stats.focus}</p>
      <p>DISCIPLINE: {player.stats.discipline}</p>
      <p>CONSISTENCY: {player.stats.consistency}</p>

      <p>STREAK: {player.progress.currentStreak} DAYS</p>
      <p>COINS: {player.progress.coins} 🪙</p>

      <h2>Achievements</h2>

      {achievements.map((achievement) => (
        <p key={achievement.id}>
          {achievement.unlocked ? "✅" : "🔒"}{" "}
          {achievement.title} — {achievement.description}
        </p>
      ))}
    </main>
  );
}

export default Status;