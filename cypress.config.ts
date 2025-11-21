import { defineConfig } from "cypress";
import dotenv from "dotenv";
import path from "path";

// Load env vars (e.g., NEXT_PUBLIC_*, CYPRESS_BASE_URL)
dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

const baseUrl =
  process.env.CYPRESS_BASE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:9002";

export default defineConfig({
  e2e: {
    baseUrl,
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    supportFile: false,
    video: false,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    env: {
      apiUrl:
        process.env.CYPRESS_API_URL ??
        process.env.NEXT_PUBLIC_API_BASE_URL ??
        "http://localhost:3000/api",
    },
  },
  retries: {
    runMode: 1,
    openMode: 0,
  },
});

