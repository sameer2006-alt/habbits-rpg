import type { FC } from "react";
import { Zap, HelpCircle } from "lucide-react";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

const SUGGESTIONS = [
  "What is Habbits RPG?",
  "How do I play?",
  "What is preventing my next rank?",
  "What should I focus on today?",
  "Explain my current stats.",
  "How do boss raids work?",
  "Explain my Power Score calculation.",
  "How does XP work?",
  "How do I rank up?",
  "Why didn't I rank up?",
  "How do streaks work?",
  "How do custom quests work?",
];

export const SuggestedQuestions: FC<SuggestedQuestionsProps> = ({
  onSelectQuestion,
}) => {
  return (
    <div className="ai-inquiries-bar">
      <div className="ai-inquiries-label">
        <Zap size={13} style={{ color: "var(--ai-tertiary)" }} />
        <span>RECOMMENDED PROTOCOL INQUIRIES</span>
      </div>

      <div className="ai-inquiries-chips-wrap">
        {SUGGESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            className="ai-inquiry-chip"
            onClick={() => onSelectQuestion(q)}
          >
            <HelpCircle size={12} style={{ color: "var(--ai-text-dim)" }} />
            <span>{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
