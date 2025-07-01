/**
 * Feature flags configuration
 * Controls which features are enabled/disabled
 */

export const featureFlags = {
  /**
   * Enable/disable filter functionality
   * Set NEXT_PUBLIC_ENABLE_FILTERS=true in .env.local to enable
   */
  enableFilters: process.env.NEXT_PUBLIC_ENABLE_FILTERS === 'true',

  /**
   * Other feature flags can be added here
   */
  // enableAdvancedSearch: process.env.NEXT_PUBLIC_ENABLE_ADVANCED_SEARCH === 'true',
  // enableUserProfiles: process.env.NEXT_PUBLIC_ENABLE_USER_PROFILES === 'true',
} as const;

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
  return featureFlags[feature];
}

/**
 * Debug helper to log current feature flag status
 */
export function logFeatureFlags() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🚩 Feature Flags:', featureFlags);
  }
} 