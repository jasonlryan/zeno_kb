import { useState, useEffect } from 'react';
import { ZenoConfig } from '../types/config';

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
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [contentConfig, setContentConfig] = useState<ContentConfig | null>(null);
  const [dataConfig, setDataConfig] = useState<ZenoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfigs() {
      try {
        setLoading(true);
        setError(null);

        const [appRes, contentRes, dataRes] = await Promise.all([
          fetch('/api/config/app'),
          fetch('/api/config/content'),
          fetch('/api/config/data')
        ]);

        if (!appRes.ok || !contentRes.ok || !dataRes.ok) {
          throw new Error('Failed to fetch configs');
        }

        const [app, content, data] = await Promise.all([
          appRes.json(),
          contentRes.json(),
          dataRes.json()
        ]);

        setAppConfig(app);
        setContentConfig(content);
        setDataConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load config');
        console.error('Config loading error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchConfigs();
  }, []);

  return { appConfig, contentConfig, dataConfig, loading, error };
}

/**
 * Hook for accessing navigation configuration
 */
export function useNavigation() {
  const [navigation, setNavigation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function fetchNavigation() {
      try {
        const response = await fetch('/api/config/app');
        if (!response.ok) {
          throw new Error('Failed to fetch app config');
        }
        const appConfig = await response.json();
        
        if (mounted && appConfig.navigation?.sidebar?.sections) {
          setNavigation(appConfig.navigation.sidebar.sections);
        }
      } catch (error) {
        console.error('Failed to load navigation:', error);
        if (mounted) {
          setNavigation([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchNavigation();
    
    return () => { 
      mounted = false; 
    };
  }, []);

  return { navigation, loading };
}

/**
 * Hook for accessing tools data with various filtering methods
 */
export function useTools() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function fetchTools() {
      try {
        const response = await fetch('/api/config/data');
        if (!response.ok) {
          throw new Error('Failed to fetch data config');
        }
        const dataConfig = await response.json();
        
        if (mounted) {
          const toolsArray = dataConfig.tools || [];
          setTools(toolsArray);
        }
      } catch (error) {
        console.error('Failed to load tools:', error);
        if (mounted) {
          setTools([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchTools();
    
    return () => { 
      mounted = false; 
    };
  }, []);

  // Helper functions for filtering tools
  const getFeaturedTools = () => tools.filter(tool => tool.featured);
  const getRecentTools = () => {
    return tools
      .filter(tool => tool.date_added)
      .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime())
      .slice(0, 10);
  };
  const getToolsByFunction = (functionName: string) => {
    return tools.filter(tool => 
      tool.categories?.includes(functionName) || 
      tool.function === functionName
    );
  };
  const getToolsByCategory = (categoryId: string) => {
    return tools.filter(tool => 
      tool.categories?.includes(categoryId)
    );
  };

  return {
    all: tools,
    featured: getFeaturedTools(),
    recent: getRecentTools(),
    byFunction: getToolsByFunction,
    byCategory: getToolsByCategory,
    loading
  };
}

/**
 * Hook for accessing categories data
 */
export function useCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function fetchCategories() {
      try {
        const [dataResponse, taxonomyResponse] = await Promise.all([
          fetch('/api/config/data'),
          fetch('/api/config/taxonomy')
        ]);
        
        if (!dataResponse.ok || !taxonomyResponse.ok) {
          throw new Error('Failed to fetch config data');
        }
        
        const [dataConfig, taxonomyConfig] = await Promise.all([
          dataResponse.json(),
          taxonomyResponse.json()
        ]);
        
        if (mounted) {
          // Generate categories from function categories in taxonomy
          const functionGroups = taxonomyConfig.functionCategories?.groups || {};
          const generatedCategories = Object.entries(functionGroups).map(([key, group]: [string, any]) => ({
            id: key,
            title: group.name,
            icon: group.icon,
            description: `${group.functions?.length || 0} functions`,
            count: dataConfig.tools?.filter((tool: any) => 
              group.functions?.some((func: string) => 
                tool.categories?.includes(func)
              )
            ).length || 0,
            color: group.color
          }));
          
          setCategories(generatedCategories);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        if (mounted) {
          // Provide fallback categories
          const fallbackCategories = [
            {
              id: "strategy",
              title: "Strategy & Analysis",
              icon: "🎯",
              description: "Strategic planning and analysis tools",
              count: 0,
              color: "#F97316"
            },
            {
              id: "content",
              title: "Content & Creative",
              icon: "✍️",
              description: "Content creation and creative tools",
              count: 0,
              color: "#EC4899"
            },
            {
              id: "data",
              title: "Data & Intelligence",
              icon: "📊",
              description: "Data analysis and intelligence tools",
              count: 0,
              color: "#6366F1"
            }
          ];
          setCategories(fallbackCategories);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchCategories();
    
    return () => { 
      mounted = false; 
    };
  }, []);

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
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function fetchComponentContent() {
      try {
        const response = await fetch('/api/config/content');
        if (!response.ok) {
          throw new Error('Failed to fetch content config');
        }
        const contentConfig = await response.json();
        
        if (mounted) {
          const componentContent = contentConfig.components?.[component] || {};
          setContent(componentContent);
        }
      } catch (error) {
        console.error('Failed to load component content:', error);
        if (mounted) {
          // Provide fallback content for common components
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
          setContent(fallbackContent[component] || {});
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchComponentContent();
    
    return () => { 
      mounted = false; 
    };
  }, [component]);

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
  // This hook will need to be refactored to fetch text content from an API endpoint
  // For now, it will remain a placeholder.
  return 'Loading...'; // Placeholder
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