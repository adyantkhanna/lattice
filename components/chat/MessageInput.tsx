"use client";

import { SendHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  onSend: (text: string) => void;
  isLoading: boolean;
};

export default function MessageInput({ onSend, isLoading }: Props) {
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-4 shrink-0">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a research question…"
        disabled={isLoading}
        className="flex-1"
        autoFocus
      />
      <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
        <SendHorizontal className="size-4" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
