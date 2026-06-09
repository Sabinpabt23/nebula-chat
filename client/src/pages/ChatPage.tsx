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

  useEffect(() => {
    if (!isAuthenticated) {
      refreshAuth().then((success) => {
        if (!success) {
          navigate(ROUTES.LOGIN, { replace: true });
        }
      });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, fetchConversations]);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const exists = conversations.some((c) => c.id === conversationId);
      if (exists) {
        selectConversation(conversationId);
      }
    }
  }, [conversationId, conversations, selectConversation]);

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
          activeId={activeConversation?.id || null}
          onSelect={handleSelectConversation}
          unreadCounts={unreadCounts}
          currentUserId={useAuthStore((state) => state.user?.id || "")}
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
