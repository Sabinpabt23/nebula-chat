/**
 * ChatPage
 *
 * Main chat interface page. Composes the sidebar (ConversationList)
 * and the message area (MessageArea) inside the AppShell layout.
 * Uses useChat hook for all data operations.
 * On mount, restores session from refresh cookie before fetching data.
 * Active conversation is stored in the URL for persistence across refreshes.
 */
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { ConversationList } from "../components/chat/ConversationList";
import { MessageArea } from "../components/chat/MessageArea";
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
  const { refreshAuth } = useAuth();
  const { joinConversation, leaveConversation } = useSocket();

  const {
    conversations,
    activeConversation,
    activeMessages,
    unreadCounts,
    fetchConversations,
    selectConversation,
    sendMessage,
    createDM,
  } = useChat();

  // ── Session restore on page load ──────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      refreshAuth().then((success) => {
        if (!success) {
          navigate(ROUTES.LOGIN, { replace: true });
        }
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
  // Note: selectConversation and joinConversation are intentionally omitted
  // from deps — they are stable references and including them would cause
  // this effect to re-run and re-emit join:conversation on every render.

  // ── Conversation selection (manual click) ─────────────────────────────
  function handleSelectConversation(id: string) {
    if (activeConversation?.id) {
      leaveConversation(activeConversation.id);
    }
    selectConversation(id);
    navigate(`${ROUTES.CHAT}/${id}`, { replace: true });
    joinConversation(id);
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
        />
      }
    >
      <MessageArea
        conversation={activeConversation}
        messages={activeMessages}
        onSendMessage={(content) => {
          if (activeConversation) {
            sendMessage(activeConversation.id, content);
          }
        }}
      />
    </AppShell>
  );
}
