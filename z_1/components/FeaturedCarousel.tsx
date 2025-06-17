"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ToolCard } from "./ToolCard"
import type { Tool } from "../types"

interface FeaturedCarouselProps {
  tools: Tool[]
  onSelect: (id: string) => void
  onBookmark?: (id: string) => void
  bookmarkedIds?: Set<string>
  className?: string
}

export function FeaturedCarousel({
  tools,
  onSelect,
  onBookmark,
  bookmarkedIds = new Set(),
  className,
}: FeaturedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320 // Width of card + gap
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const featuredTools = tools.filter((tool) => tool.featured)

  if (featuredTools.length === 0) return null

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Featured Tools</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {featuredTools.map((tool) => (
          <div key={tool.id} className="flex-none w-80 snap-start">
            <ToolCard tool={tool} onSelect={onSelect} onBookmark={onBookmark} bookmarked={bookmarkedIds.has(tool.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}
