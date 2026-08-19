import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
// @ts-ignore
import netlify from "@netlify/vite-plugin-tanstack-start";

export default defineConfig({
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
