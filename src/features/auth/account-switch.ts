import { chatApi } from "@/features/chat/api/chatApi";
import { usersApi } from "@/features/users/api/usersApi";
import { resetRealtimeSocket } from "@/realtime/realtime-socket";

export function resetAccountSessionData() {
  chatApi.util.invalidateTags(["Conversation", "Message", "Typing"]);
  usersApi.util.invalidateTags(["Contact"]);
  resetRealtimeSocket();
}
