import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { updateNodeStatus } from "@/lib/db/queries/knowledge-nodes";
import type { KnowledgeNode } from "@/lib/db/schema";

const VALID_STATUSES: KnowledgeNode["status"][] = ["unread", "learning", "known"];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await getSession(); // ensures auth check even in local mode
  const body = (await req.json()) as { status?: string };
  const status = body.status as KnowledgeNode["status"] | undefined;

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await updateNodeStatus(params.id, status);
  return NextResponse.json({ ok: true });
}
