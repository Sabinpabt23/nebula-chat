/**
 * NewChatModal
 *
 * Modal for searching users and starting a conversation.
 * Fetches users via the API when the user types a search query.
 */
import { useState, useCallback } from "react";
import api from "../../services/api";
import { type ApiResponse, type User } from "../../types";

interface NewChatModalProps {
  onClose: () => void;
  onStartChat: (userId: string) => void;
}

export function NewChatModal({ onClose, onStartChat }: NewChatModalProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setUsers([]);
      return;
    }
    setLoading(true);
    const { data } = await api.get<ApiResponse<User[]>>(
      `/users/search?query=${encodeURIComponent(searchQuery)}`,
    );
    setUsers(data.data || []);
    setLoading(false);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-xl"
        style={{ backgroundColor: "var(--color-bg-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          New Chat
        </h3>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={query}
          autoFocus
          onChange={(e) => {
            setQuery(e.target.value);
            searchUsers(e.target.value);
          }}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors duration-150 mb-4"
          style={{
            backgroundColor: "var(--color-bg-elevated, #1e1e21)",
            color: "var(--color-text-primary)",
          }}
        />
        {loading && (
          <p
            className="text-sm text-center"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Searching...
          </p>
        )}
        {users.length > 0 && (
          <div className="max-h-60 overflow-y-auto">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onStartChat(user.id);
                  onClose();
                }}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors duration-100 hover:bg-[var(--color-bg-elevated)]"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "white",
                  }}
                >
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {user.displayName}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {user.email}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
        {query.length >= 2 && !loading && users.length === 0 && (
          <p
            className="text-sm text-center"
            style={{ color: "var(--color-text-secondary)" }}
          >
            No users found.
          </p>
        )}
      </div>
    </div>
  );
}
