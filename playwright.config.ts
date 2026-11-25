import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
import { randomBytes } from "node:crypto";

config({ path: [".env.local", ".env"], quiet: true });
const database = process.env.TEST_DATABASE_URL;
if (!database || !new URL(database).pathname.endsWith("_test") || database === process.env.DATABASE_URL) {
  throw new Error("Playwright requires an isolated TEST_DATABASE_URL ending in _test.");
}
const origin = "http://127.0.0.1:3100";
export default defineConfig({
  testDir: "tests/e2e", workers: 1, timeout: 60000, expect: { timeout: 12000 },
  use: { ...devices["Desktop Chrome"], baseURL: origin, channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: "retain-on-failure", launchOptions: { args: ["--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"] } },
  webServer: { command: "npm run start -- --port 3100",
    url: origin + "/api/health", timeout: 120000, reuseExistingServer: false, env: {
      DATABASE_URL: database, AUTH_URL: origin, NEXTAUTH_URL: origin, COMMERCE_MODE: "demo",
      AUTH_SECRET: randomBytes(48).toString("hex"),
    } },
});
