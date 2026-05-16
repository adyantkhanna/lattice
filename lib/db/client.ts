import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const authMode = process.env.AUTH_MODE ?? "local";

function createDbClient() {
  if (authMode === "multi") {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is required in multi-user mode");
    return createClient({ url });
  }
  return createClient({ url: "file:./data/lattice.db" });
}

const client = createDbClient();

export const db = drizzle(client, { schema });
export type DB = typeof db;
