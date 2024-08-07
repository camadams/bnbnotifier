import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

// export default defineConfig({
//   schema: "./db/schema.ts",
//   out: "./migrations",
//   dialect: "sqlite",
//   driver: "turso",
//   dbCredentials: {
//     url: process.env.TURSO_CONNECTION_URL!,
//     authToken: process.env.TURSO_AUTH_TOKEN!,
//   },
// });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
