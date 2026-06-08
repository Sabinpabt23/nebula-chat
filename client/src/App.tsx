/**
 * App Root
 *
 * Top-level component with route definitions.
 * Uses React Router for client-side navigation.
 */
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { LoginPage } from "./pages/LoginPage";

/**
 * Temporary placeholder — will be replaced with the real ChatPage
 * when the chat interface is built in the next sprint.
 */
function ChatPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: "var(--color-bg-base)",
        color: "var(--color-text-secondary)",
      }}
    >
      <p className="text-sm">Chat — coming soon</p>
    </div>
  );
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/chat" /> : <LoginPage />}
      />
      <Route
        path="/chat"
        element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<Navigate to="/chat" />} />
    </Routes>
  );
}

export default App;
