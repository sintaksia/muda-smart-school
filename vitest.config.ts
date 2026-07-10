import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      // Hanya business logic — komponen UI tidak dihitung
      include: ["src/features/**", "src/app/api/**", "src/lib/**"],
      exclude: ["**/*.test.*", "**/types/**", "**/index.ts", "**/*.d.ts"],
      // Ratchet: batas diset sedikit di bawah coverage aktual dan hanya
      // boleh dinaikkan. Target jangka panjang: 70-80% untuk semua area
      // (auth & CMS belum punya test — lihat README).
      thresholds: {
        lines: 39,
        functions: 38,
        statements: 40,
        branches: 42,
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
