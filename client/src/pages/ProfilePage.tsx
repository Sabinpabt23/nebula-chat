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
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-bg-base)" }}
      >
        <p className="text-sm" style={{ color: "var(--color-danger)" }}>
          {error || "Profile not found"}
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-bg-base)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ backgroundColor: "var(--color-bg-surface)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="text-sm mb-6 transition-colors duration-150"
          style={{ color: "var(--color-text-secondary)" }}
        >
          ← Back
        </button>

        <div className="flex flex-col items-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold mb-4 relative"
            style={{ backgroundColor: "var(--color-accent)", color: "white" }}
          >
            {profile.displayName.charAt(0).toUpperCase()}
            {profile.isOnline && (
              <div
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2"
                style={{
                  backgroundColor: "var(--color-online)",
                  borderColor: "var(--color-bg-surface)",
                }}
              />
            )}
          </div>

          <h2
            className="text-lg font-semibold mb-1"
            style={{ color: "var(--color-text-primary)" }}
          >
            {profile.displayName}
          </h2>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {profile.email}
          </p>

          <div
            className="w-full border-t pt-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center justify-between py-2">
              <span
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Status
              </span>
              <span
                className="text-sm font-medium"
                style={{
                  color: profile.isOnline
                    ? "var(--color-online)"
                    : "var(--color-text-tertiary)",
                }}
              >
                {profile.isOnline ? "Online" : "Offline"}
              </span>
            </div>
            {profile.lastSeenAt && (
              <div className="flex items-center justify-between py-2">
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Last seen
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {new Date(profile.lastSeenAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
