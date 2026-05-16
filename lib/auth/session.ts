import type { Session } from "./types";

const LOCAL_SESSION: Session = {
  user: { id: "local", name: "Local User", email: null },
};

/**
 * Returns the current session.
 * In local mode this always returns the stub session — no network call.
 * In multi mode this delegates to Auth.js (wired in Milestone 6).
 */
export async function getSession(): Promise<Session> {
  if ((process.env.AUTH_MODE ?? "local") === "local") {
    return LOCAL_SESSION;
  }
  // Multi-user mode: import dynamically to avoid pulling Auth.js into
  // local-mode bundles where providers/adapter aren't configured.
  const { auth } = await import("./auth");
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");
  return session as Session;
}
