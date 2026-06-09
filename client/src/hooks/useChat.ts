/**
 * useChat Hook
 * 
 * Orchestrates chat operations by combining API calls, socket events,
 * and the chat store. Components call these functions — they never
 * call api.get() or useChatStore directly.
 * 
 * Provides: fetchConversations, fetchMessages, sendMessage, createDM
 */
import { useCallback } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useChatStore } from '../stores/chatStore';
import { SOCKET_EVENTS } from '../lib/constants';
import { type ApiResponse, type Conversation, type Message } from '../types';

export function useChat() {

    const {
        conversations,
        activeConversationId,
        messages,
        unreadCounts,
        setConversations,
        addConversation,
        setActiveConversation,
        setMessages,
        addMessage,
    } = useChatStore();

    const fetchConversations = useCallback(async (): Promise<void> => {
        const { data } = await api.get<ApiResponse<Conversation[]>>('/conversations');
        setConversations(data.data || []);
    }, [setConversations]);

    const fetchMessages = useCallback(async (conversationId: string): Promise<void> => {
        const { data } = await api.get<ApiResponse<Message[]>>(
            `/conversations/${conversationId}/messages`
        );
        setMessages(conversationId, data.data || []);
    }, [setMessages]);

    const sendMessage = useCallback(async (
        conversationId: string,
        content: string,
        messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'
    ): Promise<void> => {
        const { data } = await api.post<ApiResponse<Message>>(
            `/conversations/${conversationId}/messages`,
            { content, messageType }
        );

        if (data.data) {
            addMessage(conversationId, data.data);
        }

        getSocket()?.emit(SOCKET_EVENTS.MESSAGE_SEND, {
            conversationId,
            content,
            messageType,
        });
    }, [addMessage]);

    const createDM = useCallback(async (userId: string): Promise<Conversation | null> => {
        const { data } = await api.post<ApiResponse<Conversation>>('/conversations/dm', { userId });
        if (data.data) {
            addConversation(data.data);
            return data.data;
        }
        return null;
    }, [addConversation]);

    const selectConversation = useCallback((id: string) => {
        setActiveConversation(id);
        if (!messages[id]) {
            fetchMessages(id);
        }
    }, [setActiveConversation, messages, fetchMessages]);

    const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];
    const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

    return {
    conversations,
    activeConversation,
    activeMessages,
    unreadCounts,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createDM,
    selectConversation,
  };
}