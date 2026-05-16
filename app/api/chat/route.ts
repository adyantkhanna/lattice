import type { UIMessage } from "ai";
import { getSession } from "@/lib/auth/session";
import { touchConversation } from "@/lib/db/queries/conversations";
import { createMessage } from "@/lib/db/queries/messages";
import { generateId } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await getSession();
  const body = (await req.json()) as {
    messages: UIMessage[];
    conversationId: string;
  };

  const { messages, conversationId } = body;

  const lastUserMessage = messages.findLast((m) => m.role === "user");
  if (!lastUserMessage) {
    return new Response("No user message", { status: 400 });
  }

  const userContent = lastUserMessage.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("");

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

  // TextStreamChatTransport reads plain text chunks directly.
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
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
