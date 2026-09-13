
import type { FC } from "react";
import { Sparkles, HelpCircle } from "lucide-react";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

const SUGGESTIONS = [
  "What is Habbits RPG?",
  "How do I play?",
  "How does XP work?",
  "How do I rank up?",
  "Why didn't I rank up?",
  "How do bosses work?",
  "How do streaks work?",
  "How do achievements work?",
  "How does the shop work?",
  "How do custom quests work?",
  "What are my current stats?",
  "How close am I to my next rank?",
];

export const SuggestedQuestions: FC<SuggestedQuestionsProps> = ({
  onSelectQuestion,
}) => {
  return (
    <div
      style={{
        padding: "16px",
        margin: "12px 0",
        background: "rgba(21, 10, 13, 0.6)",
        border: "1px dashed #3a1319",
        borderRadius: "4px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "12px",
          color: "#c9a876",
          fontSize: "0.78rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <Sparkles size={14} />
        <span>Tactical Inquiries / Suggested Directives</span>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {SUGGESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onSelectQuestion(q)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 12px",
              fontSize: "0.78rem",
              background: "rgba(10, 0, 6, 0.75)",
              border: "1px solid #3a1319",
              borderRadius: "3px",
              color: "#f2e9e9",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 160ms ease",
            }}
          >
            <HelpCircle size={12} color="#8a6b70" />
            <span>{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
