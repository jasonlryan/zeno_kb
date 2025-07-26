"use client";
import React, { useState } from "react";
import { Heart, ExternalLink, Save, StickyNote, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useComponentContent } from "../hooks/useConfig";
import { useAnalytics } from "../hooks/useAnalytics";
import type { Tool } from "../types";

interface LibraryToolCardProps {
  tool: Tool;
  note?: string;
  onFavorite?: (id: string) => void;
  onSelect?: (id: string) => void;
  onTagClick?: (tag: string) => void;
  onNoteUpdate?: (toolId: string, note: string) => Promise<void>;
  isFavorite?: boolean;
  className?: string;
}

export function LibraryToolCard({
  tool,
  note = "",
  onFavorite,
  onSelect,
  onTagClick,
  onNoteUpdate,
  isFavorite = false,
  className,
}: LibraryToolCardProps) {
  const [editedNote, setEditedNote] = useState(note);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [showNoteField, setShowNoteField] = useState(false);
  const hasNote = !!note && note.trim().length > 0;
  const { trackToolView, trackToolFavorite } = useAnalytics();

  const handleNoteSave = async () => {
    if (!onNoteUpdate) return;

    setIsSavingNote(true);
    try {
      await onNoteUpdate(tool.id, editedNote);
      setShowNoteField(false);
    } catch (error) {
      console.error("Error updating note:", error);
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600",
        tool.featured && "ring-2 ring-primary/30 border-primary/30",
        className
      )}
      onClick={() => {
        trackToolView(tool.id, tool.title);
        onSelect?.(tool.id);
      }}
    >
      <div className="flex flex-col h-full space-y-4">
        {/* Header with type and favorite */}
        <div className="flex items-start justify-between">
          <span
            className={cn(
              "zeno-type",
              `zeno-type-${tool.type.toLowerCase().replace(/\s+/g, "-")}`
            )}
          >
            {tool.type}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              trackToolFavorite(tool.id, tool.title);
              onFavorite?.(tool.id);
            }}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-400"
              }`}
              fill={isFavorite ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* Title */}
        <h3 className="zeno-heading-lg text-foreground dark:text-white leading-tight">
          {tool.title}
        </h3>

        {/* Short Description */}
        <p className="zeno-body text-muted-foreground dark:text-gray-400 leading-relaxed line-clamp-3">
          {tool.description || "No description available"}
        </p>

        {/* Note Section - Hidden by default, conditional button */}
        {showNoteField ? (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold text-blue-600">Note</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNoteSave();
                }}
                disabled={isSavingNote}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors ml-auto"
              >
                <Save className="w-3 h-3" />
                {isSavingNote ? "Saving..." : "Save"}
              </button>
            </div>
            <textarea
              value={editedNote}
              onChange={(e) => setEditedNote(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-foreground dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              onClick={(e) => e.stopPropagation()}
              disabled={isSavingNote}
              autoFocus
            />
          </div>
        ) : (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNoteField(true);
                setEditedNote(note); // always sync to latest
              }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              {hasNote ? (
                <>
                  <StickyNote className="w-4 h-4" />
                  Show Note
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Note
                </>
              )}
            </button>
          </div>
        )}

        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tool.tags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {tag}
              </button>
            ))}
            {tool.tags.length > 4 && (
              <span className="px-3 py-1 text-xs text-gray-500">
                +{tool.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* External Link */}
        {tool.url && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
            >
              Visit Tool
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
