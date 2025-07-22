"use client";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useComponentContent } from "../hooks/useConfig";
import type { Tool } from "../types";

interface ToolCardProps {
  tool: Tool;
  onBookmark?: (id: string) => void;
  onSelect?: (id: string) => void;
  bookmarked?: boolean;
  className?: string;
}

export function ToolCard({
  tool,
  onBookmark,
  onSelect,
  bookmarked = false,
  className,
}: ToolCardProps) {
  const content = useComponentContent("toolCard") as any;

  const getTypeColor = (type: Tool["type"]) => {
    switch (type) {
      case "GPT":
        return "bg-primary/10 text-primary border-primary/20";
      case "Doc":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Script":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Video":
        return "bg-orange-50 text-orange-700 border-orange-200";
    }
  };

  const getTierColor = (tier: Tool["tier"]) => {
    return tier === "Foundation"
      ? "bg-secondary text-secondary-foreground border-border"
      : "bg-primary/5 text-primary border-primary/30";
  };

  const getComplexityColor = (complexity: Tool["complexity"]) => {
    switch (complexity) {
      case "Beginner":
        return "bg-green-50 text-green-700 border-green-200";
      case "Intermediate":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Advanced":
        return "bg-red-50 text-red-700 border-red-200";
    }
  };

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg zeno-content-padding cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
        tool.featured && "ring-2 ring-primary/30 border-primary/30",
        className
      )}
      onClick={() => onSelect?.(tool.id)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border",
              getTypeColor(tool.type)
            )}
          >
            {tool.type}
          </span>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border",
              getTierColor(tool.tier)
            )}
          >
            {tool.tier}
          </span>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border",
              getComplexityColor(tool.complexity)
            )}
          >
            {tool.complexity}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark?.(tool.id);
          }}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label={
            bookmarked ? content.actions.unsave : content.actions.save
          }
        >
          {bookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-primary" />
          ) : (
            <Bookmark className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      <h3 className="zeno-heading text-lg text-card-foreground mb-3 line-clamp-2">
        {tool.title}
      </h3>

      <p className="zeno-body text-muted-foreground mb-4 line-clamp-3">
        {tool.description}
      </p>

      {/* Tags section - only show if tags is an array and has items */}
      {Array.isArray(tool.tags) && tool.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tool.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            >
              {tag}
            </span>
          ))}
          {tool.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{tool.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Demo component
export function ToolCardDemo() {
  const sampleTool: Tool = {
    id: "1",
    title: "GPT-4 Code Assistant",
    description:
      "Advanced AI assistant for code generation, debugging, and optimization. Supports multiple programming languages and frameworks.",
    type: "GPT",
    tier: "Specialist",
    complexity: "Intermediate",
    tags: ["coding", "ai", "debugging", "optimization"],
    featured: true,
    function: "Content & Creative",
    link: "https://chat.openai.com/g/code-assistant",
    date_added: "2024-01-15T10:00:00Z",
    added_by: "curator-1",
    scheduled_feature_date: undefined,
  };

  return (
    <div className="max-w-sm">
      <ToolCard
        tool={sampleTool}
        onBookmark={(id) => console.log("Bookmarked:", id)}
        onSelect={(id) => console.log("Selected:", id)}
      />
    </div>
  );
}
