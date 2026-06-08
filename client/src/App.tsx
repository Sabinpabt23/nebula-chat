/**
 * App Root
 *
 * Top-level component with route definitions.
 * Uses React Router for client-side navigation.
 */
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/chat" /> : <div>Login Page</div>
        }
      />
      <Route
        path="/chat"
        element={
          isAuthenticated ? <div>Chat Page</div> : <Navigate to="/login" />
        }
      />
      <Route path="*" element={<Navigate to="/chat" />} />
    </Routes>
  );
}

export default App;
