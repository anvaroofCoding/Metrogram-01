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
  label: string;
  description?: string;
  icon: IconType;
  iconColor: string;
}

export interface AdminServiceSection {
  title: string;
  items: AdminServiceItem[];
}

export const ADMIN_SERVICE_SECTIONS: AdminServiceSection[] = [
  {
    title: "Foydalanuvchilar",
    items: [
      {
        id: "register",
        label: "Foydalanuvchi qo'shish",
        description: "Yangi kontakt ro'yxatdan o'tkazish",
        icon: IconPersonAdd,
        iconColor: "#00bbff",
      },
      {
        id: "users",
        label: "Barcha foydalanuvchilar",
        description: "Ro'yxatdan o'tganlar ro'yxati",
        icon: IconPeople,
        iconColor: "#6366f1",
      },
      {
        id: "contacts",
        label: "Kontaktlar",
        description: "Telefon kitobi",
        icon: IconPerson,
        iconColor: "#14b8a6",
      },
      {
        id: "banned",
        label: "Ban qilinganlar",
        description: "Cheklangan akkauntlar",
        icon: IconShield,
        iconColor: "#ef4444",
      },
    ],
  },
  {
    title: "Kontent",
    items: [
      {
        id: "channels",
        label: "Kanallar boshqaruvi",
        description: "Kanallar va obunachilar",
        icon: IconMegaphone,
        iconColor: "#0ea5e9",
      },
      {
        id: "groups",
        label: "Guruhlar boshqaruvi",
        description: "Guruh a'zolari va huquqlar",
        icon: IconPeople,
        iconColor: "#8b5cf6",
      },
      {
        id: "bots",
        label: "Botlar",
        description: "Bot tokenlari va sozlamalar",
        icon: IconChat,
        iconColor: "#f97316",
      },
    ],
  },
  {
    title: "Xabarlar",
    items: [
      {
        id: "broadcast",
        label: "Broadcast xabar",
        description: "Ommaviy xabar yuborish",
        icon: IconMegaphone,
        iconColor: "#00bbff",
      },
      {
        id: "stats",
        label: "Statistika",
        description: "Faollik va xabarlar hisoboti",
        icon: IconDocument,
        iconColor: "#64748b",
      },
    ],
  },
  {
    title: "Xavfsizlik",
    items: [
      {
        id: "admins",
        label: "Adminlar",
        description: "Huquqlar va rollar",
        icon: IconShield,
        iconColor: "#eab308",
      },
      {
        id: "sessions",
        label: "Faol sessiyalar",
        description: "Qurilmalar va kirishlar",
        icon: IconStories,
        iconColor: "#22c55e",
      },
    ],
  },
  {
    title: "Tizim",
    items: [
      {
        id: "settings",
        label: "Tizim sozlamalari",
        description: "Umumiy admin parametrlari",
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
  if (screen === "hub") return "Admin";
  if (screen === "register") return "Foydalanuvchi qo'shish";
  if (screen === "users") return "Barcha foydalanuvchilar";
  if (screen === "contacts") return "Kontaktlar";

  for (const section of ADMIN_SERVICE_SECTIONS) {
    const item = section.items.find((entry) => entry.id === screen);
    if (item) return item.label;
  }

  return "Admin";
}
