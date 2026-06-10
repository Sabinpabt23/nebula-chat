/**
 * ConversationList
 *
 * Displays the list of user conversations in the sidebar.
 * Shows conversation name, last message preview, and unread badge.
 * Highlights the currently active conversation.
 */
import { type Conversation } from "../../types";
import { useState } from "react";
import { Link } from "react-router-dom";
import { NewChatModal } from "./NewChatModal";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  unreadCounts: Record<string, number>;
  onStartChat: (userId: string) => void;
  onCreateGroup: (name: string, memberIds: string[]) => void;
  currentUserId: string;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  unreadCounts,
  onStartChat,
  onCreateGroup,
  currentUserId,
}: ConversationListProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-4 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-2">
          {/* Nebula logo mark */}
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <circle cx="4" cy="7" r="2" fill="white" />
              <circle cx="10" cy="4" r="1.5" fill="white" opacity="0.7" />
              <circle cx="10" cy="10" r="1.5" fill="white" opacity="0.7" />
              <line
                x1="6"
                y1="7"
                x2="9"
                y2="4.5"
                stroke="white"
                strokeWidth="1"
                opacity="0.5"
              />
              <line
                x1="6"
                y1="7"
                x2="9"
                y2="9.5"
                stroke="white"
                strokeWidth="1"
                opacity="0.5"
              />
            </svg>
          </div>
          <h2
            className="text-sm font-semibold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Nebula
          </h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 hover:scale-105"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            color: "var(--color-text-secondary)",
          }}
          title="New conversation"
          aria-label="New conversation"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M6.5 1v11M1 6.5h11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Section label */}
      <div className="px-4 pt-4 pb-1.5 flex-shrink-0">
        <span
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Messages
        </span>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
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
                className="text-sm font-medium mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                No conversations yet
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Hit <span style={{ color: "var(--color-accent)" }}>+</span> to
                start a chat or create a group
              </p>
            </div>
          </div>
        ) : (
          conversations.map((conv) => {
            const unread = unreadCounts[conv.id] || 0;
            const isActive = conv.id === activeId;
            const name =
              conv.type === "DIRECT"
                ? conv.participants?.find((p) => p.userId !== currentUserId)
                    ?.user?.displayName || "Unknown"
                : conv.name || "Group";

            const otherUser = conv.participants?.find(
              (p) => p.userId !== currentUserId,
            )?.user;
            const isOnline = otherUser?.isOnline;

            const initials = name.charAt(0).toUpperCase();

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className="w-full text-left px-3 py-2.5 flex items-center gap-3 rounded-xl transition-all duration-100 group"
                style={{
                  backgroundColor: isActive
                    ? "var(--color-bg-elevated)"
                    : "transparent",
                }}
              >
                {/* Avatar */}
                {conv.type === "DIRECT" ? (
                  <Link
                    to={`/profile/${conv.participants?.find((p) => p.userId !== currentUserId)?.userId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="relative flex-shrink-0"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-opacity group-hover:opacity-90"
                      style={{
                        backgroundColor: "var(--color-accent)",
                        color: "white",
                      }}
                    >
                      {initials}
                    </div>
                    {isOnline && (
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                        style={{
                          backgroundColor: "var(--color-online)",
                          borderColor: "var(--color-bg-surface)",
                        }}
                      />
                    )}
                  </Link>
                ) : (
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{
                        backgroundColor: "var(--color-accent)",
                        color: "white",
                      }}
                    >
                      {initials}
                    </div>
                    {/* Group icon badge */}
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                      style={{
                        backgroundColor: "var(--color-bg-elevated)",
                        borderColor: "var(--color-bg-surface)",
                      }}
                    >
                      <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                        <circle
                          cx="3"
                          cy="3"
                          r="1.5"
                          fill="var(--color-text-tertiary)"
                        />
                        <circle
                          cx="6"
                          cy="3"
                          r="1.2"
                          fill="var(--color-text-tertiary)"
                          opacity="0.7"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Name + badge */}
                <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                  <span
                    className="text-sm font-medium truncate"
                    style={{
                      color: isActive
                        ? "var(--color-text-primary)"
                        : "var(--color-text-secondary)",
                    }}
                  >
                    {name}
                  </span>
                  {unread > 0 && (
                    <span
                      className="text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] px-1.5 flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: "var(--color-accent)",
                        color: "white",
                      }}
                    >
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
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
          onCreateGroup={onCreateGroup}
        />
      )}
    </div>
  );
}
