/**
 * MessageArea
 *
 * Displays messages for the active conversation with auto-scroll
 * to bottom on new messages. Shows the chat input at the bottom.
 */
import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { type Message, type Conversation } from "../../types";
import { useAuthStore } from "../../stores/authStore";

interface MessageAreaProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export function MessageArea({
  conversation,
  messages,
  onSendMessage,
}: MessageAreaProps) {
  const user = useAuthStore((state) => state.user);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Select a conversation to start chatting.
        </p>
      </div>
    );
  }

  const name =
    conversation.type === "DIRECT"
      ? conversation.participants?.find((p) => p.userId !== user?.id)?.user
          ?.displayName || "Unknown"
      : conversation.name || "Group";

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div
        className="px-6 py-4 border-b flex items-center gap-3"
        style={{ borderColor: "var(--color-border, #2a2a2e)" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {name}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <p
            className="text-sm text-center mt-8"
            style={{ color: "var(--color-text-secondary)" }}
          >
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.senderId === user?.id;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showSender =
              conversation.type === "GROUP" &&
              !isOwn &&
              msg.senderId !== prevMsg?.senderId;

            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={isOwn}
                showSender={showSender}
                sender={msg.sender}
              />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={onSendMessage} />
    </div>
  );
}
