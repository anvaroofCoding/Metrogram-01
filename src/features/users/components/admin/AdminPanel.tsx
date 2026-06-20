import { useState } from "react";
import { AdminRegisterPanel } from "@/features/users/components/AdminRegisterPanel";
import { ContactsPanel } from "@/features/users/components/ContactsPanel";
import { AdminEditUserPanel } from "./AdminEditUserPanel";
import { AdminHubPanel } from "./AdminHubPanel";
import { AdminPlaceholderPanel } from "./AdminPlaceholderPanel";
import { AdminUsersPanel } from "./AdminUsersPanel";
import type { Contact } from "@/types/chat";
import { PLACEHOLDER_SCREENS, type AdminScreen } from "./admin-services";

interface AdminPanelProps {
  onBack: () => void;
  onContactSelect?: (contact: Contact) => void;
}

export function AdminPanel({ onBack, onContactSelect }: AdminPanelProps) {
  const [screen, setScreen] = useState<AdminScreen | "edit-user">("hub");
  const [editingUser, setEditingUser] = useState<Contact | null>(null);

  if (screen === "hub") {
    return <AdminHubPanel onBack={onBack} onNavigate={setScreen} />;
  }

  if (screen === "register") {
    return (
      <AdminRegisterPanel
        onBack={() => setScreen("hub")}
        onRegistered={() => setScreen("users")}
      />
    );
  }

  if (screen === "edit-user" && editingUser) {
    return (
      <AdminEditUserPanel
        user={editingUser}
        onBack={() => setScreen("users")}
        onSaved={() => {
          setEditingUser(null);
          setScreen("users");
        }}
      />
    );
  }

  if (screen === "users") {
    return (
      <AdminUsersPanel
        onBack={() => setScreen("hub")}
        onEditUser={(user) => {
          setEditingUser(user);
          setScreen("edit-user");
        }}
      />
    );
  }

  if (screen === "contacts") {
    return (
      <ContactsPanel
        onBack={() => setScreen("hub")}
        onContactSelect={onContactSelect}
      />
    );
  }

  if (screen !== "edit-user" && PLACEHOLDER_SCREENS.has(screen)) {
    return <AdminPlaceholderPanel screen={screen} onBack={() => setScreen("hub")} />;
  }

  return <AdminHubPanel onBack={onBack} onNavigate={setScreen} />;
}
