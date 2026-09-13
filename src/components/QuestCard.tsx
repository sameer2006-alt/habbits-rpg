import { motion } from "framer-motion";
import type { Quest } from "../types/game";

interface QuestCardProps {
  quest: Quest;
  onComplete: (id: string) => void;
}

function QuestCard({ quest, onComplete }: QuestCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: quest.completed ? 0.98 : 1,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "12px",
        marginBottom: "8px",
        background: quest.completed ? "#1a1a1a" : "#111",
      }}
    >
      <h3>{quest.title}</h3>
      <p>{quest.description}</p>
      <p>Category: {quest.category}</p>
      <p>Reward: +{quest.xpReward} XP</p>

      <motion.button
        whileTap={{ scale: 0.95 }}
        disabled={quest.completed}
        onClick={() => onComplete(quest.id)}
      >
        {quest.completed ? "Completed" : "Complete Quest"}
      </motion.button>
    </motion.div>
  );
}

export default QuestCard;