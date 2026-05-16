"use client";

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
        <Link href="/" className="text-sm font-semibold hover:opacity-75 transition-opacity">
          Lattice
        </Link>
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          + New
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        {Object.entries(groups).map(([slug, convs]) => (
          <div key={slug}>
            <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">
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
    </div>
  );
}
