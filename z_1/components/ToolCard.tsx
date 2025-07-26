"use client";
import React from "react";
import { Heart, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useComponentContent } from "../hooks/useConfig";
import { useAnalytics } from "../hooks/useAnalytics";
import type { Tool } from "../types";

interface ToolCardProps {
  tool: Tool;
  onFavorite?: (id: string) => void;
  onSelect?: (id: string) => void;
  onTagClick?: (tag: string) => void;
  isFavorite?: boolean;
  className?: string;
}

export function ToolCard({
  tool,
  onFavorite,
  onSelect,
  onTagClick,
  isFavorite = false,
  className,
}: ToolCardProps) {
  const content = useComponentContent("toolCard") as any;
  const { trackToolView, trackToolFavorite } = useAnalytics();

  // Provide fallback content if content is null or loading
  const safeContent = content || {
    labels: {
      tier: "Tier:",
      complexity: "Complexity:",
      type: "Type:",
    },
    actions: {
      view: "View Details",
      save: "Save",
      unsave: "Unsave",
    },
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
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 min-h-[280px]",
        tool.featured && "ring-2 ring-primary/30 border-primary/30",
        className
      )}
      onClick={() => {
        trackToolView(tool.id, tool.title);
        onSelect?.(tool.id);
      }}
    >
      <div className="flex flex-col h-full">
        {/* Header with type and favorite */}
        <div className="flex items-start justify-between mb-3">
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
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-400"
              }`}
              fill={isFavorite ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* Title */}
        <h3 className="zeno-heading-md text-foreground dark:text-white mb-2 line-clamp-2 leading-tight">
          {tool.title}
        </h3>

        {/* Short Description */}
        <p className="zeno-text-sm text-muted-foreground dark:text-gray-300 mb-3 line-clamp-2 flex-grow leading-relaxed">
          {tool.shortDescription ||
            (tool.description
              ? tool.description.split(".")[0] + "."
              : "No description available")}
        </p>

        {/* Metadata badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              getTierColor(tool.tier)
            )}
          >
            {tool.tier}
          </span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              getComplexityColor(tool.complexity)
            )}
          >
            {tool.complexity}
          </span>
        </div>

        {/* Tags */}
        {Array.isArray(tool.tags) && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tool.tags.slice(0, 3).map((tag, index) => (
              <button
                key={index}
                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-foreground dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
              >
                {tag}
              </button>
            ))}
            {tool.tags.length > 3 && (
              <span className="text-xs text-muted-foreground dark:text-gray-400 px-1">
                +{tool.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
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
    url: "",
    categories: ["AI Tools"],
  };

  return (
    <div className="max-w-sm">
      <ToolCard
        tool={sampleTool}
        onFavorite={(id: string) => console.log("Favorited:", id)}
        onSelect={(id: string) => console.log("Selected:", id)}
      />
    </div>
  );
}
