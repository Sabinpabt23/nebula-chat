/**
 * ProfilePage
 *
 * Displays a user's profile information.
 * Works for both the current user (my profile) and other users.
 * If no userId is provided, shows the current user's profile.
 */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { type ApiResponse, type User } from "../types";
import { getErrorMessage } from "../lib/errors";

export function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwnProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError("");
      try {
        if (isOwnProfile) {
          const { data } = await api.get<ApiResponse<User>>("/users/me");
          setProfile(data.data!);
        } else {
          const { data } = await api.get<ApiResponse<User>>(`/users/${userId}`);
          setProfile(data.data!);
        }
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load profile"));
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [userId, isOwnProfile]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-bg-base)" }}
      >
        <div
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{
            borderColor: "var(--color-accent)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "var(--color-bg-base)" }}
      >
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: "var(--color-danger)" }}>
            {error || "Profile not found"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm transition-colors hover:opacity-80"
            style={{ color: "var(--color-accent)" }}
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        backgroundColor: "var(--color-bg-base)",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.06) 0%, transparent 60%)",
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Top accent bar */}
        <div
          className="h-1 w-full"
          style={{ backgroundColor: "var(--color-accent)" }}
        />

        <div className="p-7">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs mb-7 transition-colors hover:opacity-80"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M8 2L4 6l4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>

          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "white",
                }}
              >
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
              {profile.isOnline && (
                <div
                  className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--color-online)",
                    borderColor: "var(--color-bg-surface)",
                  }}
                />
              )}
            </div>

            <h2
              className="text-lg font-semibold mb-0.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              {profile.displayName}
            </h2>
            <p
              className="text-sm mb-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {profile.email}
            </p>

            {/* Online badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 mb-6"
              style={{
                backgroundColor: profile.isOnline
                  ? "rgba(34, 197, 94, 0.12)"
                  : "var(--color-bg-elevated)",
                color: profile.isOnline
                  ? "var(--color-online)"
                  : "var(--color-text-tertiary)",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: profile.isOnline
                    ? "var(--color-online)"
                    : "var(--color-text-tertiary)",
                }}
              />
              {profile.isOnline ? "Online now" : "Offline"}
            </div>

            {/* Info rows */}
            <div
              className="w-full rounded-xl overflow-hidden"
              style={{ backgroundColor: "var(--color-bg-elevated)" }}
            >
              {isOwnProfile && (
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Account
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--color-accent)" }}
                  >
                    My Profile
                  </span>
                </div>
              )}
              {profile.lastSeenAt && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Last seen
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {new Date(profile.lastSeenAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
