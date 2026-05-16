import { eq } from "drizzle-orm";
import { db } from "../client";
import { type NewUser, type User, users } from "../schema";

export async function getUserById(id: string): Promise<User | undefined> {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

export async function upsertUser(data: NewUser): Promise<User> {
  await db
    .insert(users)
    .values(data)
    .onConflictDoUpdate({ target: users.id, set: { name: data.name, email: data.email } });
  return db.query.users.findFirst({ where: eq(users.id, data.id) }) as Promise<User>;
}

export async function updateExpertiseProfile(
  id: string,
  profile: Record<string, unknown>,
): Promise<void> {
  await db.update(users).set({ expertiseProfile: profile }).where(eq(users.id, id));
}
