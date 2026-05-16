"use client";

import type { UIMessage } from "ai";
import { PanelLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChatArea from "./ChatArea";
import Sidebar from "./Sidebar";

type Props = {
  conversationId: string;
  packName: string;
  initialMessages: UIMessage[];
};

export default function ChatLayout({ conversationId, packName, initialMessages }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden sm:block shrink-0 overflow-hidden border-r border-border transition-all duration-200",
          sidebarOpen ? "w-64" : "w-0",
        )}
      >
        <Sidebar currentConversationId={conversationId} />
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
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 border-r border-border bg-background sm:hidden",
          "transform transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar currentConversationId={conversationId} />
      </aside>

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
        <ChatArea conversationId={conversationId} initialMessages={initialMessages} />
      </div>
    </div>
  );
}
