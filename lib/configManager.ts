/**
 * ZENO KB - Config Manager
 *
 * Centralized configuration management for the app, wrapping Redis config manager and providing higher-level config logic.
 * Used throughout the app for accessing and updating configuration data.
 *
 * Core to configuration logic in Zeno Knowledge Base.
 */
import type { ZenoAsset, ZenoConfig } from '../types/config';

import {
  getAppConfig as fetchAppConfig,
  getContentConfig as fetchContentConfig,
  getDataConfig as fetchDataConfig,
} from './redisConfigManager';

class ConfigManager {
  private appConfig: any;
  private contentConfig: any;
  private dataConfig?: ZenoConfig;
  private cache: Map<string, any> = new Map();

  // Async init method to load config from Redis
  async init() {
    try {
      const [app, content, data] = await Promise.all([
        fetchAppConfig(),
        fetchContentConfig(),
        fetchDataConfig(),
      ]);
      console.log('DEBUG: Loaded appConfig from Redis:', JSON.stringify(app, null, 2));
      console.log('DEBUG: Loaded contentConfig from Redis:', JSON.stringify(content, null, 2));
      console.log('DEBUG: Loaded dataConfig from Redis:', JSON.stringify(data, null, 2));
      this.appConfig = app;
      this.contentConfig = content;
      this.dataConfig = data as ZenoConfig;
    } catch (error) {
      console.warn('Failed to load config from Redis:', error);
    }
  }

  /**
   * Get application configuration
   */
  async getAppConfig(): Promise<any> {
    if (!this.appConfig) await this.init();
    return this.appConfig;
  }

  /**
   * Get content/text configuration
   */
  async getContentConfig(): Promise<any> {
    if (!this.contentConfig) await this.init();
    return this.contentConfig;
  }

  /**
   * Get data configuration
   */
  async getDataConfig(): Promise<ZenoConfig> {
    if (!this.dataConfig) await this.init();
    if (!this.dataConfig) throw new Error('dataConfig is not loaded');
    return this.dataConfig;
  }

  /**
   * Get text content by dot-notation path
   * Example: getText('pages.home.title') returns "Welcome to Zeno Knowledge Base"
   */
  async getText(path: string): Promise<string> {
    const cacheKey = `text:${path}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const keys = path.split('.');
    let value: any = await this.getContentConfig();

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
  async getNavigation(): Promise<any[]> {
    const cacheKey = 'navigation:sidebar';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const navigation = (await this.getAppConfig()).navigation.sidebar.sections.map((section: any) => ({
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
  async getTools(): Promise<ZenoAsset[]> {
    const dataConfig = await this.getDataConfig();
    return dataConfig.tools;
  }

  /**
   * Get categories data (dynamically generated from tools)
   */
  async getCategories(): Promise<any[]> {
    const cacheKey = 'categories:dynamic';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Import the generateCategoriesFromData function
    const { generateCategoriesFromData } = require('./mockData');
    const dataConfig = await this.getDataConfig();
    const categories = generateCategoriesFromData(dataConfig.tools);

    this.cache.set(cacheKey, categories);
    return categories;
  }

  /**
   * Get taxonomy configuration
   */
  async getTaxonomyConfig() {
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
  async getFunctionCategories(): Promise<string[]> {
    const dataConfig = await this.getDataConfig();
    // @ts-expect-error: functionCategories may not exist on ZenoConfig
    return dataConfig.functionCategories ?? [];
  }

  /**
   * Check if a feature is enabled
   */
  async isFeatureEnabled(feature: string): Promise<boolean> {
    const appConfig = await this.getAppConfig();
    const keys = feature.split('.');
    let value: any = appConfig.features;

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
  async getSetting(path: string): Promise<any> {
    const cacheKey = `setting:${path}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const appConfig = await this.getAppConfig();
    const keys = path.split('.');
    let value: any = appConfig;

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
  async getUIConfig() {
    const appConfig = await this.getAppConfig();
    return appConfig.ui;
  }

  /**
   * Get search configuration
   */
  async getSearchConfig() {
    const appConfig = await this.getAppConfig();
    return appConfig.search;
  }

  /**
   * Get limits configuration
   */
  async getLimits() {
    const appConfig = await this.getAppConfig();
    return appConfig.limits;
  }

  /**
   * Get featured tools (filtered from data)
   */
  async getFeaturedTools(): Promise<ZenoAsset[]> {
    const cacheKey = 'tools:featured';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const appConfig = await this.getAppConfig();
    const limit = appConfig.limits.featuredTools;
    const dataConfig = await this.getDataConfig();
    const featured = dataConfig.tools
      .filter(tool => tool.featured)
      .slice(0, limit);

    this.cache.set(cacheKey, featured);
    return featured;
  }

  /**
   * Get recent tools (sorted by date_added)
   */
  async getRecentTools(): Promise<ZenoAsset[]> {
    const cacheKey = 'tools:recent';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const appConfig = await this.getAppConfig();
    const limit = appConfig.limits.recentTools;
    const dataConfig = await this.getDataConfig();
    const recent = [...dataConfig.tools]
      .sort((a, b) => new Date(b.date_added ?? 0).getTime() - new Date(a.date_added ?? 0).getTime())
      .slice(0, limit);

    this.cache.set(cacheKey, recent);
    return recent;
  }

  /**
   * Get tools by category
   */
  async getToolsByCategory(categoryId: string): Promise<ZenoAsset[]> {
    // This would need category-to-tool mapping logic
    // For now, return all tools (implementation depends on categorization strategy)
    const dataConfig = await this.getDataConfig();
    return dataConfig.tools;
  }

  /**
   * Get tools by function
   */
  async getToolsByFunction(functionName: string): Promise<ZenoAsset[]> {
    const dataConfig = await this.getDataConfig();
    return dataConfig.tools.filter(tool => tool.function === functionName);
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string) {
    const dataConfig = await this.getDataConfig();
    // @ts-expect-error: users may not exist on ZenoConfig
    return (dataConfig.users ?? []).find((user: any) => user.id === userId);
  }

  /**
   * Get active announcements
   */
  async getActiveAnnouncements() {
    const now = new Date();
    const dataConfig = await this.getDataConfig();
    // @ts-expect-error: announcements may not exist on ZenoConfig
    return (dataConfig.announcements ?? []).filter((announcement: any) => {
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

// Export async factory for singleton instance
export const configManager = new ConfigManager();

// Export class for testing
export { ConfigManager }; 