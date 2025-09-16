import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/utils/db/schema.ts",
  dbCredentials: {
    url: process.env.SUPABASE_DB_URL!,
  },
  out: "./drizzle",
});
