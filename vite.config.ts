import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import path from "node:path";

process.env.NODE_ENV = "production";

export default defineConfig({
  server: {
    port: 8080,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  css: {
    transformer: "postcss",
  },

  // @ts-ignore
  oxc: {
    jsx: {
      runtime: "automatic",
      development: false,
    },
  },

  esbuild: {
    jsxDev: false,
  },

  plugins: [
    tanstackStart(),
    nitro(),
    react(),
    tailwindcss(),
  ],
});