"use client";

import type { UIMessage } from "ai";
import { useEffect, useRef } from "react";
import MessageBubble from "./Message";

type Props = {
  messages: UIMessage[];
  isLoading: boolean;
  onSourceClick?: (title: string, url: string) => void;
};

export default function MessageList({ messages, isLoading, onSourceClick }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: messages is the scroll trigger
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 max-w-3xl mx-auto w-full">
      {messages.length === 0 && !isLoading && (
        <div className="flex h-full items-center justify-center">
          <div className="text-center space-y-2">
            <p className="font-serif text-2xl font-light text-foreground/80">
              What do you want to understand?
            </p>
            <p className="text-sm text-muted-foreground">
              Ask a question — the more specific, the better.
            </p>
          </div>
        </div>
      )}
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} onSourceClick={onSourceClick} />
      ))}
      {isLoading && (
        <div className="flex gap-1 pl-1">
          <span className="size-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
          <span className="size-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
          <span className="size-2 rounded-full bg-muted-foreground animate-bounce" />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
