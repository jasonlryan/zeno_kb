import { useState, useEffect, useMemo } from 'react';
import { Tool } from '@/types';
import { taxonomyManager, FilterState } from '@/lib/taxonomyManager';

export function useTaxonomy(tools: Tool[] = []) {
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    tiers: [],
    complexity: [],
    functions: [],
    functionGroups: [],
    tags: [],
    featured: null,
    searchTerm: ''
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initTaxonomy = async () => {
      await taxonomyManager.loadTaxonomy();
      setIsLoading(false);
    };
    initTaxonomy();
  }, []);

  // Get filter options based on actual data
  const filterOptions = useMemo(() => {
    if (isLoading || !tools.length) return null;
    return taxonomyManager.getFilterOptions(tools);
  }, [tools, isLoading]);

  // Apply filters to tools
  const filteredTools = useMemo(() => {
    if (isLoading || !tools.length) return tools;
    return taxonomyManager.applyFilters(tools, filters);
  }, [tools, filters, isLoading]);

  // Update individual filter
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Toggle filter value (for multi-select filters)
  const toggleFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const currentValues = prev[key] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [key]: newValues
      };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      types: [],
      tiers: [],
      complexity: [],
      functions: [],
      functionGroups: [],
      tags: [],
      featured: null,
      searchTerm: ''
    });
  };

  // Clear specific filter
  const clearFilter = (key: keyof FilterState) => {
    setFilters(prev => ({
      ...prev,
      [key]: Array.isArray(prev[key]) ? [] : key === 'featured' ? null : ''
    }));
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.types.length > 0 ||
      filters.tiers.length > 0 ||
      filters.complexity.length > 0 ||
      filters.functions.length > 0 ||
      filters.functionGroups.length > 0 ||
      filters.tags.length > 0 ||
      filters.featured !== null ||
      filters.searchTerm.trim() !== ''
    );
  }, [filters]);

  // Get tools by function group
  const getToolsByFunctionGroup = (groupKey: string) => {
    return taxonomyManager.getToolsByFunctionGroup(tools, groupKey);
  };

  // Get tag color
  const getTagColor = (tag: string) => {
    return taxonomyManager.getTagColor(tag);
  };

  // Get type config
  const getTypeConfig = (type: string) => {
    return taxonomyManager.getTypeConfig(type);
  };

  // Get tier config
  const getTierConfig = (tier: string) => {
    return taxonomyManager.getTierConfig(tier);
  };

  // Get complexity config
  const getComplexityConfig = (complexity: string) => {
    return taxonomyManager.getComplexityConfig(complexity);
  };

  // Search tools
  const searchTools = (searchTerm: string) => {
    updateFilter('searchTerm', searchTerm);
  };

  // Get filter summary
  const getFilterSummary = () => {
    const activeFilters = [];
    
    if (filters.searchTerm) {
      activeFilters.push(`Search: "${filters.searchTerm}"`);
    }
    
    if (filters.types.length > 0) {
      activeFilters.push(`Types: ${filters.types.join(', ')}`);
    }
    
    if (filters.tiers.length > 0) {
      activeFilters.push(`Tiers: ${filters.tiers.join(', ')}`);
    }
    
    if (filters.complexity.length > 0) {
      activeFilters.push(`Complexity: ${filters.complexity.join(', ')}`);
    }
    
    if (filters.functions.length > 0) {
      activeFilters.push(`Functions: ${filters.functions.join(', ')}`);
    }
    
    if (filters.functionGroups.length > 0) {
      const groupNames = filters.functionGroups.map(key => 
        filterOptions?.functionGroupConfig[key]?.name || key
      );
      activeFilters.push(`Groups: ${groupNames.join(', ')}`);
    }
    
    if (filters.tags.length > 0) {
      activeFilters.push(`Tags: ${filters.tags.join(', ')}`);
    }
    
    if (filters.featured !== null) {
      activeFilters.push(`Featured: ${filters.featured ? 'Yes' : 'No'}`);
    }
    
    return activeFilters;
  };

  return {
    // State
    filters,
    filteredTools,
    filterOptions,
    isLoading,
    hasActiveFilters,
    
    // Actions
    updateFilter,
    toggleFilter,
    clearFilters,
    clearFilter,
    searchTools,
    
    // Helpers
    getToolsByFunctionGroup,
    getTagColor,
    getTypeConfig,
    getTierConfig,
    getComplexityConfig,
    getFilterSummary,
    
    // Computed
    resultCount: filteredTools.length,
    totalCount: tools.length
  };
} 