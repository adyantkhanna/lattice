import type { UIMessage } from "ai";
import { orchestrate } from "@/lib/agent/orchestrator";
import { getSession } from "@/lib/auth/session";
import {
  createConversation,
  getConversationById,
  touchConversation,
} from "@/lib/db/queries/conversations";
import { createMessage } from "@/lib/db/queries/messages";
import { upsertUser } from "@/lib/db/queries/users";
import { loadPackBySlug } from "@/lib/pack-loader/load";
import type { SourceResult } from "@/lib/sources/types";
import { generateId } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * Builds a markdown references block from sources that were actually cited ([N]) in the text.
 * Only includes sources whose number appears in the response, keeping the list tight.
 */
function buildReferencesBlock(text: string, sources: SourceResult[]): string {
  const capped = sources.slice(0, 15);
  const cited = new Set<number>();
  for (const m of Array.from(text.matchAll(/\[(\d+)\]/g))) {
    const n = Number.parseInt(m[1], 10);
    if (n >= 1 && n <= capped.length) cited.add(n);
  }
  if (cited.size === 0) return "";

  const lines = Array.from(cited)
    .sort((a, b) => a - b)
    .map((n) => {
      const s = capped[n - 1];
      return `[${n}] [${s.title}](${s.url})`;
    });

  return `\n\n---\n\n**References**\n${lines.join("\n")}`;
}

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

  // UIMessage.parts (AI SDK v6) may not be present when caller sends plain content
  const userContent =
    lastUserMessage.parts
      ?.filter((p) => p.type === "text")
      .map((p) => (p as { type: "text"; text: string }).text)
      .join("") ??
    (lastUserMessage as unknown as { content?: string }).content ??
    "";

  // Lazy conversation creation: first message creates the conversation.
  if (!conversationId) {
    if (!packSlug) {
      return new Response("packSlug required when conversationId is absent", { status: 400 });
    }
    const newPack = await loadPackBySlug(packSlug);
    if (!newPack) return new Response("Pack not found", { status: 404 });

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

  // Save user message
  await createMessage({
    id: generateId(),
    conversationId,
    role: "user",
    content: userContent,
  });
  await touchConversation(conversationId);

  // Resolve the pack for this conversation
  const conversation = await getConversationById(conversationId);
  const pack = conversation ? await loadPackBySlug(conversation.topicPackSlug) : null;

  if (!pack) {
    return new Response("Pack not found for conversation", { status: 404 });
  }

  // Run the agent
  const { textStream, sources } = await orchestrate(userContent, pack);

  // Stream response to client while collecting the full text for DB persistence
  let collectedText = "";
  const encoder = new TextEncoder();

  const responseStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of textStream) {
          collectedText += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
        // Append numbered references for every source the model cited
        const refs = buildReferencesBlock(collectedText, sources);
        if (refs) {
          collectedText += refs;
          controller.enqueue(encoder.encode(refs));
        }
      } catch (e) {
        console.error("[chat] stream error:", e);
        const errMsg = "\n\n[Error generating response — please try again.]";
        collectedText += errMsg;
        controller.enqueue(encoder.encode(errMsg));
      } finally {
        controller.close();
        // Persist the complete assistant response after the stream ends
        createMessage({
          id: generateId(),
          conversationId: conversationId as string,
          role: "assistant",
          content: collectedText,
        }).catch((e) => console.error("[chat] failed to persist assistant message:", e));

        if (sources.length > 0) {
          console.info(`[chat] used ${sources.length} sources for "${userContent.slice(0, 40)}"`);
        }
      }
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Conversation-Id": conversationId as string,
    },
  });
}
