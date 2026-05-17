"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { TextStreamChatTransport } from "ai";
import { useMemo } from "react";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

type Props = {
  conversationId: string;
  initialMessages: UIMessage[];
  onSourceClick?: (title: string, url: string) => void;
};

export default function ChatArea({ conversationId, initialMessages, onSourceClick }: Props) {
  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: "/api/chat",
        body: { conversationId },
      }),
    [conversationId],
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: initialMessages,
  });

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <MessageList messages={messages} isLoading={isLoading} onSourceClick={onSourceClick} />
      <MessageInput onSend={(text) => sendMessage({ text })} isLoading={isLoading} />
    </div>
  );
}
