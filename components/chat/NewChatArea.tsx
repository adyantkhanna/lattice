"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useMemo } from "react";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

type Props = {
  packSlug: string;
  onConversationCreated: (id: string) => void;
  onSourceClick?: (title: string, url: string) => void;
};

export default function NewChatArea({ packSlug, onConversationCreated, onSourceClick }: Props) {
  const transport = useMemo(() => {
    // Custom fetch intercepts X-Conversation-Id from the first response and
    // updates the browser URL without a full navigation, keeping the stream alive.
    const customFetch: typeof globalThis.fetch = async (url, init) => {
      const res = await globalThis.fetch(url as string, init as RequestInit);
      const convId = res.headers.get("x-conversation-id");
      if (convId) {
        window.history.replaceState(null, "", `/chat/${convId}`);
        onConversationCreated(convId);
      }
      return res;
    };

    return new TextStreamChatTransport({
      api: "/api/chat",
      body: { packSlug },
      fetch: customFetch,
    });
  }, [packSlug, onConversationCreated]);

  const { messages, sendMessage, status } = useChat({ transport });
  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <MessageList messages={messages} isLoading={isLoading} onSourceClick={onSourceClick} />
      <MessageInput onSend={(text) => sendMessage({ text })} isLoading={isLoading} />
    </div>
  );
}
