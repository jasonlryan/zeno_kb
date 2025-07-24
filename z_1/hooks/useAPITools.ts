"use client"

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Tool } from '../types';

export function useAPITools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/knowledge-base');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTools(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setTools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  // Memoize computed values to prevent unnecessary re-renders
  const featuredTools = useMemo(() => 
    tools.filter(tool => tool.featured).slice(0, 5), 
    [tools]
  );
  
  const recentTools = useMemo(() => 
    [...tools]
      .filter(tool => tool.date_added) // Only include tools with dates
      .sort((a, b) => new Date(b.date_added!).getTime() - new Date(a.date_added!).getTime())
      .slice(0, 10),
    [tools]
  );

  // Memoize callback functions to prevent Fast Refresh issues
  const getToolsByFunction = useCallback((functionName: string) => {
    return tools.filter(tool => tool.function === functionName);
  }, [tools]);

  const getToolsByCategory = useCallback((categoryId: string) => {
    // This would need category mapping logic
    return tools;
  }, [tools]);

  return useMemo(() => ({
    all: tools,
    featured: featuredTools,
    recent: recentTools,
    byFunction: getToolsByFunction,
    byCategory: getToolsByCategory,
    loading,
    error,
    count: tools.length
  }), [tools, featuredTools, recentTools, getToolsByFunction, getToolsByCategory, loading, error]);
} 