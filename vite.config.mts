import { defineConfig, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
import eslint from "vite-plugin-eslint";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgrPlugin(), eslint(), tailwindcss()],
  server: {
    host: true,
    port: 3000,
  },
  build: {
    outDir: "build", // Changed output folder, like in CRA
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
    },
  },
} satisfies UserConfig);
