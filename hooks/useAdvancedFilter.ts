"use client";

import { useMemo } from "react";
import type { Tool, FilterState } from "../types";

export function useAdvancedFilter(
  tools: Tool[],
  searchQuery: string,
  filters: FilterState
) {
  return useMemo(() => {
    let filteredTools = tools;

    // Apply search query filter
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      filteredTools = filteredTools.filter(
        (tool) =>
          tool.title.toLowerCase().includes(searchTerm) ||
          tool.description.toLowerCase().includes(searchTerm) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
          tool.function.toLowerCase().includes(searchTerm)
      );
    }

    // Apply function filter
    if (filters.function !== "All") {
      filteredTools = filteredTools.filter(
        (tool) => tool.function === filters.function
      );
    }

    // Apply tier filter
    if (filters.tier !== "All") {
      filteredTools = filteredTools.filter(
        (tool) => tool.tier === filters.tier
      );
    }

    // Apply newness filter
    if (filters.newness === "New This Week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filteredTools = filteredTools.filter(
        (tool) => new Date(tool.date_added) >= oneWeekAgo
      );
    }

    return filteredTools;
  }, [tools, searchQuery, filters]);
}

// Hook to generate filter options from the data
export function useFilterOptions(tools: Tool[]) {
  return useMemo(() => {
    const uniqueFunctions = [
      "All",
      ...new Set(tools.map((tool) => tool.function)),
    ].filter(Boolean);

    const uniqueTiers = [
      "All", 
      ...new Set(tools.map((tool) => tool.tier))
    ].filter(Boolean);

    const uniqueNewness = ["All", "New This Week"];

    return {
      functions: uniqueFunctions,
      tiers: uniqueTiers,
      newness: uniqueNewness,
    };
  }, [tools]);
} 