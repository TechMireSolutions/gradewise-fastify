import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/gradewise_test",
      JWT_SECRET: "test-jwt-secret-at-least-32-chars-long",
    },
  },
});
