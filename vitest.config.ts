import path from "path";
import { defineConfig } from "vitest/config";

if (process.env.CI && (!process.env.DATABASE_URL?.endsWith('/portfolio_verification') || process.env.RUN_DB_TESTS !== '1')) {
  throw new Error('CI must enable integration tests against the disposable portfolio_verification database.');
}

export default defineConfig({
  test: {
    maxWorkers: process.env.CI ? 2 : undefined,
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/db.ts", "src/lib/auth.ts", "src/lib/mail.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
