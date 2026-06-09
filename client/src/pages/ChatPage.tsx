/**
 * ChatPage
 *
 * Main chat interface page. Composes the sidebar (ConversationList)
 * and the message area (MessageArea) inside the AppShell layout.
 * Uses useChat hook for all data operations.
 * On mount, restores session from refresh cookie before fetching data.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { ConversationList } from "../components/chat/ConversationList";
import { MessageArea } from "../components/chat/MessageArea";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../hooks/useAuth";
import { useAuthStore } from "../stores/authStore";
import { ROUTES } from "../lib/constants";

export function ChatPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

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
