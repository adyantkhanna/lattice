import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

export async function runMigrations() {
  const client = createClient({ url: "file:./data/lattice.db" });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: join(process.cwd(), "lib/db/migrations") });
  client.close();
}
