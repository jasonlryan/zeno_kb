import { useState, useEffect, useMemo } from 'react';
import { configManager } from '../lib/configManager';
import type { 
  AppConfig, 
  ContentConfig, 
  DataConfig, 
  SidebarSection,
  Tool,
  Category 
} from '../types/config';

/**
 * Hook for accessing application configuration
 * Provides memoized access to all config data
 */
export function useConfig() {
  const appConfig = useMemo(() => configManager.getAppConfig(), []);
  const contentConfig = useMemo(() => configManager.getContentConfig(), []);
  const dataConfig = useMemo(() => configManager.getDataConfig(), []);

  return {
    app: appConfig,
    content: contentConfig,
    data: dataConfig,
    
    // Convenience methods
    getText: (path: string) => configManager.getText(path),
    getSetting: (path: string) => configManager.getSetting(path),
    isFeatureEnabled: (feature: string) => configManager.isFeatureEnabled(feature),
  };
}

/**
 * Hook for accessing navigation configuration
 */
export function useNavigation() {
  const [navigation, setNavigation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    configManager.getNavigation().then((nav) => {
      if (mounted) {
        setNavigation(nav || []);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  return { navigation, loading };
}

/**
 * Hook for accessing tools data
 */
export function useTools() {
  return useMemo(() => ({
    all: configManager.getTools(),
    featured: configManager.getFeaturedTools(),
    recent: configManager.getRecentTools(),
    byFunction: (functionName: string) => configManager.getToolsByFunction(functionName),
    byCategory: (categoryId: string) => configManager.getToolsByCategory(categoryId),
  }), []);
}

/**
 * Hook for accessing categories data
 */
export function useCategories() {
  return useMemo(() => configManager.getCategories(), []);
}

/**
 * Hook for accessing UI configuration
 */
export function useUIConfig() {
  return useMemo(() => configManager.getUIConfig(), []);
}

/**
 * Hook for accessing search configuration
 */
export function useSearchConfig() {
  return useMemo(() => configManager.getSearchConfig(), []);
}

/**
 * Hook for accessing page content
 */
export function usePageContent(page: keyof ContentConfig['pages']) {
  return useMemo(() => {
    const content = configManager.getContentConfig();
    return content.pages[page];
  }, [page]);
}

/**
 * Hook for accessing component content
 */
export function useComponentContent(component: keyof ContentConfig['components']) {
  return useMemo(() => {
    const content = configManager.getContentConfig();
    return content.components[component];
  }, [component]);
}

/**
 * Hook for accessing announcements
 */
export function useAnnouncements() {
  return useMemo(() => configManager.getActiveAnnouncements(), []);
}

/**
 * Hook for accessing feature flags
 */
export function useFeatures() {
  return useMemo(() => ({
    aiChat: configManager.isFeatureEnabled('aiChat.enabled'),
    accessControl: configManager.isFeatureEnabled('accessControl.enabled'),
    scheduling: configManager.isFeatureEnabled('scheduling.enabled'),
    feedback: configManager.isFeatureEnabled('feedback.enabled'),
  }), []);
}

/**
 * Hook for accessing app limits
 */
export function useLimits() {
  return useMemo(() => configManager.getLimits(), []);
}

/**
 * Hook for text content with interpolation support
 * Usage: const text = useText('pages.home.title', { name: 'John' })
 */
export function useText(path: string, variables?: Record<string, string | number>) {
  return useMemo(() => {
    let text = configManager.getText(path);
    
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        text = text.replace(new RegExp(`{${key}}`, 'g'), String(value));
      });
    }
    
    return text;
  }, [path, variables]);
}

/**
 * Hook for form validation messages
 */
export function useValidation() {
  return useMemo(() => {
    const content = configManager.getContentConfig();
    return content.forms.validation;
  }, []);
}

/**
 * Hook for form action labels
 */
export function useFormActions() {
  return useMemo(() => {
    const content = configManager.getContentConfig();
    return content.forms.actions;
  }, []);
} 