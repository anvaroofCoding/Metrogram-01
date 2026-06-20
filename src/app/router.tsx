import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/auth-store";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ChatPage } from "@/features/chat/pages/ChatPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <div key={user?.id} className="contents">{children}</div>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isAddAccount = new URLSearchParams(location.search).get("add") === "1";

  if (isAuthenticated && !isAddAccount) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
