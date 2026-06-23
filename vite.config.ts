import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: proxyToBackend(),
  },
  preview: {
    port: 4173,
    proxy: proxyToBackend(),
  },
});

function proxyToBackend() {
  return {
    "/api": {
      target: "http://localhost:3000",
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, "/api/v1"),
    },
    "/socket.io": {
      target: "http://localhost:3000",
      ws: true,
      changeOrigin: true,
    },
    "/realtime": {
      target: "http://localhost:3000",
      ws: true,
      changeOrigin: true,
    },
  };
}
