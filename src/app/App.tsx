import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/app/ThemeProvider";
import { AppRouter } from "@/app/router";
import { AuthProvider } from "@/features/auth/auth-store";
import { ProfileProvider } from "@/features/profile/profile-store";
import { RealtimeProvider } from "@/realtime/RealtimeProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <RealtimeProvider>{children}</RealtimeProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </BrowserRouter>
  );
}
