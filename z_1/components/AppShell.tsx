"use client";

import type React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./SidebarNav";
import { TopSearchBar } from "./TopSearchBar";
import type { SidebarSection } from "../types";

interface AppShellProps {
  children: React.ReactNode;
  sidebarSections: SidebarSection[];
  onSearch: (query: string) => void;
  onNavigate?: (itemId: string) => void;
  className?: string;
}

export function AppShell({
  children,
  sidebarSections,
  onSearch,
  onNavigate,
  className,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNavigate = (itemId: string) => {
    console.log("Navigating to:", itemId);
    onNavigate?.(itemId);
  };

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="zeno-heading text-card-foreground">Zeno Knows</h1>
            </div>
            <div className="flex-1 max-w-2xl mx-8">
              <TopSearchBar onSubmit={onSearch} />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "sticky top-16 h-[calc(100vh-4rem)] bg-card border-r border-border transition-all duration-300",
            sidebarCollapsed ? "w-16" : "w-64"
          )}
        >
          <SidebarNav
            sections={sidebarSections}
            collapsed={sidebarCollapsed}
            onItemClick={handleNavigate}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 zeno-content-padding">{children}</main>
      </div>
    </div>
  );
}
