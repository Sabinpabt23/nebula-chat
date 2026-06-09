/**
 * App.tsx
 *
 * Root application component for Nebula Chat.
 * Defines top-level routes: /login and /chat.
 */
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { ChatPage } from "./pages/ChatPage";
import { ROUTES } from "./lib/constants";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.CHAT} element={<ChatPage />} />
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path={ROUTES.CHAT} element={<ChatPage />} />
      <Route path={`${ROUTES.CHAT}/:conversationId`} element={<ChatPage />} />
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
    </Routes>
  );
}
