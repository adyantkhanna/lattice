import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createConversation, getConversationsByUser } from "@/lib/db/queries/conversations";
import { upsertUser } from "@/lib/db/queries/users";
import { loadPackBySlug } from "@/lib/pack-loader/load";
import { generateId } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  const conversations = await getConversationsByUser(session.user.id);
  return NextResponse.json(conversations);
}

export async function POST(req: Request) {
  const session = await getSession();
  const { topicPackSlug } = (await req.json()) as { topicPackSlug: string };

  const pack = await loadPackBySlug(topicPackSlug);
  if (!pack) {
    return NextResponse.json({ error: "Pack not found" }, { status: 404 });
  }

  await upsertUser({ id: session.user.id, name: session.user.name, email: session.user.email });

  const conversation = await createConversation({
    id: generateId(),
    userId: session.user.id,
    topicPackSlug,
    title: `${pack.name} — ${new Date().toLocaleDateString()}`,
  });

  return NextResponse.json(conversation, { status: 201 });
}
