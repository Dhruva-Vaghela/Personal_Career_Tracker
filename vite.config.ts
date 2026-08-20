import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
// @ts-ignore
import netlify from "@netlify/vite-plugin-tanstack-start";
import path from "node:path";

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
  plugins: [
    tanstackStart(),
    react(),
    tailwindcss(),
    netlify(),
  ],
});



