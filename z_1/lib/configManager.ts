import type { ZenoAsset, ZenoConfig } from '../types/config';

import appConfigData from '../public/config/app-config.json';
import contentConfigData from '../public/config/content.json';
import dataConfigData from '../public/config/data.json';

/**
 * ConfigManager - Centralized configuration management
 * Provides type-safe access to all application configuration
 */
class ConfigManager {
  private appConfig: any;
  private contentConfig: any;
  private dataConfig: ZenoConfig;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.appConfig = appConfigData as any;
    this.contentConfig = contentConfigData as any;
    this.dataConfig = dataConfigData as ZenoConfig;
  }

  /**
   * Get application configuration
   */
  getAppConfig(): any {
    return this.appConfig;
  }

  /**
   * Get content/text configuration
   */
  getContentConfig(): any {
    return this.contentConfig;
  }

  /**
   * Get data configuration
   */
  getDataConfig(): ZenoConfig {
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
  getNavigation(): any[] {
    const cacheKey = 'navigation:sidebar';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const navigation = this.appConfig.navigation.sidebar.sections.map((section: any) => ({
      ...section,
      items: section.items.map((item: any) => ({
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
  getTools(): ZenoAsset[] {
    return this.dataConfig.tools;
  }

  /**
   * Get categories data (dynamically generated from tools)
   */
  getCategories(): any[] {
    const cacheKey = 'categories:dynamic';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Import the generateCategoriesFromData function
    const { generateCategoriesFromData } = require('./mockData');
    const categories = generateCategoriesFromData(this.dataConfig.tools);

    this.cache.set(cacheKey, categories);
    return categories;
  }

  /**
   * Get taxonomy configuration
   */
  getTaxonomyConfig() {
    try {
      return require('../public/config/taxonomy.json');
    } catch (error) {
      console.warn('Could not load taxonomy config:', error);
      return null;
    }
  }

  /**
   * Get function categories
   */
  getFunctionCategories(): string[] {
    // @ts-expect-error: functionCategories may not exist on ZenoConfig
    return this.dataConfig.functionCategories ?? [];
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
  getFeaturedTools(): ZenoAsset[] {
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
  getRecentTools(): ZenoAsset[] {
    const cacheKey = 'tools:recent';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const limit = this.appConfig.limits.recentTools;
    const recent = [...this.dataConfig.tools]
      .sort((a, b) => new Date(b.date_added ?? 0).getTime() - new Date(a.date_added ?? 0).getTime())
      .slice(0, limit);

    this.cache.set(cacheKey, recent);
    return recent;
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(categoryId: string): ZenoAsset[] {
    // This would need category-to-tool mapping logic
    // For now, return all tools (implementation depends on categorization strategy)
    return this.dataConfig.tools;
  }

  /**
   * Get tools by function
   */
  getToolsByFunction(functionName: string): ZenoAsset[] {
    return this.dataConfig.tools.filter(tool => tool.function === functionName);
  }

  /**
   * Get user by ID
   */
  getUser(userId: string) {
    // @ts-expect-error: users may not exist on ZenoConfig
    return (this.dataConfig.users ?? []).find((user: any) => user.id === userId);
  }

  /**
   * Get active announcements
   */
  getActiveAnnouncements() {
    const now = new Date();
    // @ts-expect-error: announcements may not exist on ZenoConfig
    return (this.dataConfig.announcements ?? []).filter((announcement: any) => {
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