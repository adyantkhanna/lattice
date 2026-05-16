import { defineConfig } from "drizzle-kit";

const authMode = process.env.AUTH_MODE ?? "local";

function dbCredentials() {
  if (authMode === "multi") {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL must be set when AUTH_MODE=multi");
    return { url };
  }
  return { url: "file:./data/lattice.db" };
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: authMode === "multi" ? "postgresql" : "sqlite",
  dbCredentials: dbCredentials(),
});
