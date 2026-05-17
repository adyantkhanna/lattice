"use client";

import { ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Source = { title: string; url: string };

type Props = {
  source: Source | null;
  onClose: () => void;
};

export default function SourcePreview({ source, onClose }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!source) {
      setContent(null);
      return;
    }
    setLoading(true);
    fetch(`/api/sources/preview?url=${encodeURIComponent(source.url)}`)
      .then((r) => r.json())
      .then((d: { content: string | null }) => setContent(d.content))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [source]);

  if (!source) return null;

  return (
    <aside className="hidden lg:flex flex-col shrink-0 w-80 border-l border-border bg-background overflow-hidden">
      <div className="flex items-start gap-2 border-b border-border px-4 py-3 shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
            {source.title}
          </p>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors truncate"
          >
            <ExternalLink className="size-3 shrink-0" />
            <span className="truncate">{new URL(source.url).hostname}</span>
          </a>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="shrink-0 h-6 w-6 text-muted-foreground hover:text-foreground -mr-1"
          aria-label="Close preview"
        >
          <X className="size-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && (
          <div className="flex gap-1 pt-2">
            <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
            <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
            <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" />
          </div>
        )}
        {!loading && content && (
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono">
            {content}
          </p>
        )}
        {!loading && !content && (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Source content not cached. Visit the original page to read it.
            </p>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="size-3" />
              Open source
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}
