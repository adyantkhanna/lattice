import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getConversationById } from "@/lib/db/queries/conversations";
import { getMessagesByConversation } from "@/lib/db/queries/messages";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  const conversation = await getConversationById(params.id);

  if (!conversation || conversation.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await getMessagesByConversation(params.id);
  return NextResponse.json(messages);
}
