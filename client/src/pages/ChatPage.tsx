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
  // Pull user.id at the top level — hooks must not be called inside JSX.
  const currentUserId = useAuthStore((state) => state.user?.id ?? "");

  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { logout } = useAuth();
  const { joinConversation, leaveConversation } = useSocket();
  const currentUser = useAuthStore((state) => state.user);

  // Group Info Modal Toggle State
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const {
    conversations,
    activeConversation,
    activeMessages,
    unreadCounts,
    fetchConversations,
    selectConversation,
    sendMessage,
    createDM,
    createGroup,
  } = useChat();

  // ── Fetch conversations once authenticated ────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, fetchConversations]);

  // ── Restore active conversation from URL ──────────────────────────────
  // This runs after conversations load (including on page refresh).
  // It selects the conversation AND joins the socket room so real-time
  // messages start arriving immediately — no manual click required.
  useEffect(() => {
    if (!conversationId || conversations.length === 0) return;

    const exists = conversations.some((c) => c.id === conversationId);
    if (!exists) return;

    selectConversation(conversationId);
    joinConversation(conversationId);
  }, [conversationId, conversations]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Conversation selection (manual click) ─────────────────────────────
  function handleSelectConversation(id: string) {
    if (activeConversation?.id) {
      leaveConversation(activeConversation.id);
    }
    selectConversation(id);
    navigate(`${ROUTES.CHAT}/${id}`, { replace: true });
    joinConversation(id);
  }

  // Handle Header Click for Groups
  function handleHeaderClick() {
    if (activeConversation?.type === "GROUP") {
      setShowGroupInfo(true);
    }
  }

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
      {/* Header bar */}
      <div
        className="px-6 py-3 border-b flex items-center justify-between"
        style={{ borderColor: "var(--color-border, #2a2a2e)" }}
      >
        <span
          className={`text-sm font-medium ${
            activeConversation?.type === "GROUP"
              ? "cursor-pointer hover:opacity-80"
              : ""
          }`}
          style={{ color: "var(--color-text-primary)" }}
          onClick={handleHeaderClick}
        >
          {activeConversation
            ? activeConversation.type === "DIRECT"
              ? activeConversation.participants?.find(
                  (p) => p.userId !== currentUserId,
                )?.user?.displayName
              : activeConversation.name
            : "Nebula Chat"}
        </span>

        {/* Updated Actions Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--color-accent)", color: "white" }}
            title="My Profile"
          >
            {currentUser?.displayName?.charAt(0).toUpperCase() || "?"}
          </button>
          <button
            onClick={() => {
              logout();
              navigate(ROUTES.LOGIN, { replace: true });
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150"
            style={{
              backgroundColor: "var(--color-bg-elevated, #1e1e21)",
              color: "var(--color-text-secondary)",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <MessageArea
        conversation={activeConversation}
        messages={activeMessages}
        onSendMessage={(content) => {
          if (activeConversation) {
            sendMessage(activeConversation.id, content);
          }
        }}
      />

      {/* Group Details Modal overlay */}
      {showGroupInfo && activeConversation && (
        <GroupInfoModal
          conversation={activeConversation}
          onClose={() => setShowGroupInfo(false)}
          onMemberRemoved={() => fetchConversations()}
        />
      )}
    </AppShell>
  );
}
