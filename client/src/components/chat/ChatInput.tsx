/**
 * ChatInput
 *
 * Message input bar with send button. Handles Enter to send
 * and Shift+Enter for new lines. Empty messages are prevented.
 */
import { useState, type KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  function handleSend() {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage("");
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      className="p-4 border-t flex items-end gap-3"
      style={{ borderColor: "var(--color-border, #2a2a2e)" }}
    >
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-[var(--color-text-tertiary)] disabled:opacity-50"
        style={{
          backgroundColor: "var(--color-bg-elevated, #1e1e21)",
          color: "var(--color-text-primary)",
          maxHeight: "120px",
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "white",
        }}
      >
        Send
      </button>
    </div>
  );
}
