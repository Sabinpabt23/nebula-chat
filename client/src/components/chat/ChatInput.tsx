/**
 * ChatInput
 *
 * Message input bar with send button. Handles Enter to send
 * and Shift+Enter for new lines. Empty messages are prevented.
 */
import { useState, useRef, type KeyboardEvent, type ChangeEvent } from "react";
import { getSocket } from "../../services/socket";
import { SOCKET_EVENTS } from "../../lib/constants";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  conversationId: string;
}

export function ChatInput({
  onSend,
  disabled,
  conversationId,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  function handleSend() {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setMessage(e.target.value);
    autoResize();
    getSocket()?.emit(SOCKET_EVENTS.TYPING_START, { conversationId });
  }

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div
      className="px-4 py-3 flex-shrink-0"
      style={{ borderTop: "1px solid var(--color-border)" }}
    >
      <div
        className="flex items-end gap-2 rounded-2xl px-3 py-2 transition-colors duration-150"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-[var(--color-text-tertiary)] disabled:opacity-50 py-0.5"
          style={{
            color: "var(--color-text-primary)",
            maxHeight: "120px",
            lineHeight: "1.5",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 disabled:opacity-30"
          style={{
            backgroundColor: canSend ? "var(--color-accent)" : "transparent",
            color: canSend ? "white" : "var(--color-text-tertiary)",
          }}
          aria-label="Send message"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M12.5 1.5L6.5 7.5M12.5 1.5L8.5 12.5L6.5 7.5M12.5 1.5L1.5 5.5L6.5 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <p
        className="text-[10px] text-center mt-1.5"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
