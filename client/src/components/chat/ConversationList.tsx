/**
 * ConversationList
 *
 * Displays the list of user conversations in the sidebar.
 * Shows conversation name, last message preview, and unread badge.
 * Highlights the currently active conversation.
 */
import { type Conversation } from "../../types";
import { useState } from "react";
import { NewChatModal } from "./NewChatModal";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  unreadCounts: Record<string, number>;
  onStartChat: (userId: string) => void;
  currentUserId: string;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  unreadCounts,
  onStartChat,
  currentUserId,
}: ConversationListProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div
        className="p-4 border-b flex items-center justify-between"
        style={{ borderColor: "var(--color-border, #2a2a2e)" }}
      >
        <h2
          className="text-sm font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Chats
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-lg transition-colors duration-100"
          style={{
            backgroundColor: "var(--color-bg-elevated, #1e1e21)",
            color: "var(--color-text-secondary)",
          }}
          title="New Chat"
        >
          +
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p
            className="p-4 text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            No conversations yet.
          </p>
        ) : (
          conversations.map((conv) => {
            const unread = unreadCounts[conv.id] || 0;
            const isActive = conv.id === activeId;
            const name =
              conv.type === "DIRECT"
                ? conv.participants?.find((p) => p.userId !== currentUserId)
                    ?.user?.displayName || "Unknown"
                : conv.name || "Group";

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors duration-100"
                style={{
                  backgroundColor: isActive
                    ? "var(--color-bg-elevated, #1e1e21)"
                    : "transparent",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "white",
                  }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {name}
                    </span>
                    {unread > 0 && (
                      <span
                        className="text-xs rounded-full px-1.5 py-0.5 font-medium flex-shrink-0"
                        style={{
                          backgroundColor: "var(--color-accent)",
                          color: "white",
                        }}
                      >
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
      {showModal && (
        <NewChatModal
          onClose={() => setShowModal(false)}
          onStartChat={onStartChat}
        />
      )}
    </div>
  );
}
