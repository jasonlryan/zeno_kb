"use client";

import type React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./SidebarNav";
import { TopSearchBar } from "./TopSearchBar";
import { useConfig } from "../hooks/useConfig";
import type { SidebarSection } from "../types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import { useRouter } from "next/navigation";

interface AppShellProps {
  children: React.ReactNode;
  sidebarSections: SidebarSection[];
  onSearch: (query: string) => void;
  onNavigate?: (itemId: string) => void;
  className?: string;
  isFilterOpen?: boolean;
  onFilterToggle?: () => void;
}

export function AppShell({
  children,
  sidebarSections,
  onSearch,
  onNavigate,
  className,
  isFilterOpen,
  onFilterToggle,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { appConfig } = useConfig();
  const { user, signOut } = useSupabaseAuth();
  const router = useRouter();

  const handleNavigate = (itemId: string) => {
    console.log("Navigating to:", itemId);
    onNavigate?.(itemId);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 rounded-lg hover:bg-secondary transition-colors"
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
              <Image
                src="/zeno_logo-carre_720.png"
                alt="Zeno Logo"
                width={56}
                height={56}
                className="rounded"
              />
              <h1 className="zeno-heading text-card-foreground text-xl font-semibold">
                AI Knowledge
              </h1>
            </div>
            <div className="flex-1 max-w-2xl mx-8">
              <TopSearchBar onSubmit={onSearch} />
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  Welcome,{" "}
                  <span className="font-medium text-foreground">
                    {user.email?.split("@")[0] || user.email}
                  </span>
                </div>
                <Button onClick={handleSignOut} variant="secondary" size="sm">
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "sticky top-16 h-[calc(100vh-4rem)] bg-card border-r border-border transition-all duration-300",
            sidebarCollapsed ? "w-20" : "w-64"
          )}
        >
          <SidebarNav
            sections={sidebarSections}
            collapsed={sidebarCollapsed}
            onItemClick={handleNavigate}
            isFilterOpen={isFilterOpen}
            onFilterToggle={onFilterToggle}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
