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
  onMemberAdded: () => void; // New prop to sync parent data on additions
}

export function GroupInfoModal({
  conversation,
  onClose,
  onMemberRemoved,
  onMemberAdded,
}: GroupInfoModalProps) {
  const currentUser = useAuthStore((state) => state.user);
  const [error, setError] = useState("");

  // Inline search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [adding, setAdding] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const isAdmin =
    conversation.participants?.find((p) => p.userId === currentUser?.id)
      ?.role === "ADMIN";

  // Derive active members directly from the conversation prop
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
      // Filter out users who are already members of this group
      setSearchResults(
        (data.data || []).filter((u) => !members.find((m) => m.id === u.id)),
      );
    } catch {
      // Fail silently or handle gracefully for background searching
    }
  }

  async function handleAddMember(userId: string) {
    setAdding(true);
    try {
      await api.post(`/conversations/${conversation.id}/members`, {
        memberIds: [userId],
      });

      setSearchResults((prev) => prev.filter((u) => u.id !== userId));
      onMemberAdded(); // Triggers parent hook to refresh conversation data down
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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-xl"
        style={{ backgroundColor: "var(--color-bg-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          {conversation.name}
        </h3>

        {error && (
          <p className="text-xs mb-3" style={{ color: "var(--color-danger)" }}>
            {error}
          </p>
        )}

        <div className="max-h-64 overflow-y-auto">
          <p
            className="text-xs font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Members ({members.length})
          </p>

          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "white",
                  }}
                >
                  {member.displayName.charAt(0).toUpperCase()}
                </div>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {member.displayName}
                  {member.id === currentUser?.id ? " (You)" : ""}
                </span>
              </div>

              {isAdmin && member.id !== currentUser?.id && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-xs transition-colors hover:opacity-80"
                  style={{ color: "var(--color-danger)" }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Inline Search & Add Section for Admin */}
        {isAdmin && (
          <div
            className="mt-4 pt-4 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            {!showSearch ? (
              <button
                onClick={() => setShowSearch(true)}
                className="w-full py-2 rounded-xl text-sm font-medium transition-colors hover:opacity-90"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "white",
                }}
              >
                + Add Member
              </button>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  autoFocus
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-2"
                  style={{
                    backgroundColor: "var(--color-bg-elevated)",
                    color: "var(--color-text-primary)",
                  }}
                />

                <div className="max-h-32 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between py-2"
                    >
                      <span
                        className="text-sm"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {user.displayName}
                      </span>
                      <button
                        onClick={() => handleAddMember(user.id)}
                        disabled={adding}
                        className="text-xs font-medium transition-colors hover:opacity-80 disabled:opacity-50"
                        style={{ color: "var(--color-accent)" }}
                      >
                        Add
                      </button>
                    </div>
                  ))}
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

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            color: "var(--color-text-primary)",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
