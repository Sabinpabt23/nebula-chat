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

  // Group-specific state
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
      if (exists) {
        return prev.filter((m) => m.id !== user.id);
      }
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

        {/* Tabs */}
        <div
          className="flex rounded-lg p-0.5 mb-4"
          style={{ backgroundColor: "var(--color-bg-elevated)" }}
        >
          {(["dm", "group"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className="flex-1 py-1.5 text-sm rounded-md font-medium transition-all duration-150"
              style={{
                backgroundColor:
                  activeTab === tab ? "var(--color-bg-surface)" : "transparent",
                color:
                  activeTab === tab
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
              }}
            >
              {tab === "dm" ? "Direct Message" : "Group Chat"}
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
            className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3"
            style={{
              backgroundColor: "var(--color-bg-elevated)",
              color: "var(--color-text-primary)",
            }}
          />
        )}

        {/* Selected members chips */}
        {activeTab === "group" && selectedMembers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {selectedMembers.map((member) => (
              <span
                key={member.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "white",
                }}
              >
                {member.displayName}
                <button
                  onClick={() => toggleMember(member)}
                  className="ml-0.5 opacity-70 hover:opacity-100"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search input */}
        <input
          type="text"
          placeholder="Search by name or email..."
          value={query}
          autoFocus
          onChange={(e) => {
            setQuery(e.target.value);
            searchUsers(e.target.value);
          }}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            color: "var(--color-text-primary)",
          }}
        />

        {/* Error */}
        {error && (
          <p className="text-xs mb-3" style={{ color: "var(--color-danger)" }}>
            {error}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <p
            className="text-sm text-center py-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Searching...
          </p>
        )}

        {/* User list */}
        {filteredUsers.length > 0 && (
          <div className="max-h-48 overflow-y-auto mb-3">
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
                className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors duration-100"
                style={{
                  backgroundColor: isSelected(user.id)
                    ? "var(--color-bg-elevated)"
                    : "transparent",
                }}
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
                {activeTab === "group" && (
                  <span
                    className="ml-auto text-xs flex-shrink-0"
                    style={{
                      color: isSelected(user.id)
                        ? "var(--color-accent)"
                        : "var(--color-text-tertiary)",
                    }}
                  >
                    {isSelected(user.id) ? "Selected" : "Add"}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {query.length >= 2 && !loading && filteredUsers.length === 0 && (
          <p
            className="text-sm text-center py-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            No users found.
          </p>
        )}

        {/* Create group button */}
        {activeTab === "group" && (
          <button
            onClick={handleCreateGroup}
            disabled={
              creating || !groupName.trim() || selectedMembers.length === 0
            }
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--color-accent)", color: "white" }}
          >
            {creating ? "Creating..." : "Create Group"}
          </button>
        )}
      </div>
    </div>
  );
}
