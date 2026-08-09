import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Use the port the launcher assigns via PORT; otherwise let Vite pick a
    // free one itself. No strictPort, so a busy default just moves up.
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
});
