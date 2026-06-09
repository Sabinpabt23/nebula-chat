/**
 * ChatPage
 *
 * Main chat interface page. Composes the sidebar (ConversationList)
 * and the message area (MessageArea) inside the AppShell layout.
 * Uses useChat hook for all data operations.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { ConversationList } from "../components/chat/ConversationList";
import { MessageArea } from "../components/chat/MessageArea";
import { useChat } from "../hooks/useChat";
import { useAuthStore } from "../stores/authStore";
import { ROUTES } from "../lib/constants";

export function ChatPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

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
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }
    fetchConversations();
  }, [isAuthenticated, navigate, fetchConversations]);

  return (
    <AppShell
      sidebar={
        <ConversationList
          conversations={conversations}
          activeId={activeConversation?.id || null}
          onSelect={selectConversation}
          unreadCounts={unreadCounts}
          onStartChat={(userId) => {
            createDM(userId).then((conv) => {
              if (conv) selectConversation(conv.id);
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
