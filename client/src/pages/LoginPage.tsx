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
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-bg-base)" }}
    >
      <LoginForm />
    </div>
  );
}
