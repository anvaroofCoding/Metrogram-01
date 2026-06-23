import type { IconType } from "react-icons";
import {
  IconChat,
  IconDocument,
  IconMegaphone,
  IconPeople,
  IconPerson,
  IconPersonAdd,
  IconSettings,
  IconShield,
  IconStories,
} from "@/components/icons";
import { translate } from "@/i18n/translate";

export type AdminScreen =
  | "hub"
  | "register"
  | "users"
  | "contacts"
  | "banned"
  | "channels"
  | "groups"
  | "bots"
  | "broadcast"
  | "stats"
  | "admins"
  | "sessions"
  | "settings";

export interface AdminServiceItem {
  id: AdminScreen;
  labelKey: string;
  descriptionKey?: string;
  icon: IconType;
  iconColor: string;
}

export interface AdminServiceSection {
  titleKey: string;
  items: AdminServiceItem[];
}

export const ADMIN_SERVICE_SECTIONS: AdminServiceSection[] = [
  {
    titleKey: "admin.section.users",
    items: [
      {
        id: "register",
        labelKey: "admin.services.register",
        descriptionKey: "admin.services.registerDesc",
        icon: IconPersonAdd,
        iconColor: "#00bbff",
      },
      {
        id: "users",
        labelKey: "admin.services.users",
        descriptionKey: "admin.services.usersDesc",
        icon: IconPeople,
        iconColor: "#6366f1",
      },
      {
        id: "contacts",
        labelKey: "admin.services.contacts",
        descriptionKey: "admin.services.contactsDesc",
        icon: IconPerson,
        iconColor: "#14b8a6",
      },
      {
        id: "banned",
        labelKey: "admin.services.banned",
        descriptionKey: "admin.services.bannedDesc",
        icon: IconShield,
        iconColor: "#ef4444",
      },
    ],
  },
  {
    titleKey: "admin.section.content",
    items: [
      {
        id: "channels",
        labelKey: "admin.services.channels",
        descriptionKey: "admin.services.channelsDesc",
        icon: IconMegaphone,
        iconColor: "#0ea5e9",
      },
      {
        id: "groups",
        labelKey: "admin.services.groups",
        descriptionKey: "admin.services.groupsDesc",
        icon: IconPeople,
        iconColor: "#8b5cf6",
      },
      {
        id: "bots",
        labelKey: "admin.services.bots",
        descriptionKey: "admin.services.botsDesc",
        icon: IconChat,
        iconColor: "#f97316",
      },
    ],
  },
  {
    titleKey: "admin.section.messages",
    items: [
      {
        id: "broadcast",
        labelKey: "admin.services.broadcast",
        descriptionKey: "admin.services.broadcastDesc",
        icon: IconMegaphone,
        iconColor: "#00bbff",
      },
      {
        id: "stats",
        labelKey: "admin.services.stats",
        descriptionKey: "admin.services.statsDesc",
        icon: IconDocument,
        iconColor: "#64748b",
      },
    ],
  },
  {
    titleKey: "admin.section.security",
    items: [
      {
        id: "admins",
        labelKey: "admin.services.admins",
        descriptionKey: "admin.services.adminsDesc",
        icon: IconShield,
        iconColor: "#eab308",
      },
      {
        id: "sessions",
        labelKey: "admin.services.sessions",
        descriptionKey: "admin.services.sessionsDesc",
        icon: IconStories,
        iconColor: "#22c55e",
      },
    ],
  },
  {
    titleKey: "admin.section.system",
    items: [
      {
        id: "settings",
        labelKey: "admin.services.settings",
        descriptionKey: "admin.services.settingsDesc",
        icon: IconSettings,
        iconColor: "#71717a",
      },
    ],
  },
];

export const PLACEHOLDER_SCREENS = new Set<AdminScreen>([
  "banned",
  "channels",
  "groups",
  "bots",
  "broadcast",
  "stats",
  "admins",
  "sessions",
  "settings",
]);

export function getAdminScreenTitle(screen: AdminScreen): string {
  if (screen === "hub") return translate("admin.title");
  if (screen === "register") return translate("admin.services.register");
  if (screen === "users") return translate("admin.services.users");
  if (screen === "contacts") return translate("admin.services.contacts");

  for (const section of ADMIN_SERVICE_SECTIONS) {
    const item = section.items.find((entry) => entry.id === screen);
    if (item) return translate(item.labelKey);
  }

  return translate("admin.title");
}
