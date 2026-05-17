"use client";

import { useRouter } from "next/navigation";
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
    <button
      type="button"
      onClick={() => router.push(`/chat/new?pack=${pack.slug}`)}
      className="group text-left w-full rounded-xl border border-border bg-card px-6 py-5
        hover:border-white/10 hover:bg-white/[0.03]
        transition-all duration-150
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-semibold text-sm text-foreground leading-snug">{pack.name}</h2>
        <span className="text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors shrink-0 text-base leading-none mt-0.5">
          ↗
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-4">
        {pack.description}
      </p>
      {sourceCount > 0 && (
        <p className="mt-5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40">
          {sourceCount} curated sources
        </p>
      )}
    </button>
  );
}
