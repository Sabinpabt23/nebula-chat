/**
 * GroupInfoModal
 *
 * Shows group details — member list, add members, remove members.
 * Only visible for GROUP conversations. Admin can manage members.
 */
import { useState, useEffect } from "react";
import api from "../../services/api";
import { type ApiResponse, type Conversation, type User } from "../../types";
import { useAuthStore } from "../../stores/authStore";
import { getErrorMessage } from "../../lib/errors";

interface GroupInfoModalProps {
  conversation: Conversation;
  onClose: () => void;
  onMemberRemoved: () => void;
}

export function GroupInfoModal({
  conversation,
  onClose,
  onMemberRemoved,
}: GroupInfoModalProps) {
  const currentUser = useAuthStore((state) => state.user);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin =
    conversation.participants?.find((p) => p.userId === currentUser?.id)
      ?.role === "ADMIN";

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      const { data } = await api.get<ApiResponse<Conversation>>(
        `/conversations/${conversation.id}`,
      );
      setMembers(
        data.data?.participants?.map((p) => p.user!).filter(Boolean) || [],
      );
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load members"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    try {
      await api.delete(`/conversations/${conversation.id}/members/${userId}`);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
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

        {loading ? (
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Loading...
          </p>
        ) : (
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
