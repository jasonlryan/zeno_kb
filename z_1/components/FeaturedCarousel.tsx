"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolCard } from "./ToolCard";
import type { Tool } from "../types";

interface FeaturedCarouselProps {
  tools: Tool[];
  onSelect: (id: string) => void;
  onFavorite?: (id: string) => void;
  onTagClick?: (tag: string) => void;
  isFavorite?: (id: string) => boolean;
  className?: string;
}

export function FeaturedCarousel({
  tools,
  onSelect,
  onFavorite,
  onTagClick,
  isFavorite = () => false,
  className,
}: FeaturedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of card + gap
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const featuredTools = tools.filter((tool) => tool.featured);

  if (featuredTools.length === 0) return null;

  return (
    <div
      className={cn(
        "relative border border-gray-200 dark:border-gray-700 rounded-lg zeno-content-padding",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="zeno-heading text-xl font-semibold text-foreground dark:text-white">
          Featured Tools
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-muted dark:hover:bg-gray-700 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-muted dark:hover:bg-gray-700 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex space-x-4 zeno-scroll-snap">
        {featuredTools.map((tool) => (
          <div key={tool.id} className="flex-none w-80 zeno-snap-item">
            <ToolCard
              tool={tool}
              onSelect={onSelect}
              onFavorite={onFavorite}
              onTagClick={onTagClick}
              isFavorite={isFavorite(tool.id)}
              className="min-h-[320px] flex flex-col"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
