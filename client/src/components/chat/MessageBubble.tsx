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
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
        {showSender && sender && (
          <p
            className="text-xs mb-1 px-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {sender.displayName}
          </p>
        )}
        <div
          className="rounded-2xl px-4 py-2 text-sm leading-relaxed break-words"
          style={{
            backgroundColor: isOwn
              ? "var(--color-accent)"
              : "var(--color-bg-elevated, #1e1e21)",
            color: isOwn ? "white" : "var(--color-text-primary)",
            borderBottomRightRadius: isOwn ? "4px" : "16px",
            borderBottomLeftRadius: isOwn ? "16px" : "4px",
          }}
        >
          <p>{message.content}</p>
        </div>
        <p
          className="text-xs mt-0.5 px-1"
          style={{ color: "var(--color-text-tertiary, #55555f)" }}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
