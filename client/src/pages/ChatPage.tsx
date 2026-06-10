/**
 * ChatPage
 *
 * Main chat interface page. Composes the sidebar (ConversationList)
 * and the message area (MessageArea) inside the AppShell layout.
 * Uses useChat hook for all data operations.
 * On mount, restores session from refresh cookie before fetching data.
 * Active conversation is stored in the URL for persistence across refreshes.
 */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { ConversationList } from "../components/chat/ConversationList";
import { MessageArea } from "../components/chat/MessageArea";
import { GroupInfoModal } from "../components/chat/GroupInfoModal";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../hooks/useAuth";
import { useAuthStore } from "../stores/authStore";
import { ROUTES } from "../lib/constants";
import { useSocket } from "../hooks/useSocket";

export function ChatPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUserId = useAuthStore((state) => state.user?.id ?? "");

  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { logout } = useAuth();
  const { joinConversation, leaveConversation } = useSocket();
  const currentUser = useAuthStore((state) => state.user);

  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const {
    conversations,
    activeConversation,
    activeMessages,
    unreadCounts,
    fetchConversations,
    fetchUnreadCounts,
    selectConversation,
    sendMessage,
    createDM,
    createGroup,
  } = useChat();

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
      fetchUnreadCounts();
    }
  }, [isAuthenticated, fetchConversations, fetchUnreadCounts]);

  useEffect(() => {
    if (!conversationId || conversations.length === 0) return;
    const exists = conversations.some((c) => c.id === conversationId);
    if (!exists) return;
    selectConversation(conversationId);
    joinConversation(conversationId);
  }, [conversationId, conversations]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelectConversation(id: string) {
    if (activeConversation?.id) {
      leaveConversation(activeConversation.id);
    }
    selectConversation(id);
    navigate(`${ROUTES.CHAT}/${id}`, { replace: true });
    joinConversation(id);
  }

  function handleHeaderClick() {
    if (activeConversation?.type === "GROUP") {
      setShowGroupInfo(true);
    }
  }

  // Derive display name for active conversation header
  const headerName = activeConversation
    ? activeConversation.type === "DIRECT"
      ? (activeConversation.participants?.find(
          (p) => p.userId !== currentUserId,
        )?.user?.displayName ?? "Direct Message")
      : (activeConversation.name ?? "Group")
    : null;

  const isGroupConv = activeConversation?.type === "GROUP";
  const otherUser = activeConversation?.participants?.find(
    (p) => p.userId !== currentUserId,
  )?.user;
  const isOtherOnline = otherUser?.isOnline;

  return (
    <AppShell
      sidebar={
        <ConversationList
          conversations={conversations}
          activeId={activeConversation?.id ?? null}
          onSelect={handleSelectConversation}
          unreadCounts={unreadCounts}
          currentUserId={currentUserId}
          onStartChat={(userId) => {
            createDM(userId).then((conv) => {
              if (conv) handleSelectConversation(conv.id);
            });
          }}
          onCreateGroup={(name, memberIds) => {
            createGroup(name, memberIds).then((conv) => {
              if (conv) handleSelectConversation(conv.id);
            });
          }}
        />
      }
    >
      {/* ── Conversation header ──────────────────────────────── */}
      <div
        className="hidden md:flex px-5 py-3 items-center justify-between flex-shrink-0"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        {/* Left — conversation identity */}
        <div className="flex items-center gap-3 min-w-0">
          {headerName ? (
            <>
              <div className="relative flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "white",
                  }}
                >
                  {headerName.charAt(0).toUpperCase()}
                </div>
                {!isGroupConv && isOtherOnline && (
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                    style={{
                      backgroundColor: "var(--color-online)",
                      borderColor: "var(--color-bg-surface)",
                    }}
                  />
                )}
              </div>
              <div className="min-w-0">
                <button
                  onClick={handleHeaderClick}
                  className={`text-sm font-semibold truncate block transition-opacity ${
                    isGroupConv
                      ? "hover:opacity-70 cursor-pointer"
                      : "cursor-default"
                  }`}
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {headerName}
                  {isGroupConv && (
                    <span
                      className="ml-1.5 text-[10px] font-normal"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      · click for info
                    </span>
                  )}
                </button>
                {!isGroupConv && (
                  <p
                    className="text-[11px] leading-tight"
                    style={{
                      color: isOtherOnline
                        ? "var(--color-online)"
                        : "var(--color-text-tertiary)",
                    }}
                  >
                    {isOtherOnline ? "Online" : "Offline"}
                  </p>
                )}
              </div>
            </>
          ) : (
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Nebula Chat
            </span>
          )}
        </div>

        {/* Right — user profile + logout */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-colors duration-150 hover:bg-[var(--color-bg-elevated)] group"
            title="My Profile"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ backgroundColor: "var(--color-accent)", color: "white" }}
            >
              {currentUser?.displayName?.charAt(0).toUpperCase() || "?"}
            </div>
            <span
              className="text-xs font-medium max-w-[100px] truncate"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {currentUser?.displayName}
            </span>
          </button>

          <button
            onClick={() => {
              logout();
              navigate(ROUTES.LOGIN, { replace: true });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 hover:opacity-80"
            style={{
              backgroundColor: "var(--color-bg-elevated)",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M4.5 2H2.5A1.5 1.5 0 0 0 1 3.5v5A1.5 1.5 0 0 0 2.5 10H4.5M8 8.5l2.5-2.5L8 3.5M10.5 6H4.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile: conversation name header (below hamburger row in AppShell) */}
      {headerName && (
        <div
          className="md:hidden flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: "var(--color-accent)", color: "white" }}
          >
            {headerName.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleHeaderClick}
            className={`text-sm font-semibold truncate ${isGroupConv ? "cursor-pointer" : "cursor-default"}`}
            style={{ color: "var(--color-text-primary)" }}
          >
            {headerName}
          </button>
          {/* Mobile profile avatar */}
          <button
            onClick={() => navigate("/profile")}
            className="ml-auto w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: "var(--color-accent)", color: "white" }}
            title="My Profile"
          >
            {currentUser?.displayName?.charAt(0).toUpperCase() || "?"}
          </button>
        </div>
      )}

      <MessageArea
        conversation={activeConversation}
        messages={activeMessages}
        onSendMessage={(content) => {
          if (activeConversation) {
            sendMessage(activeConversation.id, content);
          }
        }}
      />

      {showGroupInfo && activeConversation && (
        <GroupInfoModal
          conversation={activeConversation}
          onClose={() => setShowGroupInfo(false)}
          onMemberRemoved={() => fetchConversations()}
          onMemberAdded={() => fetchConversations()}
        />
      )}
    </AppShell>
  );
}
