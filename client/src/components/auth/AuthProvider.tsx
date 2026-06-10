/**
 * AuthProvider
 *
 * Runs once on app mount. Attempts to restore a session from the
 * refresh token cookie. Shows a loading screen while checking.
 * All protected routes wait for this check to complete.
 *
 * This is also the correct place to wire up the token-refresh callback
 * from api.ts — it runs once and updates the store when the Axios
 * interceptor silently refreshes an expired access token.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import api, { setAccessToken, onTokenRefreshed } from "../../services/api";
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
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double invocation in development React StrictMode
    if (hasRun.current) return;
    hasRun.current = true;

    // Wire up the token-refresh callback once at app level.
    // When the Axios interceptor silently refreshes an expired access token,
    // this keeps the Zustand store in sync with the new token in api.ts memory.
    onTokenRefreshed((newToken: string) => {
      useAuthStore.getState().setAccessToken(newToken);
    });

    async function restoreSession() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const { data } = await api.post<ApiResponse<AuthTokens>>(
          "/auth/refresh",
          {},
          {
            signal: controller.signal,
          },
        );
        clearTimeout(timeout);

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
