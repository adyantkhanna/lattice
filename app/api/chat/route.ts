import type { UIMessage } from "ai";
import { getSession } from "@/lib/auth/session";
import { createConversation, touchConversation } from "@/lib/db/queries/conversations";
import { createMessage } from "@/lib/db/queries/messages";
import { upsertUser } from "@/lib/db/queries/users";
import { loadPackBySlug } from "@/lib/pack-loader/load";
import { generateId } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  const body = (await req.json()) as {
    messages: UIMessage[];
    conversationId?: string;
    packSlug?: string;
  };

  const { messages, packSlug } = body;
  let { conversationId } = body;

  const lastUserMessage = messages.findLast((m) => m.role === "user");
  if (!lastUserMessage) {
    return new Response("No user message", { status: 400 });
  }

  const userContent = lastUserMessage.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("");

  // Lazy conversation creation: if no conversationId, create one now using
  // the first 50 chars of the user's message as the title.
  if (!conversationId) {
    if (!packSlug) {
      return new Response("packSlug required when conversationId is absent", { status: 400 });
    }
    const pack = await loadPackBySlug(packSlug);
    if (!pack) {
      return new Response("Pack not found", { status: 404 });
    }
    await upsertUser({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    });
    const title = userContent.length > 50 ? `${userContent.slice(0, 50)}…` : userContent;
    const conv = await createConversation({
      id: generateId(),
      userId: session.user.id,
      topicPackSlug: packSlug,
      title,
    });
    conversationId = conv.id;
  }

  await createMessage({
    id: generateId(),
    conversationId,
    role: "user",
    content: userContent,
  });

  await touchConversation(conversationId);

  const stubText = `[M1 stub] You said: "${userContent}". The real agent (Milestone 2) will search curated sources and synthesise an answer here.`;

  await createMessage({
    id: generateId(),
    conversationId,
    role: "assistant",
    content: stubText,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const word of stubText.split(" ")) {
        controller.enqueue(encoder.encode(`${word} `));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Conversation-Id": conversationId,
    },
  });
}
