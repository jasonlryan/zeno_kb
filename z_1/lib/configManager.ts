import type { 
  AppConfig, 
  ContentConfig, 
  DataConfig, 
  ConfigManager as IConfigManager,
  SidebarSection,
  Tool,
  Category
} from '../types/config';

import appConfigData from '../config/app-config.json';
import contentConfigData from '../config/content.json';
import dataConfigData from '../config/data.json';

/**
 * ConfigManager - Centralized configuration management
 * Provides type-safe access to all application configuration
 */
class ConfigManager implements IConfigManager {
  private appConfig: AppConfig;
  private contentConfig: ContentConfig;
  private dataConfig: DataConfig;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.appConfig = appConfigData as AppConfig;
    this.contentConfig = contentConfigData as ContentConfig;
    this.dataConfig = dataConfigData as DataConfig;
  }

  /**
   * Get application configuration
   */
  getAppConfig(): AppConfig {
    return this.appConfig;
  }

  /**
   * Get content/text configuration
   */
  getContentConfig(): ContentConfig {
    return this.contentConfig;
  }

  /**
   * Get data configuration
   */
  getDataConfig(): DataConfig {
    return this.dataConfig;
  }

  /**
   * Get text content by dot-notation path
   * Example: getText('pages.home.title') returns "Welcome to Zeno Knowledge Base"
   */
  getText(path: string): string {
    const cacheKey = `text:${path}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const keys = path.split('.');
    let value: any = this.contentConfig;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        console.warn(`Config path not found: ${path}`);
        return path; // Return the path as fallback
      }
    }

    if (typeof value === 'string') {
      this.cache.set(cacheKey, value);
      return value;
    }

    console.warn(`Config path does not resolve to string: ${path}`);
    return path;
  }

  /**
   * Get navigation configuration with icon mapping
   */
  getNavigation(): SidebarSection[] {
    const cacheKey = 'navigation:sidebar';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const navigation = this.appConfig.navigation.sidebar.sections.map(section => ({
      ...section,
      items: section.items.map(item => ({
        ...item,
        active: false // Will be set by consuming component
      }))
    }));

    this.cache.set(cacheKey, navigation);
    return navigation;
  }

  /**
   * Get tools data
   */
  getTools(): Tool[] {
    return this.dataConfig.tools;
  }

  /**
   * Get categories data
   */
  getCategories(): Category[] {
    return this.dataConfig.categories;
  }

  /**
   * Get function categories
   */
  getFunctionCategories(): string[] {
    return this.dataConfig.functionCategories;
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: string): boolean {
    const keys = feature.split('.');
    let value: any = this.appConfig.features;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return false;
      }
    }

    return Boolean(value);
  }

  /**
   * Get app setting by path
   */
  getSetting(path: string): any {
    const cacheKey = `setting:${path}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const keys = path.split('.');
    let value: any = this.appConfig;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    this.cache.set(cacheKey, value);
    return value;
  }

  /**
   * Get UI configuration
   */
  getUIConfig() {
    return this.appConfig.ui;
  }

  /**
   * Get search configuration
   */
  getSearchConfig() {
    return this.appConfig.search;
  }

  /**
   * Get limits configuration
   */
  getLimits() {
    return this.appConfig.limits;
  }

  /**
   * Get featured tools (filtered from data)
   */
  getFeaturedTools(): Tool[] {
    const cacheKey = 'tools:featured';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const limit = this.appConfig.limits.featuredTools;
    const featured = this.dataConfig.tools
      .filter(tool => tool.featured)
      .slice(0, limit);

    this.cache.set(cacheKey, featured);
    return featured;
  }

  /**
   * Get recent tools (sorted by date_added)
   */
  getRecentTools(): Tool[] {
    const cacheKey = 'tools:recent';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const limit = this.appConfig.limits.recentTools;
    const recent = [...this.dataConfig.tools]
      .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime())
      .slice(0, limit);

    this.cache.set(cacheKey, recent);
    return recent;
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(categoryId: string): Tool[] {
    // This would need category-to-tool mapping logic
    // For now, return all tools (implementation depends on categorization strategy)
    return this.dataConfig.tools;
  }

  /**
   * Get tools by function
   */
  getToolsByFunction(functionName: string): Tool[] {
    return this.dataConfig.tools.filter(tool => tool.function === functionName);
  }

  /**
   * Get user by ID
   */
  getUser(userId: string) {
    return this.dataConfig.users.find(user => user.id === userId);
  }

  /**
   * Get active announcements
   */
  getActiveAnnouncements() {
    const now = new Date();
    return this.dataConfig.announcements.filter(announcement => {
      if (!announcement.active) return false;
      
      const startDate = new Date(announcement.startDate);
      const endDate = new Date(announcement.endDate);
      
      return now >= startDate && now <= endDate;
    });
  }

  /**
   * Clear cache (useful for development or dynamic config updates)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const configManager = new ConfigManager();

// Export class for testing
export { ConfigManager }; 