"use client"

import { useMemo } from "react"
import type { Tool } from "../types"

export function useLocalSearch(tools: Tool[], query: string) {
  return useMemo(() => {
    if (!query.trim()) return tools

    const searchTerm = query.toLowerCase()
    return tools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(searchTerm) ||
        (tool.description && tool.description.toLowerCase().includes(searchTerm)) ||
        (Array.isArray(tool.tags) && tool.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
    )
  }, [tools, query])
}
