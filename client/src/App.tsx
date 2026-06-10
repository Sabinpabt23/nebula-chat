/**
 * App.tsx
 *
 * Root application component for Nebula Chat.
 * Defines top-level routes: /login and /chat.
 *
 * Auth check happens once at app level via AuthProvider (in main.tsx).
 * Route protection is enforced here via ProtectedRoute.
 * Routes are matched top-to-bottom — duplicates have been removed.
 */
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { ChatPage } from "./pages/ChatPage";
import { ROUTES } from "./lib/constants";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ProfilePage } from "./pages/ProfilePage";

export default function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* Protected routes — ProtectedRoute redirects to /login if not authenticated */}
      <Route
        path={ROUTES.CHAT}
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${ROUTES.CHAT}/:conversationId`}
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:userId?"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all — must be last */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}
