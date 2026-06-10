/**
 * MessageArea
 *
 * Displays messages for the active conversation with auto-scroll
 * to bottom on new messages. Shows the chat input at the bottom.
 */
import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { type Message, type Conversation } from "../../types";
import { useAuthStore } from "../../stores/authStore";
import { getSocket } from "../../services/socket";
import { SOCKET_EVENTS } from "../../lib/constants";
import api from "../../services/api";

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
  const [typingUser, setTypingUser] = useState<string | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && conversation && user) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.senderId !== user.id) {
        api.post(`/messages/${lastMessage.id}/read`).catch(() => {});
      }
    }
  }, [messages, conversation, user]);

  // Listen for typing events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleTypingStart = (data: {
      userId: string;
      conversationId: string;
    }) => {
      if (
        data.conversationId === conversation?.id &&
        data.userId !== user?.id
      ) {
        const typingUserName =
          conversation?.participants?.find((p) => p.userId === data.userId)
            ?.user?.displayName || "Someone";

        setTypingUser(typingUserName);
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setTypingUser(null), 2000);
      }
    };

    socket.on(SOCKET_EVENTS.TYPING_START, handleTypingStart);

    return () => {
      socket.off(SOCKET_EVENTS.TYPING_START, handleTypingStart);
      clearTimeout(timeoutId);
    };
  }, [conversation?.id, user?.id]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center"
          style={{ backgroundColor: "var(--color-bg-elevated)" }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M5 14a9 9 0 1 1 4.5 7.79L5 23l1.21-4A8.97 8.97 0 0 1 5 14Z"
              stroke="var(--color-text-tertiary)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M10 14h8M10 10h5"
              stroke="var(--color-text-tertiary)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="text-center">
          <p
            className="text-base font-semibold mb-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Pick up where you left off
          </p>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Select a conversation from the sidebar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Messages feed */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 pb-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "var(--color-bg-elevated)" }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M4 11a7 7 0 1 1 3.5 6.06L4 18l.94-3.5A6.97 6.97 0 0 1 4 11Z"
                  stroke="var(--color-text-tertiary)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-center">
              <p
                className="text-sm font-medium mb-0.5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Start the conversation
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Say something — messages are end-to-end private
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {messages.map((msg, index) => {
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
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      {typingUser && (
        <div className="px-4 sm:px-6 pb-1 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 items-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "var(--color-text-tertiary)",
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: "0.8s",
                  }}
                />
              ))}
            </div>
            <p
              className="text-xs"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {typingUser} is typing
            </p>
          </div>
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={onSendMessage} conversationId={conversation.id} />
    </div>
  );
}
