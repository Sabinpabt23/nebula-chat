/**
 * AuthProvider
 *
 * Runs once on app mount. Attempts to restore a session from the
 * refresh token cookie. Shows a loading screen while checking.
 * All protected routes wait for this check to complete.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api, { setAccessToken } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { type ApiResponse, type AuthTokens } from "../../types";

interface AuthContextType {
  isChecking: boolean;
}

const AuthContext = createContext<AuthContextType>({ isChecking: true });

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setAuth, clearAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const { data } =
          await api.post<ApiResponse<AuthTokens>>("/auth/refresh");
        const { accessToken: newToken, user } = data.data!;
        setAccessToken(newToken);
        setAuth(user, newToken);
      } catch {
        clearAuth();
        setAccessToken(null);
      } finally {
        setIsChecking(false);
      }
    }
    restoreSession();
  }, []);

  if (isChecking) {
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

  return <>{children}</>;
}
