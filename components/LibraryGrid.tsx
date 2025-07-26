"use client";
import { cn } from "@/lib/utils";
import { LibraryToolCard } from "./LibraryToolCard";
import type { Tool } from "../types";

interface LibraryGridProps {
  tools: Tool[];
  favorites: Array<{ tool_id: string; note?: string }>;
  onSelect: (id: string) => void;
  onFavorite?: (id: string) => void;
  onTagClick?: (tag: string) => void;
  onNoteUpdate?: (toolId: string, note: string) => Promise<void>;
  isFavorite?: (id: string) => boolean;
  className?: string;
}

export function LibraryGrid({
  tools,
  favorites,
  onSelect,
  onFavorite,
  onTagClick,
  onNoteUpdate,
  isFavorite = () => false,
  className,
}: LibraryGridProps) {
  // Create a map of tool_id to note for quick lookup
  const noteMap = new Map(
    favorites.map((fav) => [fav.tool_id, fav.note || ""])
  );

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 zeno-content-padding",
        className
      )}
    >
      {tools.map((tool) => (
        <LibraryToolCard
          key={tool.id}
          tool={tool}
          note={noteMap.get(tool.id) || ""}
          onSelect={onSelect}
          onFavorite={onFavorite}
          onTagClick={onTagClick}
          onNoteUpdate={onNoteUpdate}
          isFavorite={isFavorite(tool.id)}
          className="flex flex-col"
        />
      ))}
    </div>
  );
}
