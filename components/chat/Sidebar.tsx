"use client";

import { Settings, SquarePen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Conversation } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type Props = {
  currentConversationId: string;
};

export default function Sidebar({ currentConversationId }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Re-fetch when navigating between conversations so the list stays current.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional refetch trigger
  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data: Conversation[]) => setConversations(data))
      .catch(console.error);
  }, [currentConversationId]);

  const groups = conversations.reduce<Record<string, Conversation[]>>((acc, c) => {
    const group = acc[c.topicPackSlug] ?? [];
    group.push(c);
    acc[c.topicPackSlug] = group;
    return acc;
  }, {});

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
        <Link
          href="/"
          className="font-serif text-base font-light tracking-tight hover:opacity-70 transition-opacity"
        >
          Lattice
        </Link>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
          title="New research"
        >
          <SquarePen className="size-4" />
          <span className="sr-only">New research</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-4 pb-0">
        {Object.entries(groups).map(([slug, convs]) => (
          <div key={slug}>
            <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 truncate">
              {slug.replace(/-/g, " ")}
            </p>
            <ul className="space-y-0.5">
              {convs.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/chat/${c.id}`}
                    className={cn(
                      "block rounded-md px-2 py-1.5 text-sm truncate transition-colors hover:bg-muted",
                      c.id === currentConversationId
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {conversations.length === 0 && (
          <p className="px-2 text-xs text-muted-foreground">No conversations yet.</p>
        )}
      </nav>
      <div className="shrink-0 border-t border-border p-2">
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="size-3.5" />
          Settings
        </Link>
      </div>
    </div>
  );
}
