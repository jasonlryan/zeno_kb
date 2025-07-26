import { useState, useEffect, useMemo, useCallback } from 'react';
import { ZenoConfig } from '../types/config';
import { useConfigContext } from '../lib/configContext';

interface AppConfig {
  [key: string]: any;
}

interface ContentConfig {
  [key: string]: any;
}

interface ConfigHook {
  appConfig: AppConfig | null;
  contentConfig: ContentConfig | null;
  dataConfig: ZenoConfig | null;
  loading: boolean;
  error: string | null;
}

export function useConfig(): ConfigHook {
  const { appConfig, contentConfig, dataConfig, loading, error } = useConfigContext();
  
  return useMemo(() => ({ 
    appConfig, 
    contentConfig, 
    dataConfig, 
    loading, 
    error 
  }), [appConfig, contentConfig, dataConfig, loading, error]);
}

/**
 * Hook for accessing navigation configuration
 */
export function useNavigation() {
  const { appConfig, loading } = useConfigContext();
  
  const navigation = useMemo(() => {
    return appConfig?.navigation?.sidebar?.sections || [];
  }, [appConfig]);

  return { navigation, loading };
}

/**
 * Hook for accessing tools data with various filtering methods
 */
export function useTools() {
  const { dataConfig, loading } = useConfigContext();
  
  const tools = useMemo(() => {
    return dataConfig?.tools || [];
  }, [dataConfig]);

  // Helper functions for filtering tools
  const getFeaturedTools = useCallback(() => tools.filter(tool => tool.featured), [tools]);
  const getRecentTools = useCallback(() => {
    return tools
      .filter(tool => tool.date_added)
      .sort((a, b) => new Date(b.date_added!).getTime() - new Date(a.date_added!).getTime())
      .slice(0, 10);
  }, [tools]);
  const getToolsByFunction = useCallback((functionName: string) => {
    return tools.filter(tool => 
      tool.categories?.includes(functionName) || 
      tool.function === functionName
    );
  }, [tools]);
  const getToolsByCategory = useCallback((categoryId: string) => {
    return tools.filter(tool => 
      tool.categories?.includes(categoryId)
    );
  }, [tools]);

  return useMemo(() => ({
    all: tools,
    featured: getFeaturedTools(),
    recent: getRecentTools(),
    byFunction: getToolsByFunction,
    byCategory: getToolsByCategory,
    loading
  }), [tools, getFeaturedTools, getRecentTools, getToolsByFunction, getToolsByCategory, loading]);
}

/**
 * Hook for accessing categories data
 */
export function useCategories() {
  const { dataConfig, loading } = useConfigContext();
  
  const categories = useMemo(() => {
    const tools = dataConfig?.tools || [];
    const tagCategories = dataConfig?.tagCategories || {};
    
    // Convert tagCategories object to array and count tools for each
    return Object.values(tagCategories).map((categoryDef: any) => {
      // Count tools that have any of this category's tags
      const toolCount = tools.filter((tool: any) => {
        if (!Array.isArray(tool.tags)) return false;
        return tool.tags.some((tag: string) => 
          categoryDef.tags.includes(tag)
        );
      }).length;

      return {
        id: categoryDef.id,
        title: categoryDef.name,
        icon: categoryDef.icon,
        description: `${toolCount} tools`,
        count: toolCount,
        color: categoryDef.color
      };
    });
  }, [dataConfig]);

  return categories;
}

/**
 * Hook for accessing UI configuration
 */
export function useUIConfig() {
  // This hook will need to be refactored to fetch UI config from an API endpoint
  // For now, it will remain a placeholder.
  return {
    // Placeholder
  };
}

/**
 * Hook for accessing search configuration
 */
export function useSearchConfig() {
  // This hook will need to be refactored to fetch search config from an API endpoint
  // For now, it will remain a placeholder.
  return {
    // Placeholder
  };
}

/**
 * Hook for accessing page content
 */
export function usePageContent(page: keyof ContentConfig['pages']) {
  // This hook will need to be refactored to fetch page content from an API endpoint
  // For now, it will remain a placeholder.
  return {
    // Placeholder
  };
}

/**
 * Hook for accessing component-specific content
 */
export function useComponentContent(component: string) {
  const { contentConfig, loading } = useConfigContext();
  
  const content = useMemo(() => {
    if (!contentConfig) return null;
    
    const componentContent = contentConfig.components?.[component] || {};
    
    // Provide fallback content for common components if not found
    if (Object.keys(componentContent).length === 0) {
      const fallbackContent: { [key: string]: any } = {
        toolCard: {
          labels: {
            tier: "Tier:",
            complexity: "Complexity:",
            type: "Type:"
          },
          actions: {
            view: "View Details",
            save: "Save",
            unsave: "Unsave"
          }
        }
      };
      return fallbackContent[component] || {};
    }
    
    return componentContent;
  }, [contentConfig, component]);

  return content;
}

/**
 * Hook for accessing announcements
 */
export function useAnnouncements() {
  // This hook will need to be refactored to fetch announcements from an API endpoint
  // For now, it will remain a placeholder.
  return {
    // Placeholder
  };
}

/**
 * Hook for accessing feature flags
 */
export function useFeatures() {
  // This hook will need to be refactored to fetch feature flags from an API endpoint
  // For now, it will remain a placeholder.
  return {
    // Placeholder
  };
}

/**
 * Hook for accessing app limits
 */
export function useLimits() {
  // This hook will need to be refactored to fetch limits from an API endpoint
  // For now, it will remain a placeholder.
  return {
    // Placeholder
  };
}

/**
 * Hook for text content with interpolation support
 * Usage: const text = useText('pages.home.title', { name: 'John' })
 */
export function useText(path: string, variables?: Record<string, string | number>) {
  const { contentConfig } = useConfigContext();
  
  return useMemo(() => {
    // Try to get text from content config first
    if (contentConfig) {
      const pathParts = path.split('.');
      let current: any = contentConfig;
      
      for (const part of pathParts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          current = null;
          break;
        }
      }
      
      if (typeof current === 'string') {
        // Simple variable interpolation if needed
        if (variables) {
          return Object.entries(variables).reduce((text, [key, value]) => {
            return text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
          }, current);
        }
        return current;
      }
    }
    
    // Fallback to defaults
    const defaults: Record<string, string> = {
      'pages.home.sections.categories.title': 'Browse by Category',
      'pages.home.title': 'Welcome to Zeno Knowledge Hub',
      'pages.search.title': 'Search Results',
    };
    
    return defaults[path] || path.split('.').pop() || 'Content';
  }, [contentConfig, path, variables]);
}

/**
 * Hook for form validation messages
 */
export function useValidation() {
  // This hook will need to be refactored to fetch validation messages from an API endpoint
  // For now, it will remain a placeholder.
  return {
    // Placeholder
  };
}

/**
 * Hook for form action labels
 */
export function useFormActions() {
  // This hook will need to be refactored to fetch form action labels from an API endpoint
  // For now, it will remain a placeholder.
  return {
    // Placeholder
  };
} 