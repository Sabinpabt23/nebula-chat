/**
 * Chat Store
 * 
 * Zustand store for chat state — conversations, messages, unread counts.
 * Keeps the active conversation and provides actions to update state
 * from both API responses and socket events.
 */
import { create } from 'zustand';
import { type Conversation, type Message, type SocketUnreadCount } from '../types';

interface ChatState {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Record<string, Message[]>;
    unreadCounts: Record<string, number>;

    setConversations: (conversations: Conversation[]) => void;
    addConversation: (conversation: Conversation) => void;
    setActiveConversation: (id: string | null) => void;
    setMessages: (conversationId: string, messages: Message[]) => void;
    addMessage: (conversationId: string, message: Message) => void;
    updateUnreadCount: (conversationId: string, count: number) => void;
    setUnreadCounts: (counts: SocketUnreadCount[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    conversations: [],
    activeConversationId: null,
    messages: {},
    unreadCounts: {},

    setConversations: (conversations) => set({ conversations }),

    addConversation: (conversation) =>
        set((state) => ({
            conversations: [conversation, ...state.conversations],
        })),

    setActiveConversation: (id) => set({ activeConversationId: id }),

    setMessages: (conversationId, messages) =>
        set((state) => ({
            messages: { ...state.messages, [conversationId]: messages },
        })),

    addMessage: (conversationId, message) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [conversationId]: [
                    ...(state.messages[conversationId] || []),
                    message,
                ],
            },
        })),

    updateUnreadCount: (conversationId, count) =>
        set((state) => ({
            unreadCounts: { ...state.unreadCounts, [conversationId]: count },
        })),

    setUnreadCounts: (counts) =>
        set(() => ({
            unreadCounts: counts.reduce(
                (acc, { conversationId, count }) => ({ ...acc, [conversationId]: count }),
                {} as Record<string, number>
            ),
        })),
}));