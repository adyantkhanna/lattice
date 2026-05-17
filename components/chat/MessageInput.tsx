"use client";

import { SendHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  onSend: (text: string) => void;
  isLoading: boolean;
};

export default function MessageInput({ onSend, isLoading }: Props) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-border px-4 py-3 shrink-0">
      <div className="flex items-end gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2.5 focus-within:border-ring transition-colors">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            resize();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask a research question…"
          disabled={isLoading}
          rows={1}
          // biome-ignore lint/a11y/noAutofocus: intentional — chat input should receive focus on page load
          autoFocus
          className="flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none leading-relaxed"
          style={{ minHeight: "20px" }}
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          disabled={isLoading || !input.trim()}
          className="shrink-0 h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <SendHorizontal className="size-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-muted-foreground/60">
        Enter to send · Shift+Enter for new line
      </p>
    </form>
  );
}
