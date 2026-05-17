import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { type KnowledgeNode, knowledgeNodes, type NewKnowledgeNode } from "../schema";

export async function getKnowledgeNodesByUserAndPack(
  userId: string,
  topicPackSlug: string,
): Promise<KnowledgeNode[]> {
  return db.query.knowledgeNodes.findMany({
    where: and(eq(knowledgeNodes.userId, userId), eq(knowledgeNodes.topicPackSlug, topicPackSlug)),
  });
}

export async function createKnowledgeNode(data: NewKnowledgeNode): Promise<KnowledgeNode> {
  await db.insert(knowledgeNodes).values(data);
  return db.query.knowledgeNodes.findFirst({
    where: eq(knowledgeNodes.id, data.id),
  }) as Promise<KnowledgeNode>;
}

export async function updateNodeStatus(id: string, status: KnowledgeNode["status"]): Promise<void> {
  await db.update(knowledgeNodes).set({ status }).where(eq(knowledgeNodes.id, id));
}

/**
 * Inserts a knowledge node only if no node with the same title already exists
 * for this user + pack. Prevents duplicate concepts from accumulating.
 */
export async function upsertKnowledgeNode(data: NewKnowledgeNode): Promise<void> {
  const existing = await db.query.knowledgeNodes.findFirst({
    where: and(
      eq(knowledgeNodes.userId, data.userId),
      eq(knowledgeNodes.topicPackSlug, data.topicPackSlug),
      eq(knowledgeNodes.title, data.title),
    ),
  });
  if (existing) return;
  try {
    await db.insert(knowledgeNodes).values(data);
  } catch {
    // Race condition — another concurrent request inserted first; ignore
  }
}
