"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopicPack } from "@/lib/pack-loader/types";

export default function PackCard({ pack }: { pack: TopicPack }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const sourceCount = [
    ...(pack.sources?.rss ?? []),
    ...(pack.sources?.sites ?? []),
    ...(pack.sources?.arxiv_categories ?? []),
    ...(pack.sources?.youtube_channels ?? []),
    ...(pack.sources?.twitter_handles ?? []),
  ].length;

  async function startConversation() {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicPackSlug: pack.slug }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      const data = (await res.json()) as { id: string };
      router.push(`/chat/${data.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <Card className="hover:ring-primary/40 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{pack.name}</CardTitle>
          {sourceCount > 0 && <Badge variant="secondary">{sourceCount} sources</Badge>}
        </div>
        <CardDescription>{pack.description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={startConversation} disabled={loading} size="sm" className="w-full">
          {loading ? "Starting…" : "Start research"}
        </Button>
      </CardFooter>
    </Card>
  );
}
