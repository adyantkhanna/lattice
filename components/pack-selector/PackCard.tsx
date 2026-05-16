"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopicPack } from "@/lib/pack-loader/types";

export default function PackCard({ pack }: { pack: TopicPack }) {
  const router = useRouter();

  const sourceCount = [
    ...(pack.sources?.rss ?? []),
    ...(pack.sources?.sites ?? []),
    ...(pack.sources?.arxiv_categories ?? []),
    ...(pack.sources?.youtube_channels ?? []),
    ...(pack.sources?.twitter_handles ?? []),
  ].length;

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
        <Button
          onClick={() => router.push(`/chat/new?pack=${pack.slug}`)}
          size="sm"
          className="w-full"
        >
          Start research
        </Button>
      </CardFooter>
    </Card>
  );
}
