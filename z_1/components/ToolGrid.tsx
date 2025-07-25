"use client";
import { cn } from "@/lib/utils";
import { ToolCard } from "./ToolCard";
import type { Tool } from "../types";

interface ToolGridProps {
  tools: Tool[];
  onSelect: (id: string) => void;
  onFavorite?: (id: string) => void;
  onTagClick?: (tag: string) => void;
  isFavorite?: (id: string) => boolean;
  className?: string;
}

export function ToolGrid({
  tools,
  onSelect,
  onFavorite,
  onTagClick,
  isFavorite = () => false,
  className,
}: ToolGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 zeno-content-padding",
        className
      )}
    >
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          onSelect={onSelect}
          onFavorite={onFavorite}
          onTagClick={onTagClick}
          isFavorite={isFavorite(tool.id)}
          className="flex flex-col"
        />
      ))}
    </div>
  );
}
