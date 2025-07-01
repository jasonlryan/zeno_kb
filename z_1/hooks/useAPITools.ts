"use client"

import { useState, useEffect } from 'react';
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

  const featuredTools = tools.filter(tool => tool.featured).slice(0, 5);
  const recentTools = [...tools]
    .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime())
    .slice(0, 10);

  const getToolsByFunction = (functionName: string) => {
    return tools.filter(tool => tool.function === functionName);
  };

  const getToolsByCategory = (categoryId: string) => {
    // This would need category mapping logic
    return tools;
  };

  return {
    all: tools,
    featured: featuredTools,
    recent: recentTools,
    byFunction: getToolsByFunction,
    byCategory: getToolsByCategory,
    loading,
    error,
    count: tools.length
  };
} 