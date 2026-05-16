import { asc, eq } from "drizzle-orm";
import { db } from "../client";
import { type Message, messages, type NewMessage } from "../schema";

export async function getMessagesByConversation(conversationId: string): Promise<Message[]> {
  return db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: [asc(messages.createdAt)],
  });
}

export async function createMessage(data: NewMessage): Promise<Message> {
  await db.insert(messages).values(data);
  return db.query.messages.findFirst({
    where: eq(messages.id, data.id),
  }) as Promise<Message>;
}
