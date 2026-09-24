import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              // Split the (large) lucide-react icon library so no single
              // chunk exceeds the 500 kB warning threshold.
              name: "lucide",
              test: /node_modules[\\/]lucide-react[\\/]/,
              minSize: 40000,
              maxSize: 450000,
              priority: 10,
            },
            {
              name: "common",
              minShareCount: 2,
              minSize: 20000,
              maxSize: 250000,
              priority: 5,
            },
          ],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});