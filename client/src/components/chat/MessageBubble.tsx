/**
 * MessageBubble
 *
 * Renders a single chat message. Self messages are aligned right
 * with accent background; other messages are aligned left with
 * elevated background. Shows sender name in group conversations.
 */
import { type Message, type User } from "../../types";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender: boolean;
  sender?: User;
}

export function MessageBubble({
  message,
  isOwn,
  showSender,
  sender,
}: MessageBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex mb-1 ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex flex-col max-w-[72%] sm:max-w-[65%] ${isOwn ? "items-end" : "items-start"}`}
      >
        {showSender && sender && (
          <p
            className="text-[11px] font-medium mb-1 px-1"
            style={{ color: "var(--color-accent)" }}
          >
            {sender.displayName}
          </p>
        )}
        <div
          className="px-3.5 py-2 text-sm leading-relaxed break-words"
          style={{
            backgroundColor: isOwn
              ? "var(--color-accent)"
              : "var(--color-bg-elevated)",
            color: isOwn ? "white" : "var(--color-text-primary)",
            borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            wordBreak: "break-word",
          }}
        >
          {message.content}
        </div>
        <p
          className="text-[10px] mt-1 px-1"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
