import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    envPrefix: ["VITE_", "GEMINI_"],
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
