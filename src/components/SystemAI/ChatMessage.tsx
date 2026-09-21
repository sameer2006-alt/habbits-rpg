import React from "react";
import { Bot, User as UserIcon } from "lucide-react";
import type { SystemAIMessage } from "../../lib/systemAI";

interface ChatMessageProps {
  message: SystemAIMessage;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.role === "assistant";

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
          <strong key={match.index}>
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code key={match.index}>
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

  // Robust formatter for markdown-like formatting (headers, bold, lists, code)
  const formatContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx}>
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={idx}>
            {line.replace("## ", "")}
          </h3>
        );
      }

      // Bullet items
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const bulletText = line.trim().substring(2);
        return (
          <div key={idx} style={{ display: "flex", gap: "6px", margin: "3px 0", paddingLeft: "4px" }}>
            <span style={{ color: "var(--ai-primary)" }}>•</span>
            <span>{renderFormattedSpan(bulletText)}</span>
          </div>
        );
      }

      // Numbered items (e.g. "1. ")
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} style={{ display: "flex", gap: "6px", margin: "3px 0", paddingLeft: "4px" }}>
            <span style={{ color: "var(--ai-tertiary)", fontWeight: 600 }}>{numMatch[1]}.</span>
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
        <p key={idx}>
          {renderFormattedSpan(line)}
        </p>
      );
    });
  };

  return (
    <div className={`ai-message-row ${isAI ? "assistant" : "user"}`}>
      <div className="ai-message-tag-bar">
        {isAI ? (
          <span className="ai-message-role-tag assistant" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Bot size={12} />
            <span>[ SYSTEM AI // CORE ADVISOR ]</span>
          </span>
        ) : (
          <span className="ai-message-role-tag user" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span>[ PLAYER QUERY ]</span>
            <UserIcon size={12} />
          </span>
        )}
        <span className="ai-message-time">{message.timestamp}</span>
      </div>

      <div className={`ai-message-bubble ${isAI ? "assistant" : "user"}`}>
        {formatContent(message.content)}
      </div>
    </div>
  );
};
