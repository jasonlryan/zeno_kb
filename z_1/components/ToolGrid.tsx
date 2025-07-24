"use client";
import { cn } from "@/lib/utils";
import TemplateAwareToolCard from "./TemplateAwareToolCard";
import type { Tool } from "../types";

interface ToolGridProps {
  tools: Tool[];
  onSelect: (id: string) => void;
  onBookmark?: (id: string) => void;
  onTagClick?: (tag: string) => void;
  bookmarkedIds?: Set<string>;
  className?: string;
}

export function ToolGrid({
  tools,
  onSelect,
  onBookmark,
  onTagClick,
  bookmarkedIds = new Set(),
  className,
}: ToolGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        className
      )}
    >
      {tools.map((tool) => (
        <TemplateAwareToolCard
          key={tool.id}
          tool={tool}
          onSelect={onSelect}
          onTagClick={onTagClick}
          className="h-64 flex flex-col"
        />
      ))}
    </div>
  );
}
