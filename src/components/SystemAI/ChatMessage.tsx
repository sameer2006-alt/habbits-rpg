import React from "react";
import { Bot, User as UserIcon } from "lucide-react";
import type { SystemAIMessage } from "../../lib/systemAI";

interface ChatMessageProps {
  message: SystemAIMessage;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.role === "assistant";

  // Simple, robust text formatter for markdown-like formatting (headers, bold, lists, code)
  const formatContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} style={{ margin: "10px 0 4px", color: isAI ? "#ffd700" : "#f2e9e9", fontSize: "0.95rem" }}>
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={idx} style={{ margin: "12px 0 6px", color: isAI ? "#e63946" : "#f2e9e9", fontSize: "1.05rem" }}>
            {line.replace("## ", "")}
          </h3>
        );
      }

      // Bullet items
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const bulletText = line.trim().substring(2);
        return (
          <div key={idx} style={{ display: "flex", gap: "6px", margin: "3px 0", paddingLeft: "4px" }}>
            <span style={{ color: "#e63946" }}>•</span>
            <span>{renderFormattedSpan(bulletText)}</span>
          </div>
        );
      }

      // Numbered items (e.g. "1. ")
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} style={{ display: "flex", gap: "6px", margin: "3px 0", paddingLeft: "4px" }}>
            <span style={{ color: "#ffd700", fontWeight: 600 }}>{numMatch[1]}.</span>
            <span>{renderFormattedSpan(numMatch[2])}</span>
          </div>
        );
      }

      // Empty line
      if (!line.trim()) {
        return <div key={idx} style={{ height: "6px" }} />;
      }

      // Normal paragraph
      return (
        <p key={idx} style={{ margin: "4px 0", lineHeight: 1.5 }}>
          {renderFormattedSpan(line)}
        </p>
      );
    });
  };

  // Helper for inline bold and code
  const renderFormattedSpan = (str: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={match.index} style={{ color: "#f2e9e9", fontWeight: 600 }}>
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code
            key={match.index}
            style={{
              background: "rgba(0,0,0,0.45)",
              border: "1px solid #3a1319",
              padding: "1px 5px",
              borderRadius: "3px",
              fontSize: "0.85em",
              color: "#ffd700",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIndex = match.index + token.length;
    }
    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }
    return parts.length > 0 ? parts : [str];
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isAI ? "flex-start" : "flex-end",
        marginBottom: "16px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "4px",
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          color: isAI ? "#e63946" : "#8a6b70",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {isAI ? (
          <>
            <Bot size={13} color="#e63946" />
            <span>SYSTEM AI // CORE ADVISOR</span>
          </>
        ) : (
          <>
            <span>PLAYER</span>
            <UserIcon size={13} color="#8a6b70" />
          </>
        )}
        <span style={{ opacity: 0.6, fontSize: "0.68rem" }}>{message.timestamp}</span>
      </div>

      <div
        style={{
          maxWidth: "85%",
          padding: "12px 16px",
          borderRadius: "4px",
          background: isAI
            ? "linear-gradient(180deg, rgba(29, 13, 18, 0.95), rgba(15, 5, 8, 0.98))"
            : "linear-gradient(180deg, rgba(230, 57, 70, 0.15), rgba(139, 30, 63, 0.22))",
          border: isAI ? "1px solid #3a1319" : "1px solid rgba(230, 57, 70, 0.4)",
          boxShadow: isAI
            ? "0 4px 20px rgba(0, 0, 0, 0.4)"
            : "0 4px 20px rgba(230, 57, 70, 0.15)",
          color: "#f2e9e9",
          fontSize: "0.92rem",
          wordBreak: "break-word",
        }}
      >
        {formatContent(message.content)}
      </div>
    </div>
  );
};
