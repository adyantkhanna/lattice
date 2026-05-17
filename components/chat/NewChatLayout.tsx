"use client";

import { PanelLeft } from "lucide-react";
import { useCallback, useState } from "react";
import KnowledgeTree from "@/components/knowledge-tree/KnowledgeTree";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NewChatArea from "./NewChatArea";
import Sidebar from "./Sidebar";

type Props = {
  packSlug: string;
  packName: string;
};

type SidebarTab = "history" | "knowledge";

export default function NewChatLayout({ packSlug, packName }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<SidebarTab>("history");
  const [currentConversationId, setCurrentConversationId] = useState("new");
  // Incremented after a conversation is created to prompt the tree to refetch
  const [treeRefreshKey, setTreeRefreshKey] = useState(0);

  const handleConversationCreated = useCallback((id: string) => {
    setCurrentConversationId(id);
    setTreeRefreshKey((k) => k + 1);
  }, []);

  const tabHeader = (
    <div className="flex shrink-0 border-b border-border">
      <button
        type="button"
        onClick={() => setActiveTab("history")}
        className={cn(
          "flex-1 py-2 text-xs font-medium transition-colors",
          activeTab === "history"
            ? "text-foreground border-b-2 border-primary -mb-px"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        History
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("knowledge")}
        className={cn(
          "flex-1 py-2 text-xs font-medium transition-colors",
          activeTab === "knowledge"
            ? "text-foreground border-b-2 border-primary -mb-px"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Knowledge
      </button>
    </div>
  );

  const tabContent =
    activeTab === "history" ? (
      <Sidebar currentConversationId={currentConversationId} />
    ) : (
      <KnowledgeTree packSlug={packSlug} refreshKey={treeRefreshKey} />
    );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden sm:flex flex-col shrink-0 overflow-hidden border-r border-border transition-all duration-200",
          sidebarOpen ? "w-64" : "w-0",
        )}
      >
        {tabHeader}
        <div className="flex-1 overflow-y-auto">{tabContent}</div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-20 bg-black/50 sm:hidden cursor-default"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 z-30 flex flex-col w-64 border-r border-border bg-background sm:hidden">
          {tabHeader}
          <div className="flex-1 overflow-y-auto">{tabContent}</div>
        </aside>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center gap-2 border-b border-border px-4 py-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="size-4" />
          </Button>
          <h1 className="text-sm font-medium truncate">{packName}</h1>
        </header>
        <NewChatArea packSlug={packSlug} onConversationCreated={handleConversationCreated} />
      </div>
    </div>
  );
}
