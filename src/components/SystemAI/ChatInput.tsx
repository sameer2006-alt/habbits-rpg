import React, { useState, useRef, useEffect } from "react";
import { Send, CornerDownLeft } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  maxLength?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading,
  maxLength = 500,
}) => {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const charCount = text.length;
  const isOverLimit = charCount > maxLength;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        width: "100%",
        marginTop: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(10, 0, 6, 0.85)",
          border: isOverLimit ? "1px solid #ef4444" : "1px solid #3a1319",
          borderRadius: "4px",
          padding: "6px 8px 6px 14px",
          boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5)",
          transition: "border-color 160ms ease",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isLoading
              ? "System AI is synthesizing response..."
              : "Ask System AI anything (e.g. 'Why am I not ranking up?')..."
          }
          disabled={isLoading}
          maxLength={maxLength + 10}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#f2e9e9",
            fontSize: "0.92rem",
            padding: "6px 0",
          }}
        />

        <button
          type="submit"
          disabled={isLoading || !text.trim() || isOverLimit}
          className="primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: isLoading || !text.trim() || isOverLimit ? "not-allowed" : "pointer",
            opacity: isLoading || !text.trim() || isOverLimit ? 0.5 : 1,
          }}
        >
          <span>Send</span>
          <Send size={14} />
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 4px",
          fontSize: "0.72rem",
          color: "#8a6b70",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          Press <CornerDownLeft size={10} /> to send
        </span>
        <span style={{ color: isOverLimit ? "#ef4444" : "#8a6b70", fontWeight: isOverLimit ? 700 : 400 }}>
          {charCount} / {maxLength}
        </span>
      </div>
    </form>
  );
};
