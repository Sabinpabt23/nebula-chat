/**
 * GroupInfoModal
 *
 * Shows group details — member list, add members, remove members.
 * Only visible for GROUP conversations. Admin can manage members.
 */
import { useState } from "react";
import api from "../../services/api";
import { type ApiResponse, type Conversation, type User } from "../../types";
import { useAuthStore } from "../../stores/authStore";
import { getErrorMessage } from "../../lib/errors";

interface GroupInfoModalProps {
  conversation: Conversation;
  onClose: () => void;
  onMemberRemoved: () => void;
  onMemberAdded: () => void;
}

export function GroupInfoModal({
  conversation,
  onClose,
  onMemberRemoved,
  onMemberAdded,
}: GroupInfoModalProps) {
  const currentUser = useAuthStore((state) => state.user);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [adding, setAdding] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const isAdmin =
    conversation.participants?.find((p) => p.userId === currentUser?.id)
      ?.role === "ADMIN";

  const members = (conversation.participants || [])
    .filter((p) => !p.leftAt)
    .map((p) => p.user!)
    .filter(Boolean);

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await api.get<ApiResponse<User[]>>(
        `/users/search?query=${encodeURIComponent(query)}`,
      );
      setSearchResults(
        (data.data || []).filter((u) => !members.find((m) => m.id === u.id)),
      );
    } catch {
      // Fail silently
    }
  }

  async function handleAddMember(userId: string) {
    setAdding(true);
    try {
      await api.post(`/conversations/${conversation.id}/members`, {
        memberIds: [userId],
      });
      setSearchResults((prev) => prev.filter((u) => u.id !== userId));
      onMemberAdded();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to add member"));
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    try {
      await api.delete(`/conversations/${conversation.id}/members/${userId}`);
      onMemberRemoved();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to remove member"));
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{ backgroundColor: "var(--color-accent)", color: "white" }}
            >
              {conversation.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {conversation.name}
              </h3>
              <p
                className="text-[11px]"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {members.length} {members.length === 1 ? "member" : "members"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
            style={{
              backgroundColor: "var(--color-bg-elevated)",
              color: "var(--color-text-secondary)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4">
          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-3"
              style={{
                backgroundColor: "var(--color-danger-subtle)",
                color: "var(--color-danger)",
              }}
            >
              {error}
            </div>
          )}

          {/* Members list */}
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Members
          </p>
          <div className="max-h-52 overflow-y-auto -mx-1 px-1">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between py-2 px-1 rounded-lg"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{
                      backgroundColor: "var(--color-accent)",
                      color: "white",
                    }}
                  >
                    {member.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {member.displayName}
                    </span>
                    {member.id === currentUser?.id && (
                      <span
                        className="ml-1.5 text-[10px]"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        You
                      </span>
                    )}
                  </div>
                </div>

                {isAdmin && member.id !== currentUser?.id && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-xs px-2 py-1 rounded-lg transition-colors hover:opacity-80"
                    style={{
                      color: "var(--color-danger)",
                      backgroundColor: "var(--color-danger-subtle)",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add member (admin only) */}
          {isAdmin && (
            <div
              className="mt-4 pt-4"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              {!showSearch ? (
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-full py-2 rounded-xl text-sm font-medium transition-all duration-150 hover:opacity-90 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "var(--color-accent-subtle)",
                    color: "var(--color-accent)",
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 1v10M1 6h10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Add member
                </button>
              ) : (
                <div>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    autoFocus
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none mb-2 transition-colors"
                    style={{
                      backgroundColor: "var(--color-bg-elevated)",
                      color: "var(--color-text-primary)",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                  <div className="max-h-32 overflow-y-auto -mx-1 px-1">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between py-2 px-1"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                            style={{
                              backgroundColor: "var(--color-accent)",
                              color: "white",
                            }}
                          >
                            {user.displayName.charAt(0).toUpperCase()}
                          </div>
                          <span
                            className="text-sm"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {user.displayName}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddMember(user.id)}
                          disabled={adding}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors hover:opacity-80 disabled:opacity-50"
                          style={{
                            color: "var(--color-accent)",
                            backgroundColor: "var(--color-accent-subtle)",
                          }}
                        >
                          Add
                        </button>
                      </div>
                    ))}
                    {searchQuery.length >= 2 && searchResults.length === 0 && (
                      <p
                        className="text-xs text-center py-3"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        No users found
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="text-xs mt-2 transition-colors hover:opacity-80"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
