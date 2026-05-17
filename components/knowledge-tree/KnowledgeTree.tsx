"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type NodeStatus = "unread" | "learning" | "known";

type KnowledgeNode = {
  id: string;
  title: string;
  summary: string;
  sources: string[] | null;
  status: NodeStatus;
};

const STATUS_CYCLE: NodeStatus[] = ["unread", "learning", "known"];

const STATUS_LABEL: Record<NodeStatus, string> = {
  unread: "New",
  learning: "Learning",
  known: "Known",
};

const STATUS_CLASS: Record<NodeStatus, string> = {
  unread: "bg-muted text-muted-foreground",
  learning: "bg-yellow-500/20 text-yellow-400",
  known: "bg-green-500/20 text-green-400",
};

function nextStatus(current: NodeStatus): NodeStatus {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

function NodeItem({
  node,
  onStatusChange,
}: {
  node: KnowledgeNode;
  onStatusChange: (id: string, status: NodeStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-start gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex-1 text-left text-xs font-medium text-foreground leading-snug pt-0.5"
        >
          <span className="mr-1 text-muted-foreground">{expanded ? "▾" : "▸"}</span>
          {node.title}
        </button>
        <button
          type="button"
          onClick={() => onStatusChange(node.id, nextStatus(node.status))}
          className={cn(
            "shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors",
            STATUS_CLASS[node.status],
          )}
          title="Click to cycle status"
        >
          {STATUS_LABEL[node.status]}
        </button>
      </div>
      {expanded && (
        <div className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed border-t border-border pt-2">
          <p>{node.summary}</p>
          {node.sources && node.sources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {node.sources.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline underline-offset-2 hover:text-blue-300 truncate max-w-[180px]"
                >
                  {url.replace(/^https?:\/\//, "").split("/")[0]}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type Props = {
  packSlug: string;
  // Increment this to trigger a refetch (e.g. after a new message)
  refreshKey?: number;
};

export default function KnowledgeTree({ packSlug, refreshKey = 0 }: Props) {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNodes = useCallback(async () => {
    try {
      const res = await fetch(`/api/packs/${packSlug}/nodes`);
      if (res.ok) {
        const data = (await res.json()) as KnowledgeNode[];
        setNodes(data);
      }
    } catch {
      // Silently ignore fetch errors — tree is non-critical
    } finally {
      setLoading(false);
    }
  }, [packSlug]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey triggers refetch
  useEffect(() => {
    setLoading(true);
    fetchNodes();
  }, [fetchNodes, refreshKey]);

  const handleStatusChange = useCallback(
    async (id: string, status: NodeStatus) => {
      // Optimistic update
      setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, status } : n)));
      try {
        await fetch(`/api/nodes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
      } catch {
        // Revert on failure by refetching
        fetchNodes();
      }
    },
    [fetchNodes],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24 text-muted-foreground text-xs">
        Loading…
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 px-4 text-center">
        <p className="text-muted-foreground text-xs">
          Ask questions to start building your knowledge tree.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      {nodes.map((node) => (
        <NodeItem key={node.id} node={node} onStatusChange={handleStatusChange} />
      ))}
    </div>
  );
}
