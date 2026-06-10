/**
 * NewChatModal
 *
 * Modal for creating new conversations — both direct messages and group chats.
 *
 * DM flow: Search users → click to start conversation
 * Group flow: Enter group name → search and select members → create group
 */
import { useState, useCallback } from "react";
import api from "../../services/api";
import { type ApiResponse, type User } from "../../types";
import { getErrorMessage } from "../../lib/errors";

type TabType = "dm" | "group";

interface NewChatModalProps {
  onClose: () => void;
  onStartChat: (userId: string) => void;
  onCreateGroup: (name: string, memberIds: string[]) => void;
}

export function NewChatModal({
  onClose,
  onStartChat,
  onCreateGroup,
}: NewChatModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("dm");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [creating, setCreating] = useState(false);

  const searchUsers = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setUsers([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<ApiResponse<User[]>>(
        `/users/search?query=${encodeURIComponent(searchQuery)}`,
      );
      setUsers(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Search failed"));
    } finally {
      setLoading(false);
    }
  }, []);

  function toggleMember(user: User) {
    setSelectedMembers((prev) => {
      const exists = prev.find((m) => m.id === user.id);
      if (exists) return prev.filter((m) => m.id !== user.id);
      return [...prev, user];
    });
  }

  function isSelected(userId: string): boolean {
    return selectedMembers.some((m) => m.id === userId);
  }

  async function handleCreateGroup() {
    if (!groupName.trim()) {
      setError("Please enter a group name.");
      return;
    }
    if (selectedMembers.length === 0) {
      setError("Please select at least one member.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const memberIds = selectedMembers.map((m) => m.id);
      onCreateGroup(groupName.trim(), memberIds);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create group"));
    } finally {
      setCreating(false);
    }
  }

  function handleTabChange(tab: TabType) {
    setActiveTab(tab);
    setQuery("");
    setUsers([]);
    setError("");
  }

  const filteredUsers =
    activeTab === "group" ? users.filter((u) => !isSelected(u.id)) : users;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
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
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            New conversation
          </h3>
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
          {/* Tabs */}
          <div
            className="flex rounded-xl p-0.5 mb-4"
            style={{ backgroundColor: "var(--color-bg-elevated)" }}
          >
            {(["dm", "group"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className="flex-1 py-1.5 text-sm rounded-lg font-medium transition-all duration-150"
                style={{
                  backgroundColor:
                    activeTab === tab
                      ? "var(--color-bg-surface)"
                      : "transparent",
                  color:
                    activeTab === tab
                      ? "var(--color-text-primary)"
                      : "var(--color-text-secondary)",
                  border:
                    activeTab === tab
                      ? "1px solid var(--color-border)"
                      : "1px solid transparent",
                }}
              >
                {tab === "dm" ? "Direct message" : "Group chat"}
              </button>
            ))}
          </div>

          {/* Group name input */}
          {activeTab === "group" && (
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                setError("");
              }}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none mb-3 transition-colors"
              style={{
                backgroundColor: "var(--color-bg-elevated)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
              }}
            />
          )}

          {/* Selected member chips */}
          {activeTab === "group" && selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selectedMembers.map((member) => (
                <span
                  key={member.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: "var(--color-accent-subtle)",
                    color: "var(--color-accent)",
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}
                >
                  {member.displayName}
                  <button
                    onClick={() => toggleMember(member)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 2l6 6M8 2L2 8"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search input */}
          <div className="relative mb-3">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <circle
                cx="6"
                cy="6"
                r="4.5"
                stroke="var(--color-text-tertiary)"
                strokeWidth="1.3"
              />
              <path
                d="M9.5 9.5L12 12"
                stroke="var(--color-text-tertiary)"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={query}
              autoFocus
              onChange={(e) => {
                setQuery(e.target.value);
                searchUsers(e.target.value);
              }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
              style={{
                backgroundColor: "var(--color-bg-elevated)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>

          {/* Error */}
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

          {/* Loading */}
          {loading && (
            <p
              className="text-sm text-center py-3"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Searching…
            </p>
          )}

          {/* User list */}
          {filteredUsers.length > 0 && (
            <div className="max-h-52 overflow-y-auto -mx-1 px-1 mb-3">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    if (activeTab === "dm") {
                      onStartChat(user.id);
                      onClose();
                    } else {
                      toggleMember(user);
                    }
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-100"
                  style={{
                    backgroundColor: isSelected(user.id)
                      ? "var(--color-accent-subtle)"
                      : "transparent",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{
                      backgroundColor: "var(--color-accent)",
                      color: "white",
                    }}
                  >
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
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
                  {activeTab === "group" && (
                    <div
                      className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0"
                      style={{
                        borderColor: isSelected(user.id)
                          ? "var(--color-accent)"
                          : "var(--color-border)",
                        backgroundColor: isSelected(user.id)
                          ? "var(--color-accent)"
                          : "transparent",
                      }}
                    >
                      {isSelected(user.id) && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <path
                            d="M2 5l2.5 2.5L8 3"
                            stroke="white"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {query.length >= 2 && !loading && filteredUsers.length === 0 && (
            <div className="text-center py-6">
              <p
                className="text-sm"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                No users found for "{query}"
              </p>
            </div>
          )}

          {/* Create group button */}
          {activeTab === "group" && (
            <button
              onClick={handleCreateGroup}
              disabled={
                creating || !groupName.trim() || selectedMembers.length === 0
              }
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 mt-1"
              style={{ backgroundColor: "var(--color-accent)", color: "white" }}
            >
              {creating
                ? "Creating…"
                : `Create group${selectedMembers.length > 0 ? ` · ${selectedMembers.length} member${selectedMembers.length > 1 ? "s" : ""}` : ""}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
