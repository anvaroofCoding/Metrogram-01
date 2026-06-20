export interface GroupMember {
  id: string;
  name: string;
  status: string;
  avatarEmoji?: string;
  avatarColor?: string;
  isOwner?: boolean;
}

export const DEMO_GROUP_MEMBERS: GroupMember[] = [
  {
    id: "m1",
    name: "Islom | Software developer",
    status: "online",
    avatarEmoji: "I",
    avatarColor: "#00bbff",
  },
  {
    id: "m2",
    name: "Abdulaziz",
    status: "last seen recently",
    avatarEmoji: "A",
    avatarColor: "#8b5cf6",
    isOwner: true,
  },
  {
    id: "m3",
    name: "Usmon",
    status: "last seen recently",
    avatarEmoji: "U",
    avatarColor: "#14b8a6",
  },
  {
    id: "m4",
    name: "Shoxzod",
    status: "last seen recently",
    avatarEmoji: "S",
    avatarColor: "#f97316",
  },
  {
    id: "m5",
    name: "Dilshod",
    status: "last seen within a week",
    avatarEmoji: "D",
    avatarColor: "#ec4899",
  },
  {
    id: "m6",
    name: "Shaxlo",
    status: "last seen a long time ago",
    avatarEmoji: "Sh",
    avatarColor: "#6366f1",
  },
];

export const DEMO_MEDIA_ITEMS = [
  { id: "1", duration: "0:23", url: "https://picsum.photos/seed/m1/300/300" },
  { id: "2", duration: "0:06", url: "https://picsum.photos/seed/m2/300/300" },
  { id: "3", duration: "0:12", url: "https://picsum.photos/seed/m3/300/300" },
  { id: "4", duration: "0:08", url: "https://picsum.photos/seed/m4/300/300" },
  { id: "5", duration: "0:15", url: "https://picsum.photos/seed/m5/300/300" },
  { id: "6", duration: "0:04", url: "https://picsum.photos/seed/m6/300/300" },
];

export const DEMO_LINKS = [
  { id: "l1", title: "instagram.com", url: "https://instagram.com" },
  { id: "l2", title: "github.com/metrogram", url: "https://github.com" },
];

export const DEMO_VOICE = [
  { id: "v1", duration: "0:42", date: "Wed" },
  { id: "v2", duration: "1:05", date: "Tue" },
];

export const DEMO_FILES = [
  { id: "f1", name: "document.pdf", kind: "PDF" as const },
  { id: "f2", name: "data.json", kind: "JSON" as const },
];
