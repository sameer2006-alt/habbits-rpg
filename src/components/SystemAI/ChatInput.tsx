import React, { useState, useRef, useEffect } from "react";
import { CornerDownLeft } from "lucide-react";

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

  const handleClear = () => {
    setText("");
    inputRef.current?.focus();
  };

  const charCount = text.length;
  const isOverLimit = charCount > maxLength;

  return (
    <div className="ai-input-dock">
      <form onSubmit={handleSubmit} className="ai-input-form">
        <div className="ai-input-cavity" style={isOverLimit ? { borderColor: "#ef4444" } : undefined}>
          <div className="ai-prompt-prefix">&gt;_</div>
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
            className="ai-input-field"
          />

          <div className="ai-input-actions">
            {text.length > 0 && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="ai-input-clear-btn"
                title="Clear input"
              >
                ESC / CLEAR
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !text.trim() || isOverLimit}
              className="ai-transmit-btn"
              title="Transmit Query (Enter)"
            >
              <span>{isLoading ? "TRANSMITTING..." : "TRANSMIT"}</span>
              <CornerDownLeft size={13} />
            </button>
          </div>
        </div>

        <div className="ai-input-footer">
          <div style={{ display: "flex", gap: "12px" }}>
            <span>ENTER TO TRANSMIT</span>
            <span>•</span>
            <span>RESTRICTED TO LEVEL/XP/SYSTEM INTEL</span>
          </div>
          <div style={{ color: isOverLimit ? "#ef4444" : "var(--ai-text-dim)" }}>
            {charCount}/{maxLength}
          </div>
        </div>
      </form>
    </div>
  );
};
