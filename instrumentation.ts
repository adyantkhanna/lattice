export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const authMode = process.env.AUTH_MODE ?? "local";
    if (authMode === "local") {
      const { runMigrations } = await import("./lib/db/migrate");
      await runMigrations();
    }
  }
}
