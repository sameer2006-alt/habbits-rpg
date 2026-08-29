import XPBar from "../components/XPBar";
import { calculateLevel, getXPIntoCurrentLevel } from "../utils/levelSystem";
import type { Quest, Player, Achievement } from "../types/game";
interface StatusProps {
  quests: Quest[];
  player: Player;
  achievements: Achievement[];
}
function Status({ quests, player, achievements }: StatusProps) {
  const totalXP = quests
    .filter((quest) => quest.completed)
    .reduce((total, quest) => total + quest.xpReward, 0);
  const level = calculateLevel(totalXP);
  const xpIntoLevel = getXPIntoCurrentLevel(totalXP);
  return (
    <main>
      {" "}
      <h1>Player Status</h1>{" "}
      <p>
        {" "}
        LEVEL {level} — RANK {player.rank}{" "}
      </p>{" "}
      <XPBar level={level} currentXP={xpIntoLevel} />{" "}
      <p>STRENGTH: {player.strength}</p>{" "}
      <p>INTELLIGENCE: {player.intelligence}</p>{" "}
      <p>VITALITY: {player.vitality}</p> <p>FOCUS: {player.focus}</p>{" "}
      <p>DISCIPLINE: {player.discipline}</p> <p>STREAK: {player.streak} DAYS</p>{" "}
      <p>COINS: {player.coins} 🪙</p> <h2>Achievements</h2>{" "}
      {achievements.map((achievement) => (
        <p key={achievement.id}>
          {" "}
          {achievement.unlocked ? "✅" : "🔒"} {achievement.title} —{" "}
          {achievement.description}{" "}
        </p>
      ))}{" "}
    </main>
  );
}
export default Status;
