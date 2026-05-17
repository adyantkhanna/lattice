import type { UIMessage } from "ai";
import { notFound } from "next/navigation";
import ChatLayout from "@/components/chat/ChatLayout";
import { getSession } from "@/lib/auth/session";
import { getConversationById } from "@/lib/db/queries/conversations";
import { getMessagesByConversation } from "@/lib/db/queries/messages";
import { loadPackBySlug } from "@/lib/pack-loader/load";

export default async function ChatPage({ params }: { params: { conversationId: string } }) {
  const session = await getSession();
  const conversation = await getConversationById(params.conversationId);

  if (!conversation || conversation.userId !== session.user.id) {
    notFound();
  }

  const pack = await loadPackBySlug(conversation.topicPackSlug);
  if (!pack) notFound();

  const dbMessages = await getMessagesByConversation(params.conversationId);
  const initialMessages: UIMessage[] = dbMessages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    parts: [{ type: "text" as const, text: m.content }],
    metadata: {},
  }));

  return (
    <ChatLayout
      conversationId={params.conversationId}
      packSlug={pack.slug}
      packName={pack.name}
      initialMessages={initialMessages}
    />
  );
}
