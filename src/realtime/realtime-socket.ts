import { io, type Socket } from "socket.io-client";
import { env } from "@/config/env";
import { getCurrentUserId } from "@/features/auth/auth-session";

let socket: Socket | null = null;
let refCount = 0;
let disconnectTimer: ReturnType<typeof setTimeout> | null = null;

function getSocketBaseUrl(): string {
  if (env.wsUrl.trim()) return env.wsUrl.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:3000";
  return window.location.origin;
}

function createSocket(): Socket {
  return io(`${getSocketBaseUrl()}/realtime`, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    auth: { userId: getCurrentUserId() },
  });
}

export function acquireRealtimeSocket(): () => void {
  if (disconnectTimer) {
    clearTimeout(disconnectTimer);
    disconnectTimer = null;
  }

  refCount += 1;

  if (!socket) {
    socket = createSocket();
  } else if (!socket.connected) {
    socket.auth = { userId: getCurrentUserId() };
    socket.connect();
  }

  return () => {
    refCount = Math.max(0, refCount - 1);
    if (refCount === 0 && socket) {
      disconnectTimer = setTimeout(() => {
        if (refCount === 0 && socket) {
          socket.removeAllListeners();
          socket.disconnect();
          socket = null;
        }
        disconnectTimer = null;
      }, 200);
    }
  };
}

export function getRealtimeSocket(): Socket | null {
  return socket;
}

export function onSocketEvent(
  event: string,
  handler: (...args: unknown[]) => void,
): () => void {
  const active = socket;
  active?.on(event, handler);
  return () => {
    active?.off(event, handler);
  };
}

export function emitSocketEvent(event: string, payload: unknown): void {
  socket?.emit(event, payload);
}

export function resetRealtimeSocket(): void {
  if (disconnectTimer) {
    clearTimeout(disconnectTimer);
    disconnectTimer = null;
  }
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  refCount = 0;
}

export function onSocketConnectionChange(handler: (connected: boolean) => void): () => void {
  const active = socket;
  if (!active) {
    handler(false);
    return () => undefined;
  }

  const onConnect = () => handler(true);
  const onDisconnect = () => handler(false);

  active.on("connect", onConnect);
  active.on("disconnect", onDisconnect);
  handler(active.connected);

  return () => {
    active.off("connect", onConnect);
    active.off("disconnect", onDisconnect);
  };
}
