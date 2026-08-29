import type { Quest } from "../types/game";

interface QuestCardProps {
  quest: Quest;
  onComplete: (id: string) => void;
}

function QuestCard({ quest, onComplete }: QuestCardProps) {
  return (
    <div>
      <h3>{quest.title}</h3>

      <p>{quest.description}</p>

      <p>Category: {quest.category}</p>

      <p>Reward: +{quest.xpReward} XP</p>

      <button
        disabled={quest.completed}
        onClick={() => onComplete(quest.id)}
      >
        {quest.completed ? "Completed" : "Complete Quest"}
      </button>
    </div>
  );
}

export default QuestCard;