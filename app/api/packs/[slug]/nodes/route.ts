import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getKnowledgeNodesByUserAndPack } from "@/lib/db/queries/knowledge-nodes";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const session = await getSession();
  const nodes = await getKnowledgeNodesByUserAndPack(session.user.id, params.slug);
  return NextResponse.json(nodes);
}
