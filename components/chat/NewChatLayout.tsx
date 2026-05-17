"use client";

import { PanelLeft } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NewChatArea from "./NewChatArea";
import Sidebar from "./Sidebar";

type Props = {
  packSlug: string;
  packName: string;
};

export default function NewChatLayout({ packSlug, packName }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Tracks the conversation ID after the first message creates it, so the
  // sidebar can highlight and re-fetch the new entry.
  const [currentConversationId, setCurrentConversationId] = useState("new");

  const handleConversationCreated = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden sm:block shrink-0 overflow-hidden border-r border-border transition-all duration-200",
          sidebarOpen ? "w-64" : "w-0",
        )}
      >
        <Sidebar currentConversationId={currentConversationId} />
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

      {/* Mobile sidebar — only mount when open to avoid duplicate /api/conversations fetches */}
      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 z-30 w-64 border-r border-border bg-background sm:hidden">
          <Sidebar currentConversationId={currentConversationId} />
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
