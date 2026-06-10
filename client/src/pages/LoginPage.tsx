/**
 * LoginPage.tsx
 *
 * Full-screen login page for Nebula Chat.
 * Provides the centered layout that wraps LoginForm.
 * Redirects authenticated users to the chat route.
 *
 * Layout responsibility only — no auth logic lives here.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { useAuthStore } from "../stores/authStore";
import { ROUTES } from "../lib/constants";

export function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.CHAT, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        backgroundColor: "var(--color-bg-base)",
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 100%, rgba(99,102,241,0.04) 0%, transparent 50%)
        `,
      }}
    >
      <LoginForm />
    </div>
  );
}
