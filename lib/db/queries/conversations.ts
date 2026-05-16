import { desc, eq } from "drizzle-orm";
import { db } from "../client";
import { type Conversation, conversations, type NewConversation } from "../schema";

export async function getConversationsByUser(userId: string): Promise<Conversation[]> {
  return db.query.conversations.findMany({
    where: eq(conversations.userId, userId),
    orderBy: [desc(conversations.updatedAt)],
  });
}

export async function getConversationById(id: string): Promise<Conversation | undefined> {
  return db.query.conversations.findFirst({ where: eq(conversations.id, id) });
}

export async function createConversation(data: NewConversation): Promise<Conversation> {
  await db.insert(conversations).values(data);
  return db.query.conversations.findFirst({
    where: eq(conversations.id, data.id),
  }) as Promise<Conversation>;
}

export async function touchConversation(id: string): Promise<void> {
  await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, id));
}
